import { Search, BellRing, User, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function NavBar({ isVisible }) {
  const navigate = useNavigate();
  const modalRef = useRef(null);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
    </>
  );
}
