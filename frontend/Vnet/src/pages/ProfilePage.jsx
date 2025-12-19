import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Followers State
  const [showFollowers, setShowFollowers] = useState(false);
  const [followers, setFollowers] = useState([]);

  // Following State (NEW)
  const [showFollowing, setShowFollowing] = useState(false);
  const [following, setFollowing] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, [location.pathname]);

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
      console.error("Error fetching followers:", error);
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
      console.error("Error fetching following:", error);
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

  const handleFollow = async (userId, isFollowing) => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = isFollowing ? "unfollow" : "follow";
      const res = await fetch(`http://localhost:5000/api/protected/${endpoint}/${userId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        // Refresh all lists to keep counts in sync
        fetchFollowers();
        fetchFollowing();
        fetchUser(); 
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleStartChat = async (targetUserId) => {
    if (!user?._id || !targetUserId) return;
    try {
      const res = await axios.post("http://localhost:5000/api/chat", {
        senderId: user._id,
        receiverId: targetUserId
      });
      navigate("/messages", { state: { chat: res.data } });
    } catch (err) {
      console.error("Error starting chat:", err);
    }
  };

  if (loading) return <div className="p-6 text-white">Loading...</div>;
  if (!user) return <div className="p-6 text-white">Error loading profile</div>;

  const initials = user.username.charAt(0).toUpperCase();

  // Reusable User List Component for Modals
  const UserList = ({ users, title, onClose }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#1C1C1E] border border-[#2f2f31] rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        <div className="space-y-3">
          {users.length === 0 ? (
            <p className="text-gray-400 text-center py-8">List is empty</p>
          ) : (
            users.map((person) => {
              const personInitials = person.username ? person.username.charAt(0).toUpperCase() : "U";
              // Check if we are following this person. 
              // If it's the "Following" list, we are definitely following them (true). 
              // If it's the "Followers" list, we check the isFollowing flag.
              const isFollowingTarget = title === "Following" ? true : (person.isFollowing || false);

              return (
                <div key={person._id} className="flex items-center gap-3 p-3 bg-[#0A0A0A] rounded-xl border border-[#2f2f31]">
                  <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center text-sm font-bold">
                    {personInitials}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-sm truncate">{person.username || "User"}</p>
                    <p className="text-xs text-gray-500 truncate">{person.role || "Member"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleFollow(person._id, isFollowingTarget)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                        isFollowingTarget 
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {isFollowingTarget ? "Unfollow" : "Follow"}
                    </button>
                    <button 
                      onClick={() => handleStartChat(person._id)}
                      className="p-2 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition"
                      title="Message"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 text-white min-h-full pb-24">
      {/* Header Card */}
      <div className="bg-[#1C1C1E] border border-[#2f2f31] rounded-2xl p-8 text-center mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-blue-900/20 to-transparent"></div>
        <div className="relative z-10">
            <div className="w-28 h-28 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-4xl text-white font-bold mb-4 border-4 border-[#161616] shadow-xl">
              {initials}
            </div>
            <h1 className="text-2xl font-bold">{user.username}</h1>
            <p className="text-[#9CA3AF] mb-6">{user.role || "Member"} {user.location ? `• ${user.location}` : ""}</p>
            
            <div className="flex justify-center gap-8 mb-8 border-y border-[#2f2f31] py-4 max-w-md mx-auto">
                <div className="text-center">
                    <span className="block font-bold text-xl">0</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Posts</span>
                </div>
                
                {/* Followers Count */}
                <div className="text-center cursor-pointer hover:text-blue-400 transition" onClick={handleFollowersClick}>
                    <span className="block font-bold text-xl">{user.followersCount || user.followers?.length || 0}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Followers</span>
                </div>

                {/* Following Count (NEW) */}
                <div className="text-center cursor-pointer hover:text-blue-400 transition" onClick={handleFollowingClick}>
                    <span className="block font-bold text-xl">{user.following?.length || 0}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Following</span>
                </div>
            </div>

            <Link to="/edit-profile" className="inline-block bg-[#2f2f31] hover:bg-white hover:text-black border border-white/10 text-white px-8 py-2.5 rounded-full font-medium transition text-sm">
                Edit Profile
            </Link>
        </div>
      </div>

      <h2 className="font-bold text-gray-400 mb-4 uppercase tracking-wider text-xs">Recent Activity</h2>
      <div className="bg-[#1C1C1E] border border-[#2f2f31] rounded-xl p-8 text-center">
        <p className="text-gray-400">No recent activity</p>
      </div>

      {/* Modals */}
      {showFollowers && (
        <UserList users={followers} title="Followers" onClose={() => setShowFollowers(false)} />
      )}

      {showFollowing && (
        <UserList users={following} title="Following" onClose={() => setShowFollowing(false)} />
      )}
    </div>
  );
}