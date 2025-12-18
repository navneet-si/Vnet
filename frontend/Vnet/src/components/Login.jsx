import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();

  // Login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Forgot password states
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // 🔐 REAL LOGIN (BACKEND CONNECTED)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) return;

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.msg || "Login failed");
        return;
      }

      // 🔑 SAVE JWT TOKEN
      localStorage.setItem("token", data.token);

      navigate("/Dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert("Server error. Please try again.");
    }
  };

  // Forgot password (UI-only for now)
  const handleForgotSubmit = () => {
    if (!forgotEmail) return;

    setForgotSuccess(true);

    setTimeout(() => {
      setShowForgot(false);
      setForgotSuccess(false);
      setForgotEmail("");
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A] overflow-hidden">

      {/* Background Glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[120px]"
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-8 rounded-2xl 
                   bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-center text-white"
        >
          Welcome Back 👋
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-center text-gray-400 mt-2"
        >
          Login to continue to your dashboard
        </motion.p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">

          {/* Email */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <label className="text-sm text-gray-300">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-lg bg-[#111] text-white 
                         border border-white/10 focus:outline-none 
                         focus:ring-2 focus:ring-indigo-500"
            />
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.75 }}
          >
            <label className="text-sm text-gray-300">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-lg bg-[#111] text-white 
                         border border-white/10 focus:outline-none 
                         focus:ring-2 focus:ring-indigo-500"
            />
          </motion.div>

          {/* Forgot password */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-right"
          >
            <span
              onClick={() => setShowForgot(true)}
              className="text-sm text-indigo-400 hover:underline cursor-pointer"
            >
              Forgot password?
            </span>
          </motion.div>

          {/* Login Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300 }}
            type="submit"
            className="w-full py-3 rounded-lg bg-indigo-600 
                       hover:bg-indigo-700 transition font-semibold text-white"
          >
            Login
          </motion.button>
        </form>

        {/* Signup navigation */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-center text-gray-400 mt-6 text-sm"
        >
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/Signup")}
            className="text-indigo-400 hover:underline cursor-pointer"
          >
            Sign up
          </span>
        </motion.p>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 40, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md bg-white/5 backdrop-blur-xl 
                         border border-white/10 rounded-2xl p-8 shadow-2xl"
            >
              {!forgotSuccess ? (
                <>
                  <h2 className="text-2xl font-bold text-white text-center">
                    Forgot Password 🔐
                  </h2>

                  <p className="text-gray-400 text-center mt-2">
                    Enter your email to receive reset instructions
                  </p>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full mt-6 px-4 py-3 rounded-lg bg-[#111] text-white 
                               border border-white/10 focus:outline-none 
                               focus:ring-2 focus:ring-indigo-500"
                  />

                  <button
                    onClick={handleForgotSubmit}
                    className="w-full mt-5 py-3 rounded-lg bg-indigo-600 
                               hover:bg-indigo-700 transition font-semibold text-white"
                  >
                    Send Reset Link
                  </button>

                  <button
                    onClick={() => setShowForgot(false)}
                    className="w-full mt-3 text-sm text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-16 h-16 rounded-full bg-green-500 
                               flex items-center justify-center text-white text-3xl"
                  >
                    ✓
                  </motion.div>

                  <h3 className="text-xl font-semibold text-white mt-4">
                    Email Sent!
                  </h3>

                  <p className="text-gray-400 text-center mt-2 text-sm">
                    Password reset instructions have been sent to your email
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
