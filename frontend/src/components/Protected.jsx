import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthProvider";
import { motion } from "framer-motion";
import { FaFingerprint, FaLock } from "react-icons/fa";
import { Loader2 } from "lucide-react";

// --- Premium Loading Screen Styles ---
const LoadingStyles = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&family=Space+Grotesk:wght@300;500;700&display=swap');
      .font-heading { font-family: 'Space Grotesk', sans-serif; }
      .font-body { font-family: 'Outfit', sans-serif; }
      
      .glass-loader {
        background: rgba(10, 10, 10, 0.8);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 0 40px rgba(168, 85, 247, 0.1);
      }
    `}
  </style>
);

const Protected = ({ children }) => {
  // Ensure your AuthContext provides 'loading' status!
  const { user, loading } = useContext(AuthContext); 
  const location = useLocation();

  // --- State 1: Authenticating (The Premium Loader) ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center text-white font-body relative overflow-hidden">
        <LoadingStyles />
        
        {/* Background Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] animate-pulse" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-loader p-12 rounded-[2rem] flex flex-col items-center text-center"
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
            <Loader2 size={48} className="text-purple-500 animate-spin relative z-10" />
          </div>
          
          <h2 className="text-2xl font-heading font-bold mb-2">Verifying Identity</h2>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] animate-pulse">
            Establishing Secure Connection...
          </p>
          
          <div className="mt-8 flex items-center gap-2 text-xs text-gray-600 border border-white/5 px-3 py-1 rounded-full">
             <FaLock size={10} /> 256-BIT ENCRYPTION
          </div>
        </motion.div>
      </div>
    );
  }

  // --- State 2: Not Authenticated (Redirect) ---
  if (!user) {
    // Pass the current location so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // --- State 3: Authorized (Render Content) ---
  return children;
};

export default Protected;