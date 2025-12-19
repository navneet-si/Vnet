import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Message from "../models/Message.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";

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

// Save a message
router.post("/messages", authMiddleware, async (req, res) => {
  try {
    const { roomId, receiverId, text } = req.body;
    
    if (!roomId || !receiverId || !text) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const message = new Message({
      roomId,
      senderId: req.user.id,
      receiverId,
      text
    });

    await message.save();
    res.json({ msg: "Message saved", message });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get message history for a chat room
router.get("/messages/:roomId", authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const messages = await Message.find({ roomId })
      .populate("senderId", "username")
      .sort({ createdAt: 1 })
      .limit(100);

    // Format messages for frontend
    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      text: msg.text,
      sender: msg.senderId._id.toString() === req.user.id ? "me" : "other",
      timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: msg.createdAt
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get list of users you have messaged with (chat conversations)
router.get("/chat-users", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    
    // Find all messages where current user is sender or receiver
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId },
        { receiverId: currentUserId }
      ]
    })
    .populate("senderId", "username role")
    .populate("receiverId", "username role")
    .sort({ createdAt: -1 });

    // Get unique user IDs that current user has messaged with
    const chatUserIds = new Set();
    messages.forEach(msg => {
      const senderId = msg.senderId._id.toString();
      const receiverId = msg.receiverId._id.toString();
      if (senderId === currentUserId) {
        chatUserIds.add(receiverId);
      } else {
        chatUserIds.add(senderId);
      }
    });

    // Fetch user details for all chat users
    const chatUsers = await User.find({ _id: { $in: Array.from(chatUserIds) } })
      .select("-password");

    // Add isFollowing status
    const currentUser = await User.findById(currentUserId);
    const chatUsersWithStatus = chatUsers.map(user => {
      const isFollowing = currentUser.followers && currentUser.followers.some(
        id => id.toString() === user._id.toString()
      );
      return {
        ...user.toObject(),
        isFollowing: isFollowing || false
      };
    });

    res.json(chatUsersWithStatus);
  } catch (error) {
    console.error("Error fetching chat users:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Create a new post (with file upload support)
router.post("/posts", authMiddleware, upload.fields([{ name: "image", maxCount: 1 }, { name: "video", maxCount: 1 }, { name: "file", maxCount: 1 }]), async (req, res) => {
  try {
    const { content, imageUrl, videoUrl, fileUrl } = req.body;
    
    if (!content || content.trim() === "") {
      return res.status(400).json({ msg: "Post content is required" });
    }

    let finalImageUrl = imageUrl || "";
    let finalVideoUrl = videoUrl || "";
    let finalFileUrl = fileUrl || "";

    // Handle uploaded files
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        finalImageUrl = `http://localhost:5000/uploads/${req.files.image[0].filename}`;
      }
      if (req.files.video && req.files.video[0]) {
        finalVideoUrl = `http://localhost:5000/uploads/${req.files.video[0].filename}`;
      }
      if (req.files.file && req.files.file[0]) {
        finalFileUrl = `http://localhost:5000/uploads/${req.files.file[0].filename}`;
      }
    }

    const post = new Post({
      userId: req.user.id,
      content: content.trim(),
      imageUrl: finalImageUrl,
      videoUrl: finalVideoUrl,
      fileUrl: finalFileUrl,
      likes: []
    });

    await post.save();
    const postWithUser = await Post.findById(post._id).populate("userId", "username role");
    
    res.json({ msg: "Post created", post: postWithUser });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get all posts (feed)
router.get("/posts", authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "username role")
      .sort({ createdAt: -1 })
      .limit(50);

    // Get comments count for each post
    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const commentsCount = await Comment.countDocuments({ postId: post._id });
        const isLiked = post.likes.some(
          id => id.toString() === req.user.id.toString()
        );
        
        return {
          _id: post._id,
          userId: post.userId,
          content: post.content,
          imageUrl: post.imageUrl,
          videoUrl: post.videoUrl,
          likesCount: post.likes.length,
          isLiked: isLiked,
          commentsCount: commentsCount,
          createdAt: post.createdAt
        };
      })
    );

    res.json(postsWithComments);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Like/Unlike a post
router.post("/posts/:id/like", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const userId = req.user.id;
    const isLiked = post.likes.some(id => id.toString() === userId.toString());

    if (isLiked) {
      // Unlike
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();
    res.json({ 
      msg: isLiked ? "Post unliked" : "Post liked",
      likesCount: post.likes.length,
      isLiked: !isLiked
    });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Add a comment to a post
router.post("/posts/:id/comment", authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim() === "") {
      return res.status(400).json({ msg: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const comment = new Comment({
      postId: req.params.id,
      userId: req.user.id,
      text: text.trim()
    });

    await comment.save();
    const commentWithUser = await Comment.findById(comment._id)
      .populate("userId", "username role");

    res.json({ msg: "Comment added", comment: commentWithUser });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get comments for a post
router.get("/posts/:id/comments", authMiddleware, async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.id })
      .populate("userId", "username role")
      .sort({ createdAt: 1 })
      .limit(100);

    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
