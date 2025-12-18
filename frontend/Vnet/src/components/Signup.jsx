import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const shakeAnimation = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 },
  },
};

const getPasswordStrength = (password) => {
  if (password.length === 0) return { label: "", color: "" };
  if (password.length < 6) return { label: "Weak", color: "bg-red-500" };
  if (password.match(/^(?=.*[A-Z])(?=.*\d)/))
    return { label: "Strong", color: "bg-green-500" };
  return { label: "Medium", color: "bg-yellow-500" };
};

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(password);

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.includes("@")) newErrors.email = "Enter a valid email";
    if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Simulate successful signup
    setSuccess(true);

    setTimeout(() => {
      navigate("/Login");
    }, 2200);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A] overflow-hidden">

      {/* Glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute w-[450px] h-[450px] bg-indigo-600/20 rounded-full blur-[140px]"
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md p-8 rounded-2xl 
                   bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-3xl font-bold text-center text-white">
                Create Account 🚀
              </h2>
              <p className="text-center text-gray-400 mt-2">
                Join us and start your journey
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">

                {/* Name */}
                <motion.div {...(shake && errors.name && shakeAnimation)}>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#111] text-white 
                               border border-white/10 focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                  )}
                </motion.div>

                {/* Email */}
                <motion.div {...(shake && errors.email && shakeAnimation)}>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#111] text-white 
                               border border-white/10 focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </motion.div>

                {/* Password */}
                <motion.div {...(shake && errors.password && shakeAnimation)}>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#111] text-white 
                               border border-white/10 focus:ring-2 focus:ring-indigo-500"
                  />

                  {/* Strength meter */}
                  {password && (
                    <div className="mt-2">
                      <div className="h-2 w-full bg-white/10 rounded-full">
                        <div
                          className={`h-2 rounded-full ${strength.color}`}
                          style={{
                            width:
                              strength.label === "Weak"
                                ? "33%"
                                : strength.label === "Medium"
                                ? "66%"
                                : "100%",
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Strength:{" "}
                        <span className="font-semibold">
                          {strength.label}
                        </span>
                      </p>
                    </div>
                  )}

                  {errors.password && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </motion.div>

                {/* Confirm Password */}
                <motion.div
                  {...(shake && errors.confirmPassword && shakeAnimation)}
                >
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#111] text-white 
                               border border-white/10 focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full mt-4 py-3 rounded-lg bg-indigo-600 
                             hover:bg-indigo-700 transition font-semibold text-white"
                >
                  Sign Up
                </motion.button>
              </form>
            </motion.div>
          ) : (
            /* SUCCESS ANIMATION */
            <motion.div
              key="success"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-green-500 
                           flex items-center justify-center text-white text-3xl"
              >
                ✓
              </motion.div>

              <h3 className="text-xl font-semibold text-white mt-4">
                Account Created!
              </h3>

              <p className="text-gray-400 text-sm mt-2 text-center">
                Redirecting you to login…
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Signup;
