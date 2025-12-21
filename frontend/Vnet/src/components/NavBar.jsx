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
        className={`fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center
        bg-[#1C1C1E] border-b border-white/5 shadow-xl transition-transform
        ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="text-[#1851ec] font-bold text-3xl">Vnet.</div>

        <div className="flex items-center gap-4">
          {/* 🔍 SEARCH */}
          <div className="relative w-80" ref={searchRef}>
            <div className="flex items-center">
              <Search className="mr-2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search users..."
                className="w-full px-4 py-2 rounded-2xl bg-transparent ring-2 ring-blue-800 text-white outline-none"
              />
              {loading && (
                <Loader2 className="animate-spin ml-2 text-blue-500" />
              )}
            </div>

            {/* DROPDOWN */}
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-12 w-full bg-[#1C1C1E] border border-white/10 rounded-xl shadow-xl overflow-hidden"
                >
                  {results.length > 0 ? (
                    results.map((u, i) => (
                      <div
                        key={u._id}
                        onClick={() => handleMessage(u)}
                        className={`px-4 py-3 cursor-pointer flex justify-between items-center
                        ${
                          i === highlightIndex
                            ? "bg-white/10"
                            : "hover:bg-white/5"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold">{u.username}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                        <button className="text-xs bg-blue-600 px-3 py-1 rounded">
                          Message
                        </button>
                      </div>
                    ))
                  ) : query.length >= 2 ? (
                    <p className="p-4 text-sm text-gray-400 text-center">
                      ❌ No users found
                    </p>
                  ) : (
                    recentSearches.map((u) => (
                      <div
                        key={u._id}
                        onClick={() => handleMessage(u)}
                        className="px-4 py-3 hover:bg-white/5 cursor-pointer"
                      >
                        <p className="text-sm">{u.username}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <BellRing />

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="border rounded-full p-2 hover:bg-white/10"
          >
            <User />
          </button>
        </div>
      </div>

      {/* LOGOUT MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <motion.div
              ref={modalRef}
              className="bg-[#111] p-6 rounded-xl w-[90%] max-w-sm text-center"
            >
              <p className="mb-4 text-lg">Do you want to log out?</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleLogout}
                  className="bg-red-600 px-5 py-2 rounded-lg flex gap-2"
                >
                  <LogOut size={16} /> Yes
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="bg-gray-700 px-5 py-2 rounded-lg"
                >
                  No
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
