import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence, useSpring } from "framer-motion";
import { Loader2, Mail, Lock, ArrowRight, LogIn } from "lucide-react";
// import { useAuth } from "../context/AuthProvider"; // Commented out to prevent build error in preview

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
        color: white;
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

export default function Login() {
  const navigate = useNavigate();
  // const { login } = useAuth(); // Removed for preview stability
  
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [status, setStatus] = useState("idle"); 
  const [errorMessage, setErrorMessage] = useState("");
  
  // --- Mouse Parallax with Spring ---
  const springConfig = { damping: 25, stiffness: 120 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set((e.clientX / window.innerWidth) * 20);
      mouseY.set((e.clientY / window.innerHeight) * 20);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status === "error") setStatus("idle");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      // 1. API Call
      const res = await axios.post(
        "http://localhost:4000/user/login",
        formData,
        { withCredentials: true }
      );

      setStatus("success");

      // 2. Save Data (Directly to localStorage for reliability)
      const { user, token } = res.data;
      
      localStorage.setItem("token", token);
      localStorage.setItem("User", JSON.stringify(user));
      
      // Dispatch a custom event so other components (like Navbar) know auth changed
      window.dispatchEvent(new Event("storage"));

      // 3. Redirect
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (err) {
      console.error("Login error:", err);
      setStatus("error");
      setErrorMessage(err.response?.data?.errors || err.response?.data?.msg || "Invalid credentials.");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030303] text-white font-body overflow-hidden flex items-center justify-center selection:bg-purple-500 selection:text-white">
      <PremiumStyles />

      <div className="fixed inset-0 pointer-events-none">
        <motion.div 
          style={{ x: mouseX, y: mouseY, scale: -1 }}
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[150px]" 
        />
        <motion.div 
          style={{ x: mouseX, y: mouseY }}
          className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-900/10 rounded-full blur-[150px]" 
        />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, duration: 0.6 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="glass-card p-8 md:p-10 rounded-[2.5rem]">
          
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-purple-500/30 mb-6">
              <LogIn className="text-2xl text-white" />
            </div>
            <h2 className="text-3xl font-heading font-bold mb-2">
              Welcome <span className="premium-gradient-text">Back</span>
            </h2>
            <p className="text-gray-400 text-sm">Continue your emotional journey.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            <div className="relative group">
              <Mail className="absolute left-4 top-4 text-gray-500 group-focus-within:text-purple-400 transition-colors h-5 w-5" />
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

            <div className="relative group">
              <Lock className="absolute left-4 top-4 text-gray-500 group-focus-within:text-purple-400 transition-colors h-5 w-5" />
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

            <AnimatePresence>
              {status === "error" && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: "spring", stiffness: 150, damping: 20 }}
                  className="text-red-400 text-xs text-center font-medium bg-red-500/10 py-2 rounded-lg border border-red-500/20"
                >
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>

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
                <><Loader2 className="animate-spin" /> Logging In...</>
              ) : status === "success" ? (
                <>Success! Redirecting...</>
              ) : (
                <>Login <ArrowRight className="ml-1 w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/10 pt-6">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-purple-400 hover:text-white transition-colors font-bold ml-1"
              >
                Sign Up
              </Link>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}