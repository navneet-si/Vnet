import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/DB.js";
import protectedRoutes from "./routes/protected.js";
import forgotPasswordRoutes from "./routes/forgotPassword.js";
import resetPasswordRoutes from "./routes/resetPassword.js";
import signupRoutes from "./routes/signup.js";
import loginRoutes from "./routes/login.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// -------------------- FILE UPLOADS --------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------- API ROUTES --------------------
app.use("/api/forgot-password", forgotPasswordRoutes);
app.use("/api/reset-password", resetPasswordRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/signup", signupRoutes);
app.use("/api/login", loginRoutes);

// -------------------- SERVER --------------------
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

// -------------------- SOCKET.IO --------------------
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// 🔴 Track online users
const onlineUsers = new Map(); // socketId -> userId

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  // 🟢 User comes online
  socket.on("user_online", (userId) => {
    if (!userId) return;
    onlineUsers.set(socket.id, userId);

    io.emit("online_users", Array.from(new Set(onlineUsers.values())));
    console.log("🟢 User online:", userId);
  });

  // 💬 Join chat room
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`📦 Socket ${socket.id} joined room ${roomId}`);
  });

  // 📤 Send message
  socket.on("send_message", (data) => {
    if (!data?.roomId) return;

    socket.to(data.roomId).emit("receive_message", {
      id: data.id,
      text: data.text,
      sender: "other",
      timestamp: data.timestamp,
      roomId: data.roomId,
    });

    console.log(`💬 Message in ${data.roomId}:`, data.text);
  });

  // 🔴 User disconnects
  socket.on("disconnect", () => {
    const userId = onlineUsers.get(socket.id);
    onlineUsers.delete(socket.id);

    io.emit("online_users", Array.from(new Set(onlineUsers.values())));
    console.log("🔴 Socket disconnected:", socket.id, "User:", userId);
  });
});

// -------------------- START SERVER --------------------
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
