import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
    fetchFollowing();
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  useEffect(() => {
    const handleFocus = () => {
      fetchUser();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
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
      }
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setFollowers(data);
      }
    } catch (error) {
      console.error("Error fetching followers:", error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/protected/following", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setFollowing(data);
      }
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

  const fetchUserPosts = async () => {
    if (!user?._id) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/protected/posts/user/${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUserPosts(data);
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  const handleFollow = async (userId, isFollowing) => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = isFollowing ? "unfollow" : "follow";
      const res = await fetch(`http://localhost:5000/api/protected/${endpoint}/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        fetchFollowers();
        fetchFollowing();
        fetchUser();
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  if (loading) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  if (!user) {
    return <div className="p-6 text-white">Error loading profile</div>;
  }

  const initials = user.username.charAt(0).toUpperCase();
  const displayName = user.username || "User";
  const displayRole = user.role || "Member";
  const displayLocation = user.location || "";

  return (
    <div className="p-6 text-white min-h-full pb-24">
      
      {/* 1. Header Card */}
      <div className="bg-[#1C1C1E] border border-[#2f2f31] rounded-2xl p-8 text-center mb-8 relative overflow-hidden">
        {/* Decorative BG */}
        <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-blue-900/20 to-transparent"></div>
        
        <div className="relative z-10">
            <div className="w-28 h-28 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-4xl text-white font-bold mb-4 border-4 border-[#161616] shadow-xl">
              {initials}
            </div>
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <p className="text-[#9CA3AF] mb-6">{displayRole}{displayLocation ? ` • ${displayLocation}` : ""}</p>
            
            <div className="flex justify-center gap-8 mb-8 border-y border-[#2f2f31] py-4 max-w-md mx-auto">
                <div className="text-center">
                    <span className="block font-bold text-xl">0</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Views</span>
                </div>
                <div className="text-center">
                    <span className="block font-bold text-xl">{userPosts.length || 0}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Posts</span>
                </div>
                <div className="text-center cursor-pointer hover:text-blue-400 transition" onClick={handleFollowersClick}>
                    <span className="block font-bold text-xl">{user.followersCount || 0}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Followers</span>
                </div>
                <div className="text-center cursor-pointer hover:text-blue-400 transition" onClick={handleFollowingClick}>
                    <span className="block font-bold text-xl">{following.length || 0}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Following</span>
                </div>
            </div>

            <Link to="/edit-profile" className="inline-block bg-[#2f2f31] hover:bg-white hover:text-black border border-white/10 text-white px-8 py-2.5 rounded-full font-medium transition text-sm">
                Edit Profile
            </Link>
        </div>
      </div>

      {/* 2. User's Content List */}
      <h2 className="font-bold text-gray-400 mb-4 uppercase tracking-wider text-xs">Recent Activity</h2>
      
      {userPosts.length === 0 ? (
        <div className="bg-[#1C1C1E] border border-[#2f2f31] rounded-xl p-8 text-center">
          <p className="text-gray-400">No posts yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {userPosts.map((post) => (
            <div key={post._id} className="bg-[#1C1C1E] border border-[#2f2f31] rounded-xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-300 leading-relaxed">{post.content}</p>
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt="Post" className="mt-3 rounded-lg max-w-full max-h-64 object-cover" />
                  )}
                  {post.videoUrl && (
                    <video src={post.videoUrl} controls className="mt-3 rounded-lg max-w-full max-h-64" />
                  )}
                  {post.fileUrl && (
                    <a href={post.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-blue-400 hover:text-blue-300 text-sm">
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

      {/* Followers Modal */}
      {showFollowers && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowFollowers(false)}>
          <div className="bg-[#1C1C1E] border border-[#2f2f31] rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Followers</h2>
              <button onClick={() => setShowFollowers(false)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              {followers.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No followers yet</p>
              ) : (
                followers.map((follower) => {
                  const followerInitials = follower.username ? follower.username.charAt(0).toUpperCase() : "U";
                  const colors = ['bg-purple-600', 'bg-orange-600', 'bg-blue-600', 'bg-green-600', 'bg-pink-600'];
                  const colorIndex = follower.username ? follower.username.charCodeAt(0) % colors.length : 0;
                  const isFollowing = follower.isFollowing || false;
                  return (
                    <div key={follower._id} className="flex items-center gap-3 p-3 bg-[#0A0A0A] rounded-xl border border-[#2f2f31]">
                      <div className={`w-10 h-10 rounded-full ${colors[colorIndex]} flex items-center justify-center text-sm font-bold`}>
                        {followerInitials}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{follower.username || "User"}</p>
                        <p className="text-xs text-gray-500">{follower.role || "Member"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleFollow(follower._id, isFollowing)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                            isFollowing 
                              ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {isFollowing ? "Unfollow" : "Follow"}
                        </button>
                        <button 
                          onClick={() => navigate(`/messages?userId=${follower._id}&username=${encodeURIComponent(follower.username || 'User')}`)}
                          className="p-2 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition"
                          title="Chat"
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
      )}

      {/* Following Modal */}
      {showFollowing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowFollowing(false)}>
          <div className="bg-[#1C1C1E] border border-[#2f2f31] rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Following</h2>
              <button onClick={() => setShowFollowing(false)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              {following.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Not following anyone yet</p>
              ) : (
                following.map((user) => {
                  const userInitials = user.username ? user.username.charAt(0).toUpperCase() : "U";
                  const colors = ['bg-purple-600', 'bg-orange-600', 'bg-blue-600', 'bg-green-600', 'bg-pink-600'];
                  const colorIndex = user.username ? user.username.charCodeAt(0) % colors.length : 0;
                  return (
                    <div key={user._id} className="flex items-center gap-3 p-3 bg-[#0A0A0A] rounded-xl border border-[#2f2f31]">
                      <div className={`w-10 h-10 rounded-full ${colors[colorIndex]} flex items-center justify-center text-sm font-bold`}>
                        {userInitials}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{user.username || "User"}</p>
                        <p className="text-xs text-gray-500">{user.role || "Member"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleFollow(user._id, true)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg transition bg-gray-700 text-gray-300 hover:bg-gray-600"
                        >
                          Unfollow
                        </button>
                        <button 
                          onClick={() => navigate(`/messages?userId=${user._id}&username=${encodeURIComponent(user.username || 'User')}`)}
                          className="p-2 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition"
                          title="Chat"
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
      )}

    </div>
  );
}