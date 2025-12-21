import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

// ... imports (routes, DB) ...
import connectDB from "./config/DB.js";
import protectedRoutes from "./routes/protected.js";
import forgotPasswordRoutes from "./routes/forgotPassword.js";
import resetPasswordRoutes from "./routes/resetPassword.js";
import signupRoutes from "./routes/signup.js";
import loginRoutes from "./routes/login.js";
import postRoutes from "./routes/posts.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// -------------------- 🔴 FIX: ROBUST FILE PATHS --------------------
// This calculates the EXACT path to your backend folder, regardless of where you run the command
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Print the path to the console so you can verify it
const uploadsPath = path.join(__dirname, "uploads");
console.log("📂 Serving static files from:", uploadsPath);

app.use("/uploads", express.static(uploadsPath));
// -------------------------------------------------------------------

// -------------------- API ROUTES --------------------
app.use("/api/forgot-password", forgotPasswordRoutes);
app.use("/api/reset-password", resetPasswordRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/signup", signupRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/posts", postRoutes);

// -------------------- SOCKET.IO SETUP --------------------
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`👤 User ${socket.id} joined room: ${roomId}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.conversationId).emit("receive_message", data);
    console.log("📨 Message sent to room:", data.conversationId);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
