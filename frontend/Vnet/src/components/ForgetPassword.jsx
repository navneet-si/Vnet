import { motion, AnimatePresence } from "framer-motion";

const ForgotPassword = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      >
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 40, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md bg-white/5 backdrop-blur-xl 
                     border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <h2 className="text-2xl font-bold text-white text-center">
            Forgot Password 🔐
          </h2>

          <p className="text-gray-400 text-center mt-2">
            Enter your email to receive reset instructions
          </p>

          <input
            type="email"
            placeholder="you@example.com"
            className="w-full mt-6 px-4 py-3 rounded-lg bg-[#111] text-white 
                       border border-white/10 focus:outline-none 
                       focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={() => {
              alert("Password reset link sent!");
              onClose();
            }}
            className="w-full mt-5 py-3 rounded-lg bg-indigo-600 
                       hover:bg-indigo-700 transition font-semibold text-white"
          >
            Send Reset Link
          </button>

          <button
            onClick={onClose}
            className="w-full mt-3 text-sm text-gray-400 hover:text-white"
          >
            Cancel
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ForgotPassword;
