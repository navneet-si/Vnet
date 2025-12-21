import { Search, BellRing, User, LogOut, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function NavBar({ isVisible }) {
  const navigate = useNavigate();

  const modalRef = useRef(null);
  const searchRef = useRef(null);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  /* 🔍 SEARCH STATE */
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const RECENT_KEY = "vnet_recent_searches";

  /* 🔍 SEARCH API */
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5000/api/protected/search-users?q=${query}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
        setShowDropdown(true);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  /* ⌨️ KEYBOARD NAVIGATION */
  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    if (e.key === "ArrowDown") {
      setHighlightIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      handleMessage(results[highlightIndex]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  /* 📨 MESSAGE USER */
  const handleMessage = (user) => {
    saveRecentSearch(user);
    setQuery("");
    setShowDropdown(false);
    navigate(
      `/messages?userId=${user._id}&username=${encodeURIComponent(
        user.username
      )}`
    );
  };

  /* 🧠 CACHE RECENT SEARCH */
  const saveRecentSearch = (user) => {
    const stored = JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
    const updated = [
      user,
      ...stored.filter((u) => u._id !== user._id),
    ].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const recentSearches =
    JSON.parse(localStorage.getItem(RECENT_KEY)) || [];

  /* ❌ CLOSE DROPDOWN ON OUTSIDE CLICK */
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* 🔐 LOGOUT */
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {/* NAVBAR */}
      <div
        className={`fixed top-0 left-0 w-full z-50 px-6 py-2.5 flex justify-between items-center
        bg-gradient-to-r from-[#0a0a0a] via-[#111111] to-[#0a0a0a] 
        border-b border-white/10 shadow-2xl backdrop-blur-xl transition-transform duration-300
        ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
      >
        {/* Logo with gradient */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-white font-bold text-base">V</span>
          </div>
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent font-bold text-2xl">
            Vnet
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* 🔍 SEARCH */}
          <div className="relative w-96" ref={searchRef}>
            <div className="flex items-center bg-gradient-to-r from-[#1a1a1c] to-[#0f0f10] rounded-2xl px-3 py-2 border border-white/10 shadow-lg hover:border-blue-500/50 transition-all">
              <Search className="text-blue-400" size={18} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search users..."
                className="flex-1 ml-3 bg-transparent text-white text-sm placeholder-gray-500 outline-none"
              />
              {loading && (
                <Loader2 className="animate-spin text-blue-500" size={18} />
              )}
            </div>

            {/* DROPDOWN */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-16 w-full bg-gradient-to-b from-[#1a1a1c] to-[#0f0f10] border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
                >
                  {results.length > 0 ? (
                    results.map((u, i) => (
                      <div
                        key={u._id}
                        onClick={() => handleMessage(u)}
                        className={`px-5 py-4 cursor-pointer flex justify-between items-center transition-all
                        ${
                          i === highlightIndex
                            ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20"
                            : "hover:bg-white/5"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">{u.username}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                        <button className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all">
                          Message
                        </button>
                      </div>
                    ))
                  ) : query.length >= 2 ? (
                    <p className="p-6 text-sm text-gray-400 text-center">
                      No users found
                    </p>
                  ) : (
                    <>
                      {recentSearches.length > 0 && (
                        <div className="px-5 py-3 border-b border-white/5">
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Recent Searches</p>
                        </div>
                      )}
                      {recentSearches.map((u) => (
                        <div
                          key={u._id}
                          onClick={() => handleMessage(u)}
                          className="px-5 py-4 hover:bg-white/5 cursor-pointer transition-all"
                        >
                          <p className="text-sm text-white font-medium">{u.username}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      ))}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notification Bell */}
          <button className="relative p-3 rounded-full bg-gradient-to-br from-[#1a1a1c] to-[#0f0f10] border border-white/10 hover:border-blue-500/50 transition-all shadow-lg hover:shadow-blue-500/20 group">
            <BellRing className="text-gray-400 group-hover:text-blue-400 transition-colors" size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          {/* User Profile */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="p-3 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 border border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            <User className="text-white" size={20} />
          </button>
        </div>
      </div>

      {/* LOGOUT MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-[#1a1a1c] to-[#0f0f10] border border-white/10 p-8 rounded-3xl w-[90%] max-w-md text-center shadow-2xl"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                <LogOut size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Log Out?</h3>
              <p className="text-gray-400 mb-6">Are you sure you want to log out of your account?</p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-red-500/30 transition-all flex items-center gap-2"
                >
                  <LogOut size={18} /> Yes, Log Out
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}