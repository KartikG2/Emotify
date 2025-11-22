import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaShieldAlt, FaArrowRight, FaCheckCircle, FaExclamationCircle, FaRedoAlt } from "react-icons/fa";
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

      .otp-input {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        text-align: center;
        font-family: 'Space Grotesk', sans-serif;
      }
      .otp-input:focus {
        border-color: #a855f7;
        background: rgba(168, 85, 247, 0.05);
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

const OTPVerify = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [status, setStatus] = useState("idle"); 
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // New success state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [timer, setTimer] = useState(30); // 30s Countdown for Resend
  
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  // --- Countdown Logic ---
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // --- Mouse Parallax Effect ---
  useEffect(() => {
    const mouseMoveHandler = (e) => {
      setMousePos({ 
        x: (e.clientX / window.innerWidth) * 20, 
        y: (e.clientY / window.innerHeight) * 20 
      });
    };
    window.addEventListener("mousemove", mouseMoveHandler);
    return () => window.removeEventListener("mousemove", mouseMoveHandler);
  }, []);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.value && index < 5) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pastedData.every(char => !isNaN(char))) {
      const newOtp = [...otp];
      pastedData.forEach((digit, i) => { if (i < 6) newOtp[i] = digit; });
      setOtp(newOtp);
      inputRefs.current[Math.min(pastedData.length, 5)].focus();
    }
  };

  // --- Verify Logic ---
  const handleVerify = async () => {
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setStatus("error");
      setErrorMessage("Please enter a valid 6-digit code.");
      return;
    }
    setStatus("loading");
    const signupData = JSON.parse(localStorage.getItem("UserData"));
    if (!signupData || !signupData.email) {
      setStatus("error");
      setErrorMessage("Session expired. Redirecting...");
      setTimeout(() => navigate("/signup"), 2000);
      return;
    }

    try {
      await axios.post(
        "http://localhost:4000/user/verify-otp",
        { email: signupData.email, otp: otpCode },
        { withCredentials: true }
      );
      setStatus("success");
      localStorage.removeItem("UserData"); 
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error.response?.data?.msg || "Verification failed.");
      setOtp(new Array(6).fill(""));
      inputRefs.current[0].focus();
    }
  };

  // --- Resend Logic (New) ---
  const handleResend = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    const signupData = JSON.parse(localStorage.getItem("UserData"));
    
    if (!signupData || !signupData.email) {
      setErrorMessage("Session missing. Please sign up again.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/user/resend-otp", { 
        email: signupData.email 
      });
      setTimer(60); // Reset timer to 60s
      setSuccessMessage("New code sent! Check your inbox.");
    } catch (error) {
      setErrorMessage(error.response?.data?.msg || "Failed to resend code.");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030303] text-white font-body overflow-hidden flex items-center justify-center">
      <PremiumStyles />
      <div className="fixed inset-0 pointer-events-none">
        <motion.div animate={{ x: mousePos.x * -1, y: mousePos.y * -1 }} className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[150px]" />
        <motion.div animate={{ x: mousePos.x, y: mousePos.y }} className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative z-10 w-full max-w-md px-6">
        <div className="glass-card p-8 md:p-10 rounded-[2rem] border border-white/10">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-purple-500/30 mb-6">
              <FaShieldAlt className="text-2xl text-white" />
            </div>
            <h2 className="text-3xl font-heading font-bold mb-2">Security <span className="premium-gradient-text">Verification</span></h2>
            <p className="text-gray-400 text-sm leading-relaxed">Enter the 6-digit code sent to your email.</p>
          </div>

          <div className="flex justify-between gap-2 mb-8" onPaste={handlePaste}>
            {otp.map((data, index) => (
              <input
                key={index} type="text" maxLength="1"
                ref={(el) => (inputRefs.current[index] = el)}
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`otp-input w-10 h-12 md:w-12 md:h-14 rounded-xl text-xl md:text-2xl font-bold text-white focus:scale-110 transition-transform ${status === 'error' ? 'border-red-500/50 text-red-400' : ''}`}
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={status === "loading" || status === "success"}
            className={`w-full py-4 rounded-xl font-bold font-heading uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-3
              ${status === "success" ? "bg-green-500 text-white" : "bg-white text-black hover:bg-gray-200"}`}
          >
            {status === "loading" ? <><Loader2 className="animate-spin" /> Verifying...</> : status === "success" ? <><FaCheckCircle /> Verified</> : <>Verify & Proceed <FaArrowRight /></>}
          </button>

          {/* Messages */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center gap-2 text-red-400 text-xs font-medium">
                <FaExclamationCircle /> {errorMessage}
              </motion.div>
            )}
            {successMessage && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center gap-2 text-green-400 text-xs font-medium">
                <FaCheckCircle /> {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resend Section with Timer */}
          <div className="mt-8 text-center">
             <p className="text-xs text-gray-500 flex flex-col items-center gap-2">
               Didn't receive the code?
               {timer > 0 ? (
                 <span className="text-gray-400 font-mono">Resend available in 00:{timer < 10 ? `0${timer}` : timer}</span>
               ) : (
                 <button 
                   onClick={handleResend}
                   className="text-purple-400 hover:text-white transition-colors font-bold flex items-center gap-2"
                 >
                   <FaRedoAlt className="text-xs" /> Resend Code
                 </button>
               )}
             </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default OTPVerify;