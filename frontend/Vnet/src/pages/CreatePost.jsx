import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreatePost() {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [files, setFiles] = useState({
    image: null,
    video: null,
    file: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('content', content);
    if (files.image) formData.append('image', files.image);
    if (files.video) formData.append('video', files.video);
    if (files.file) formData.append('file', files.file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Do NOT set Content-Type header for FormData
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create post");
      }

      navigate('/'); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 🔴 SCROLL FIX: h-full + overflow-y-auto + hidden scrollbars + padding-bottom
    <div className="h-full w-full overflow-y-auto bg-black text-white pt-10 px-4 pb-24 flex justify-center items-start [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      
      <div className="w-full max-w-2xl bg-[#1C1C1E] p-8 rounded-xl border border-[#2f2f31]">
        <h1 className="text-2xl font-bold mb-6 text-gray-100">Create New Post</h1>
        
        {error && (
          <div className="bg-red-500/20 text-red-500 p-3 rounded mb-4 text-sm border border-red-500/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Content */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              required
              rows="5"
              className="w-full bg-black border border-[#2f2f31] rounded-lg p-4 text-white focus:outline-none focus:border-blue-600 resize-none transition"
            />
          </div>

          {/* File Uploads */}
          <div className="space-y-4">
            
            {/* Image Upload */}
            <div className="bg-black/50 p-4 rounded-lg border border-[#2f2f31]">
              <label className="block text-sm text-gray-400 mb-2 font-bold">Add Image</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
            </div>

            {/* Video Upload */}
            <div className="bg-black/50 p-4 rounded-lg border border-[#2f2f31]">
              <label className="block text-sm text-gray-400 mb-2 font-bold">Add Video</label>
              <input
                type="file"
                name="video"
                accept="video/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
              />
            </div>

            {/* Document Upload */}
            <div className="bg-black/50 p-4 rounded-lg border border-[#2f2f31]">
              <label className="block text-sm text-gray-400 mb-2 font-bold">Add Document</label>
              <input
                type="file"
                name="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 cursor-pointer"
              />
            </div>

          </div>

          {/* Buttons */}
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2 rounded-full font-bold text-gray-400 hover:text-white transition hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-full font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Uploading..." : "Post"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}