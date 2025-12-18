import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", authMiddleware, (req, res) => {
  res.json({ msg: "Welcome to protected dashboard", userId: req.user.id });
});

export default router;
