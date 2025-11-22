import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck, Lock } from "lucide-react";

// --- Premium Styles ---
const PremiumStyles = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&family=Space+Grotesk:wght@300;500;700&display=swap');
      
      .font-heading { font-family: 'Space Grotesk', sans-serif; }
      .font-body { font-family: 'Outfit', sans-serif; }
      
      .glass-loader-card {
        background: rgba(10, 10, 10, 0.6);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 0 40px rgba(168, 85, 247, 0.1);
      }
      
      .premium-gradient-text {
        background: linear-gradient(135deg, #fff 0%, #d8b4fe 50%, #a855f7 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    `}
  </style>
);

export default function Callback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying Credentials...");

  useEffect(() => {
    const processLogin = async () => {
      // 1. Extract Token
      const hash = window.location.hash;
      const token = new URLSearchParams(hash.substring(1)).get("access_token");

      if (token) {
        // 2. Success State
        setStatus("Secure Connection Established");
        localStorage.setItem("spotify_token", token);
        
        // 3. Smooth Redirect (Delay for UX)
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        // 4. Error/Fallback State
        setStatus("Authentication Failed. Redirecting...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    };

    processLogin();
  }, [navigate]);

  return (
    <div className="relative min-h-screen bg-[#030303] text-white font-body overflow-hidden flex items-center justify-center selection:bg-purple-500 selection:text-white">
      <PremiumStyles />

      {/* --- Cinematic Background --- */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-fuchsia-900/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      </div>

      {/* --- Main Loader Card --- */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10"
      >
        <div className="glass-loader-card p-12 rounded-[2.5rem] flex flex-col items-center text-center max-w-sm w-full mx-4">
          
          {/* Animated Icon Container */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
            <div className="relative w-20 h-20 bg-gradient-to-tr from-purple-900 to-black rounded-full flex items-center justify-center border border-purple-500/30 shadow-xl">
               {status.includes("Failed") ? (
                 <Lock className="text-red-400 w-8 h-8" />
               ) : status.includes("Established") ? (
                 <ShieldCheck className="text-green-400 w-8 h-8" />
               ) : (
                 <Loader2 className="text-purple-400 w-8 h-8 animate-spin" />
               )}
            </div>
          </div>

          {/* Text Content */}
          <h2 className="text-2xl font-heading font-bold mb-3 tracking-wide">
            Authenticating
          </h2>
          
          <p className="text-gray-400 text-sm font-mono uppercase tracking-widest mb-8">
            {status}
          </p>

          {/* Progress Indicator */}
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-purple-500"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </div>

        </div>
      </motion.div>
    </div>
  );
}