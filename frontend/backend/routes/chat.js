import express from "express";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

const router = express.Router();

// 1. Create or Get existing conversation
router.post("/", async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    // Check if conversation already exists between these two users
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (conversation) {
      return res.status(200).json(conversation);
    }

    // If not, create a new one
    const newConversation = new Conversation({
      participants: [senderId, receiverId],
    });

    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. Get all conversations for a specific user
router.get("/conversations/:userId", async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: { $in: [req.params.userId] },
    }).populate("participants", "username bio"); // Get partner details
    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. Get messages for a specific conversation
router.get("/messages/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;