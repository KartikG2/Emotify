import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaEnvelope, FaLock, FaArrowRight, FaMusic } from "react-icons/fa";
import { Loader2 } from "lucide-react";

// --- Premium Styles ---
const PremiumStyles = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&family=Space+Grotesk:wght@300;500;700&display=swap');
      
      .font-heading { font-family: 'Space Grotesk', sans-serif; }
      .font-body { font-family: 'Outfit', sans-serif; }
      
      .glass-card {
        background: rgba(10, 10, 10, 0.6);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      }

      .glass-input {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
      }
      .glass-input:focus {
        background: rgba(255, 255, 255, 0.08);
        border-color: #a855f7;
        box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.1);
        outline: none;
      }
      
      .premium-gradient-text {
        background: linear-gradient(135deg, #fff 0%, #d8b4fe 50%, #a855f7 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    `}
  </style>
);

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // --- Mouse Parallax ---
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 20,
        y: (e.clientY / window.innerHeight) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status === "error") setStatus("idle"); // Clear error on type
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      await axios.post(
        "https://emotify-r0ms.onrender.com/user/register",
        formData,
        { withCredentials: true }
      );

      setStatus("success");
      localStorage.setItem("UserData", JSON.stringify({ email: formData.email, username: formData.username }));
      
      // Small delay for user to see success state
      setTimeout(() => {
        navigate("/verify-otp");
      }, 1500);

    } catch (err) {
      console.error("Signup error:", err);
      setStatus("error");
      setErrorMessage(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030303] text-white font-body overflow-hidden flex items-center justify-center selection:bg-purple-500 selection:text-white">
      <PremiumStyles />

      {/* --- Cinematic Background --- */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div 
          animate={{ x: mousePos.x * -1, y: mousePos.y * -1 }}
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[150px]" 
        />
        <motion.div 
          animate={{ x: mousePos.x, y: mousePos.y }}
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-900/10 rounded-full blur-[150px]" 
        />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      </div>

      {/* --- Main Card --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="glass-card p-8 md:p-10 rounded-[2.5rem]">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-purple-500/30 mb-6">
              <FaMusic className="text-2xl text-white animate-pulse" />
            </div>
            <h2 className="text-3xl font-heading font-bold mb-2">
              Join <span className="premium-gradient-text">EMOTIFY</span>
            </h2>
            <p className="text-gray-400 text-sm">Begin your emotional journey.</p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Username */}
            <div className="relative group">
              <FaUser className="absolute left-4 top-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="glass-input w-full py-3.5 pl-12 pr-4 rounded-xl text-white placeholder-gray-500 focus:placeholder-gray-400"
              />
            </div>

            {/* Email */}
            <div className="relative group">
              <FaEnvelope className="absolute left-4 top-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="glass-input w-full py-3.5 pl-12 pr-4 rounded-xl text-white placeholder-gray-500 focus:placeholder-gray-400"
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <FaLock className="absolute left-4 top-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="glass-input w-full py-3.5 pl-12 pr-4 rounded-xl text-white placeholder-gray-500 focus:placeholder-gray-400"
              />
            </div>

            {/* Status Message */}
            <AnimatePresence>
              {status === "error" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-400 text-xs text-center font-medium bg-red-500/10 py-2 rounded-lg border border-red-500/20"
                >
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className={`w-full py-4 rounded-xl font-bold font-heading uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-3 mt-4
                ${status === "success" 
                  ? "bg-green-500 text-white shadow-green-500/25" 
                  : "bg-white text-black hover:bg-gray-200 shadow-purple-500/10"
                }`}
            >
              {status === "loading" ? (
                <><Loader2 className="animate-spin" /> Creating Account...</>
              ) : status === "success" ? (
                <>Success! Redirecting...</>
              ) : (
                <>Create Account <FaArrowRight /></>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center border-t border-white/10 pt-6">
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-purple-400 hover:text-white transition-colors font-bold ml-1"
              >
                Login
              </Link>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}