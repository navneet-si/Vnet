import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: { type: String, default: "" },
    bio: { type: String, default: "" },
    location: { type: String, default: "" },

    // 👥 Social feature (collaborator)
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // 🔐 Forgot Password feature (your work)
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
