import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

const router = express.Router();

router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ msg: "Welcome to protected dashboard", userId: req.user.id });
});

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    const followersCount = user.followers ? user.followers.length : 0;
    res.json({ ...user.toObject(), followersCount });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { username, role, bio, location } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    if (username) user.username = username;
    if (role !== undefined) user.role = role;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    await user.save();
    res.json({ msg: "Profile updated", user: await User.findById(req.user.id).select("-password") });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/suggested-users", authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select("-password")
      .limit(5);
    
    const usersWithFollowStatus = users.map(user => {
      const isFollowing = user.followers && user.followers.some(
        id => id.toString() === currentUser._id.toString()
      );
      return {
        ...user.toObject(),
        isFollowing: isFollowing || false
      };
    });
    
    res.json(usersWithFollowStatus);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/follow/:userId", authMiddleware, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    
    if (!targetUser) {
      return res.status(404).json({ msg: "User not found" });
    }
    
    if (!targetUser.followers) {
      targetUser.followers = [];
    }
    
    const isAlreadyFollowing = targetUser.followers.some(
      id => id.toString() === req.user.id.toString()
    );
    
    if (!isAlreadyFollowing) {
      targetUser.followers.push(req.user.id);
      await targetUser.save();
      
      const currentUser = await User.findById(req.user.id);
      const notification = new Notification({
        userId: req.params.userId,
        message: `${currentUser.username} started following you`
      });
      await notification.save();
    }
    
    const updatedUser = await User.findById(req.params.userId).select("-password");
    const followersCount = updatedUser.followers ? updatedUser.followers.length : 0;
    
    res.json({ msg: "Followed successfully", followersCount });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/unfollow/:userId", authMiddleware, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    
    if (!targetUser) {
      return res.status(404).json({ msg: "User not found" });
    }
    
    if (!targetUser.followers) {
      targetUser.followers = [];
    }
    
    targetUser.followers = targetUser.followers.filter(
      id => id.toString() !== req.user.id
    );
    await targetUser.save();
    
    res.json({ msg: "Unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/followers", authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser || !currentUser.followers || currentUser.followers.length === 0) {
      return res.json([]);
    }
    
    const followers = await User.find({ _id: { $in: currentUser.followers } })
      .select("-password");
    
    const followersWithStatus = followers.map(follower => {
      const isFollowing = follower.followers && follower.followers.some(
        id => id.toString() === currentUser._id.toString()
      );
      return {
        ...follower.toObject(),
        isFollowing: isFollowing || false
      };
    });
    
    res.json(followersWithStatus);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/notifications", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.put("/notifications/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.userId.toString() !== req.user.id.toString()) {
      return res.status(404).json({ msg: "Notification not found" });
    }
    notification.read = true;
    await notification.save();
    res.json({ msg: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
