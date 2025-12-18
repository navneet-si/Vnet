import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/DB.js";
import protectedRoutes from "./routes/protected.js";


dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

import signupRoutes from "./routes/signup.js";
import loginRoutes from "./routes/login.js";

app.use("/api/protected", protectedRoutes);
app.use("/api/signup", signupRoutes);
app.use("/api/login", loginRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
