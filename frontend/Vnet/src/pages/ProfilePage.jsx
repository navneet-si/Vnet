import {
  Link,
  useLocation,
  useNavigate,
  useOutletContext,
} from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function ProfilePage() {
  // 1. GET SCROLL HANDLER FROM MAIN LAYOUT
  const { handleScroll } = useOutletContext();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Followers State
  const [showFollowers, setShowFollowers] = useState(false);
  const [followers, setFollowers] = useState([]);

  // Following State (NEW)
  const [showFollowing, setShowFollowing] = useState(false);
  const [following, setFollowing] = useState([]);
  const [userPosts, setUserPosts] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();
  const lastScrollY = useRef(0);

  // 2. LOCAL SCROLL FUNCTION (Syncs with Navbar)
  const onScroll = (e) => {
    const currentScrollY = e.target.scrollTop;
    if (handleScroll) handleScroll(e);
    lastScrollY.current = currentScrollY;
  };

  // 🛠️ Helper for URLs
  const getFileUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const cleanPath = path.replace(/\\/g, "/").replace(/^\/+/, "");
    return `http://localhost:5000/${cleanPath}`;
  };

  useEffect(() => {
    fetchUser();
  }, [location.pathname]);

  useEffect(() => {
    if (user) fetchUserPosts();
  }, [user]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/protected/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUser(data);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/protected/followers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setFollowers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/protected/following", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setFollowing(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUserPosts = async () => {
    if (!user?._id) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/protected/posts/user/${user._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok) setUserPosts(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUserPosts((prev) => prev.filter((post) => post._id !== postId));
      } else {
        alert("Failed to delete post");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFollow = async (userId, isFollowing) => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = isFollowing ? "unfollow" : "follow";
      const res = await fetch(
        `http://localhost:5000/api/protected/${endpoint}/${userId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        // Refresh all lists to keep counts in sync
        fetchFollowers();
        fetchFollowing();
        fetchUser();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleFollowersClick = () => {
    setShowFollowers(true);
    fetchFollowers();
  };
  const handleFollowingClick = () => {
    setShowFollowing(true);
    fetchFollowing();
  };

  if (loading) return <div className="p-6 text-white">Loading...</div>;
  if (!user) return <div className="p-6 text-white">Error loading profile</div>;

  const initials = user.username.charAt(0).toUpperCase();

  // Reusable User List Component
  const UserList = ({ users, title, onClose }) => (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#1C1C1E] border border-[#2f2f31] rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>
        <div className="space-y-3">
          {users.length === 0 ? (
            <p className="text-gray-400 text-center py-8">List is empty</p>
          ) : (
            users.map((person) => {
              const isFollowingTarget =
                title === "Following" ? true : person.isFollowing || false;
              return (
                <div
                  key={person._id}
                  className="flex items-center gap-3 p-3 bg-[#0A0A0A] rounded-xl border border-[#2f2f31]"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-sm font-bold">
                    {person.username
                      ? person.username.charAt(0).toUpperCase()
                      : "U"}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-sm truncate">
                      {person.username || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {person.role || "Member"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleFollow(person._id, isFollowingTarget)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                      isFollowingTarget
                        ? "bg-gray-700 text-gray-300"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {isFollowingTarget ? "Unfollow" : "Follow"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  return (
    // 🔴 SCROLL FIX: h-full + overflow-y-auto + hidden scrollbars
    <div
      onScroll={onScroll}
      className="h-full w-full overflow-y-auto p-6 text-white pb-24 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      {/* Header Card */}
      <div className="bg-[#1C1C1E] border border-[#2f2f31] rounded-2xl p-8 text-center mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-900/20 to-transparent"></div>
        <div className="relative z-10">
          <div className="w-28 h-28 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-4xl text-white font-bold mb-4 border-4 border-[#161616] shadow-xl">
            {initials}
          </div>
          <h1 className="text-2xl font-bold">{user.username}</h1>
          <p className="text-[#9CA3AF] mb-6">
            {user.role || "Member"} {user.location ? `• ${user.location}` : ""}
          </p>

          <div className="flex justify-center gap-8 mb-8 border-y border-[#2f2f31] py-4 max-w-md mx-auto">
            <div className="text-center">
              <span className="block font-bold text-xl">
                {userPosts.length || 0}
              </span>
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                Posts
              </span>
            </div>

            {/* Followers Count */}
            <div
              className="text-center cursor-pointer hover:text-blue-400 transition"
              onClick={handleFollowersClick}
            >
              <span className="block font-bold text-xl">
                {user.followersCount || user.followers?.length || 0}
              </span>
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                Followers
              </span>
            </div>

            {/* Following Count (NEW) */}
            <div
              className="text-center cursor-pointer hover:text-blue-400 transition"
              onClick={handleFollowingClick}
            >
              <span className="block font-bold text-xl">
                {user.followingCount || 0}
              </span>
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                Following
              </span>
            </div>
          </div>

          <Link
            to="/edit-profile"
            className="inline-block bg-[#2f2f31] hover:bg-white hover:text-black border border-white/10 text-white px-8 py-2.5 rounded-full font-medium transition text-sm"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      <h2 className="font-bold text-gray-400 mb-4 uppercase tracking-wider text-xs">
        Recent Activity
      </h2>

      {/* Posts List */}
      {userPosts.length === 0 ? (
        <div className="bg-[#1C1C1E] border border-[#2f2f31] rounded-xl p-8 text-center">
          <p className="text-gray-400">No posts yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {userPosts.map((post) => (
            <div
              key={post._id}
              className="bg-[#1C1C1E] border border-[#2f2f31] rounded-xl p-4 relative group"
            >
              {/* DELETE BUTTON */}
              <button
                onClick={() => handleDeletePost(post._id)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-red-500/80 rounded-full text-gray-400 hover:text-white transition opacity-0 group-hover:opacity-100"
                title="Delete Post"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>

              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {post.content}
                  </p>

                  {/* Fixed Media Rendering */}
                  {post.imageUrl && (
                    <img
                      src={getFileUrl(post.imageUrl)}
                      alt="Post"
                      className="mt-3 rounded-lg max-w-full max-h-64 object-cover border border-white/5"
                    />
                  )}
                  {post.videoUrl && (
                    <video
                      src={getFileUrl(post.videoUrl)}
                      controls
                      className="mt-3 rounded-lg max-w-full max-h-64 border border-white/5"
                    />
                  )}
                  {post.fileUrl && (
                    <a
                      href={getFileUrl(post.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block bg-[#2C2C2E] px-3 py-2 rounded text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      📎 View File
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500 pt-3 border-t border-[#2f2f31]">
                <span>❤️ {post.likesCount || 0}</span>
                <span>💬 {post.commentsCount || 0}</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showFollowers && (
        <UserList
          users={followers}
          title="Followers"
          onClose={() => setShowFollowers(false)}
        />
      )}
      {showFollowing && (
        <UserList
          users={following}
          title="Following"
          onClose={() => setShowFollowing(false)}
        />
      )}
    </div>
  );
}
