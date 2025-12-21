import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
},
{ timestamps: true });

export default mongoose.model("Message", MessageSchema);

