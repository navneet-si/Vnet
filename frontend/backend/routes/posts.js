import express from "express";
import multer from "multer";
import path from "path";
import fs from 'fs';
import { fileURLToPath } from 'url'; // Needed to safely locate folders
import Post from "../models/Post.js"; 
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// 1. SAFE DIRECTORY SETUP
// This ensures we always find the 'uploads' folder relative to this file, 
// no matter where you run the server from.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Go up one level from 'routes' to get to 'backend' root, then into 'uploads'
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure directory exists
if (!fs.existsSync(UPLOADS_DIR)){
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// 2. MULTER CONFIG
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR); // Use the absolute path we calculated above
  },
  filename: (req, file, cb) => {
    // Clean filename: remove spaces, use timestamp
    const cleanName = file.originalname.replace(/\s+/g, '_');
    cb(null, Date.now() + '-' + cleanName);
  },
});

const upload = multer({ storage });

// 3. CREATE POST
router.post(
  "/", 
  authMiddleware, 
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'file', maxCount: 1 }
  ]), 
  async (req, res) => {
    try {
      const { content } = req.body;
      const userId = req.user.id || req.user._id;

      // 🔴 FIX: Construct the FULL URL (http://localhost:5000/uploads/...)
      // This saves the "Real" link to the database, so the frontend doesn't have to guess.
      const protocol = req.protocol;
      const host = req.get('host'); // e.g., "localhost:5000"
      const baseUrl = `${protocol}://${host}/uploads/`;

      const imageUrl = req.files['image'] 
        ? `${baseUrl}${req.files['image'][0].filename}` 
        : "";
        
      const videoUrl = req.files['video'] 
        ? `${baseUrl}${req.files['video'][0].filename}` 
        : "";
        
      const fileUrl = req.files['file'] 
        ? `${baseUrl}${req.files['file'][0].filename}` 
        : "";

      const newPost = new Post({
        userId,
        content,
        imageUrl,
        videoUrl,
        fileUrl,
        likes: []
      });

      const savedPost = await newPost.save();
      res.status(201).json(savedPost);
    } catch (err) {
      console.error("Upload Error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// 4. DELETE POST
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.userId.toString() !== req.user.id && post.userId.toString() !== req.user._id) {
      return res.status(401).json({ error: "You can only delete your own posts" });
    }

    // Helper to delete file from disk
    const deleteFile = (fileUrl) => {
        if (!fileUrl) return;
        
        // Extract filename from the full URL
        // URL is: http://localhost:5000/uploads/filename.jpg
        // We split by '/' and take the last part
        const filename = fileUrl.split('/').pop();
        const fullPath = path.join(UPLOADS_DIR, filename);
        
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log("Deleted file:", filename);
        }
    };

    deleteFile(post.imageUrl);
    deleteFile(post.videoUrl);
    deleteFile(post.fileUrl);

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post has been deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;