import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function LeftBar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  useEffect(() => {
    fetchUser();
    fetchSuggestedUsers();
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
    }
  };

  const fetchSuggestedUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/protected/suggested-users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setSuggestedUsers(data);
      }
    } catch (error) {
      console.error("Error fetching suggested users:", error);
    }
  };

  const initials = user ? user.username.charAt(0).toUpperCase() : "U";
  const displayName = user ? user.username : "User";
  const displayEmail = user ? user.email : "";

  return (
    <div className="h-full px-6 text-white overflow-y-auto [&::-webkit-scrollbar]:hidden">
      
      {/* 1. Profile Card (Links to Profile Page) */}
      <div 
        onClick={() => navigate('/profile')} 
        className="bg-[#1C1C1E] border border-[#2f2f31] rounded-xl p-4 mb-8 cursor-pointer hover:border-blue-500/50 transition group"
      >
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-sm border-2 border-transparent group-hover:border-white transition">
                {initials}
            </div>
            <div className="overflow-hidden">
                <h3 className="font-bold text-sm truncate group-hover:text-blue-400 transition">{displayName}</h3>
                <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
            </div>
        </div>
      </div>

      {/* 2. Main Menu */}
      <div className="mb-8">
        <h2 className="font-bold text-gray-400 mb-4 uppercase text-xs tracking-wider">Menu</h2>
        <ul className="space-y-2">
            
            {/* Home Feed */}
            <li>
                <Link to="/" className="flex items-center gap-3 text-white bg-[#1C1C1E] px-4 py-3 rounded-xl border border-[#2f2f31] font-medium transition hover:bg-[#252527]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                    For You
                </Link>
            </li>

            {/* Messages (Updated to Link to /messages) */}
            <li>
                <Link to="/messages" className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-[#1C1C1E] px-4 py-3 rounded-xl transition font-medium">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                    Messages
                </Link>
            </li>

            {/* Notifications */}
            <li>
                <div className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-[#1C1C1E] px-4 py-3 rounded-xl transition font-medium cursor-pointer">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                    Notifications
                </div>
            </li>
        </ul>
      </div>

      {/* 3. Suggested Section */}
      <div className="border-t border-white/5 pt-6">
        <h2 className="font-bold text-gray-400 mb-4 uppercase text-xs tracking-wider">Suggested</h2>
        <div className="space-y-4">
             {suggestedUsers.map((suggestedUser) => {
               const suggestedInitials = suggestedUser.username ? suggestedUser.username.charAt(0).toUpperCase() : "U";
               const colors = ['bg-purple-600', 'bg-orange-600', 'bg-blue-600', 'bg-green-600', 'bg-pink-600'];
               const colorIndex = suggestedUser.username ? suggestedUser.username.charCodeAt(0) % colors.length : 0;
               return (
                 <div key={suggestedUser._id} className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-full ${colors[colorIndex]} flex items-center justify-center text-xs font-bold`}>
                         {suggestedInitials}
                     </div>
                     <div className="flex-1">
                         <p className="text-sm font-bold truncate">{suggestedUser.username || "User"}</p>
                         <p className="text-xs text-gray-500 truncate">{suggestedUser.role || "Member"}</p>
                     </div>
                     <button className="text-blue-500 text-xs font-bold hover:text-white transition">Follow</button>
                 </div>
               );
             })}
        </div>
      </div>

    </div>
  );
}