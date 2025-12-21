import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/protected/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setUsername(data.username || "");
        setRole(data.role || "");
        setBio(data.bio || "");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/protected/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, role, bio }),
      });
      if (res.ok) {
        navigate("/profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const initials = user ? user.username.charAt(0).toUpperCase() : "U";

  return (
    <div className="h-full w-full overflow-y-auto p-6 text-white pb-24 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/profile")}
          className="p-2 hover:bg-white/10 rounded-full transition"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
        </button>
        <h1 className="text-xl font-bold">Edit Profile</h1>
      </div>

      <div className="bg-[#1C1C1E] border border-[#2f2f31] rounded-2xl p-6 space-y-6">
        {/* Photo Upload */}
        <div className="flex flex-col items-center gap-4 py-4 border-b border-[#2f2f31]">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold text-white relative">
            {initials}
          </div>
          <button className="text-blue-400 text-sm font-medium hover:text-blue-300">
            Change Profile Photo
          </button>
        </div>

        {/* Form Fields */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-400 text-xs uppercase font-bold mb-2 ml-1">
              Display Name
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#2f2f31] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition placeholder-gray-600"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs uppercase font-bold mb-2 ml-1">
              Role / Job
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#2f2f31] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition placeholder-gray-600"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs uppercase font-bold mb-2 ml-1">
              Bio
            </label>
            <textarea
              rows="4"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#2f2f31] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition placeholder-gray-600 resize-none"
            ></textarea>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
