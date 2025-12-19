import { Search, BellRing, User, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function NavBar({ isVisible }) {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const postModalRef = useRef(null);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postImageUrl, setPostImageUrl] = useState("");
  const [postVideoUrl, setPostVideoUrl] = useState("");
  const [postFileUrl, setPostFileUrl] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadType, setUploadType] = useState("url"); // "url" or "file"

  // Dummy user data (replace later with real user context / API)
  const user = {
    name: "Utkarsh Raj",
    email: "utkarsh@example.com",
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setShowLogoutConfirm(false);
    navigate("/login");
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      alert("Please enter post content");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("content", postContent);
      
      // Add URLs if provided
      if (postImageUrl) formData.append("imageUrl", postImageUrl);
      if (postVideoUrl) formData.append("videoUrl", postVideoUrl);
      if (postFileUrl) formData.append("fileUrl", postFileUrl);
      
      // Add files if selected
      if (selectedImage) formData.append("image", selectedImage);
      if (selectedVideo) formData.append("video", selectedVideo);
      if (selectedFile) formData.append("file", selectedFile);

      const res = await fetch("http://localhost:5000/api/protected/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setPostContent("");
        setPostImageUrl("");
        setPostVideoUrl("");
        setPostFileUrl("");
        setSelectedImage(null);
        setSelectedVideo(null);
        setSelectedFile(null);
        setShowPostModal(false);
        // Refresh the page to show new post
        window.location.reload();
      } else {
        alert(data.msg || "Error creating post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error creating post");
    }
  };

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowLogoutConfirm(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowLogoutConfirm(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <div
        className={`
          fixed top-0 left-0 w-full z-50 px-6 py-4
          flex justify-between items-center
          bg-[#1C1C1E] border-b border-white/5 shadow-xl shadow-black/50
          transition-transform duration-300 ease-in-out
          ${isVisible ? "translate-y-0" : "-translate-y-full"}
        `}
      >
        {/* Logo */}
        <div className="px-2 text-[#1851ec] font-bold text-3xl">
          Vnet.
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Create Post Button */}
          <button
            onClick={() => setShowPostModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            + Create Post
          </button>

          {/* Search */}
          <div className="flex items-center">
            <Search className="mr-1" />
            <input
              type="text"
              className="ring-2 ring-blue-800 px-3 py-1 rounded-2xl text-[#E5E7EB] bg-transparent outline-none"
              placeholder="Need Something?"
            />
          </div>

          {/* Notifications */}
          <BellRing className="cursor-pointer" />

          {/* User Icon */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="border rounded-full p-2 hover:bg-white/10"
          >
            <User />
          </button>
        </div>
      </div>

      {/* LOGOUT / PROFILE MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-999 flex items-center justify-center bg-black/70"
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.85, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 40, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-[#111] border border-white/10 rounded-xl p-6 w-[90%] max-w-sm text-center"
            >
              {/* User Info */}
              <div className="mb-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                  {user.name[0]}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-white">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>

              <p className="text-gray-300 mb-6">
                Do you want to log out?
              </p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                >
                  <LogOut size={16} />
                  Yes
                </button>

                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
                >
                  No
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE POST MODAL */}
      <AnimatePresence>
        {showPostModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-999 flex items-center justify-center bg-black/70"
            onClick={() => setShowPostModal(false)}
          >
            <motion.div
              ref={postModalRef}
              initial={{ scale: 0.85, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 40, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-[#1C1C1E] border border-[#2f2f31] rounded-xl p-6 w-[90%] max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4">Create Post</h2>
              
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full bg-[#0A0A0A] border border-[#2f2f31] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-600 mb-4 resize-none"
                rows="4"
              />

              {/* Toggle between URL and File Upload */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setUploadType("url")}
                  className={`px-3 py-1 rounded text-sm ${uploadType === "url" ? "bg-blue-600 text-white" : "bg-[#2f2f31] text-gray-400"}`}
                >
                  Link
                </button>
                <button
                  onClick={() => setUploadType("file")}
                  className={`px-3 py-1 rounded text-sm ${uploadType === "file" ? "bg-blue-600 text-white" : "bg-[#2f2f31] text-gray-400"}`}
                >
                  Upload File
                </button>
              </div>

              {uploadType === "url" ? (
                <>
                  <input
                    type="text"
                    value={postImageUrl}
                    onChange={(e) => setPostImageUrl(e.target.value)}
                    placeholder="Image URL (optional)"
                    className="w-full bg-[#0A0A0A] border border-[#2f2f31] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-600 mb-2 text-sm"
                  />
                  <input
                    type="text"
                    value={postVideoUrl}
                    onChange={(e) => setPostVideoUrl(e.target.value)}
                    placeholder="Video URL (optional)"
                    className="w-full bg-[#0A0A0A] border border-[#2f2f31] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-600 mb-2 text-sm"
                  />
                  <input
                    type="text"
                    value={postFileUrl}
                    onChange={(e) => setPostFileUrl(e.target.value)}
                    placeholder="File URL (optional)"
                    className="w-full bg-[#0A0A0A] border border-[#2f2f31] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-600 mb-4 text-sm"
                  />
                </>
              ) : (
                <>
                  <div className="mb-2">
                    <label className="block text-sm text-gray-400 mb-1">Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedImage(e.target.files[0])}
                      className="w-full bg-[#0A0A0A] border border-[#2f2f31] rounded-lg px-4 py-2 text-white text-sm"
                    />
                    {selectedImage && <p className="text-xs text-gray-400 mt-1">Selected: {selectedImage.name}</p>}
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm text-gray-400 mb-1">Video</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setSelectedVideo(e.target.files[0])}
                      className="w-full bg-[#0A0A0A] border border-[#2f2f31] rounded-lg px-4 py-2 text-white text-sm"
                    />
                    {selectedVideo && <p className="text-xs text-gray-400 mt-1">Selected: {selectedVideo.name}</p>}
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-1">File</label>
                    <input
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      className="w-full bg-[#0A0A0A] border border-[#2f2f31] rounded-lg px-4 py-2 text-white text-sm"
                    />
                    {selectedFile && <p className="text-xs text-gray-400 mt-1">Selected: {selectedFile.name}</p>}
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowPostModal(false);
                    setPostContent("");
                    setPostImageUrl("");
                    setPostVideoUrl("");
                    setPostFileUrl("");
                    setSelectedImage(null);
                    setSelectedVideo(null);
                    setSelectedFile(null);
                    setUploadType("url");
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Post
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
