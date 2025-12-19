import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/DB.js";
import protectedRoutes from "./routes/protected.js";
import forgotPasswordRoutes from "./routes/forgotPassword.js";
import resetPasswordRoutes from "./routes/resetPassword.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

import signupRoutes from "./routes/signup.js";
import loginRoutes from "./routes/login.js";

app.use("/api/forgot-password", forgotPasswordRoutes);
app.use("/api/reset-password", resetPasswordRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/signup", signupRoutes);
app.use("/api/login", loginRoutes);

const PORT = process.env.PORT || 5000;

// Create HTTP server and Socket.IO server
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Vite default port
    methods: ["GET", "POST"]
  }
});

// Basic Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join a room (chat)
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // Handle sending messages
  socket.on("send_message", (data) => {
    // Broadcast message to all users in the room except sender
    socket.to(data.roomId).emit("receive_message", {
      id: data.id,
      text: data.text,
      sender: "other",
      timestamp: data.timestamp,
      roomId: data.roomId
    });
    console.log(`Message sent in room ${data.roomId}:`, data.text);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
