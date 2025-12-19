import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";

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
    res.json(user);
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
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select("-password")
      .limit(5);
    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
