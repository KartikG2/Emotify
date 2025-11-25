import React, { useEffect, useState } from "react";
import { FaSearch, FaHistory, FaRobot, FaFingerprint } from "react-icons/fa";
import { motion } from "framer-motion";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; 
import SuggestedMusic from "./SuggestedMusic";

// --- Custom Fonts & Styles Injection ---
const FontStyles = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&family=Space+Grotesk:wght@300;500;700&display=swap');
      
      .font-heading { font-family: 'Space Grotesk', sans-serif; }
      .font-body { font-family: 'Outfit', sans-serif; }
      
      .glass-panel {
        background: rgba(20, 20, 20, 0.4);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.05);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
      }
      
      .glass-search {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
      }

      .premium-gradient-text {
        background: linear-gradient(135deg, #e879f9 0%, #a855f7 50%, #6366f1 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      /* Custom Scrollbar for History */
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.02);
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(168, 85, 247, 0.5);
      }
    `}
  </style>
);

const Dashboard = () => {
  const [moodHistory, setMoodHistory] = useState([]);
  const [lastMood, setLastMood] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [user, setUser] = useState(null);
  
  // New State for Search Functionality
  const [headerSearchInput, setHeaderSearchInput] = useState(""); // What user types
  const [activeQuery, setActiveQuery] = useState("lofi"); // What actually triggers the fetch
  
  const navigate = useNavigate();

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20,
        y: (e.clientY / window.innerHeight) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Load User & Mood History
  useEffect(() => {
    const storedUser = localStorage.getItem("User");
    
    // 1. AUTH CHECK: Redirect if no user
    if (!storedUser) {
        navigate("/login");
        return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    if (parsedUser?.email) {
      axios
        .get(`https://emotify-r0ms.onrender.com/mood/history/${parsedUser.email}`, {
          withCredentials: true,
        })
        .then((res) => {
          const history = res.data.reverse();
          setMoodHistory(history);
          if (history.length > 0) {
              setLastMood(history[0]);
              // 2. SYNC: Set initial music to match last mood
              setActiveQuery(history[0].mood);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch mood history:", err);
        });
    }
  }, [navigate]);

  // 3. SEARCH HANDLER: Only search on Enter to save API calls
  const handleHeaderSearch = (e) => {
    if (e.key === 'Enter' && headerSearchInput.trim() !== "") {
        setActiveQuery(headerSearchInput);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030303] text-white font-body overflow-x-hidden selection:bg-fuchsia-500 selection:text-white">
      <FontStyles />

      {/* --- Cinematic Background --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ x: mousePosition.x * -1, y: mousePosition.y * -1 }}
          className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[150px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ x: mousePosition.x, y: mousePosition.y }}
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/15 rounded-full blur-[150px] mix-blend-screen" 
        />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      </div>

      {/* --- Top Header Bar --- */}
      <header className="relative z-20 pt-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-center md:text-left"
        >
           <p className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-1">Dashboard</p>
           <h2 className="text-4xl md:text-5xl font-heading font-bold">
            Welcome back, <span className="premium-gradient-text">{user?.username || "Guest"}</span>
          </h2>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end"
        >
          <div className="relative group w-full md:w-64 hidden sm:block">
            <input
              type="text"
              placeholder="Search library..."
              value={headerSearchInput}
              onChange={(e) => setHeaderSearchInput(e.target.value)}
              onKeyDown={handleHeaderSearch} // Triggers search on Enter
              className="glass-search w-full text-white rounded-full py-3 px-5 pl-10 text-sm focus:outline-none focus:border-purple-500 transition-all"
            />
            <FaSearch className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
          </div>
        </motion.div>
      </header>

      {/* --- Main Dashboard Grid --- */}
      <main className="relative z-10 px-6 md:px-12 py-12 max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          
          {/* Card 1: Last Detected Mood */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-panel p-8 rounded-3xl relative overflow-hidden group"
          >
             <div className="absolute top-0 right-0 p-4 opacity-20">
                <FaRobot size={40} />
             </div>
             <h3 className="text-sm font-heading text-gray-400 uppercase tracking-widest mb-6">Current State</h3>
             
             <div className="flex flex-col items-center justify-center py-4 relative">
                {/* Pulsing Glow Effect */}
                <div className="absolute w-32 h-32 bg-purple-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="text-7xl mb-4 relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                    {lastMood?.emoji || "😐"}
                </div>
                <p className="text-3xl font-bold text-white capitalize mb-1">
                    {lastMood?.mood || "Neutral"}
                </p>
                <p className="text-xs text-gray-500">Detected via Facial Scan</p>
             </div>
          </motion.div>

          {/* Card 2: Action (Scan) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-panel p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden"
          >
             <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-fuchsia-500/20 blur-[60px] rounded-full pointer-events-none" />
             
             <div>
                <h3 className="text-sm font-heading text-gray-400 uppercase tracking-widest mb-2">New Analysis</h3>
                <p className="text-2xl font-bold text-white leading-tight">
                   Analyze your mood to curate a new playlist.
                </p>
             </div>

             <div className="mt-8 flex justify-center">
                <Link
                   to="/FaceScan"
                   className="group relative w-full py-4 bg-white text-black rounded-2xl font-bold text-center overflow-hidden"
                >
                   <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                   <span className="relative flex items-center justify-center gap-2 group-hover:text-white transition-colors">
                      <FaFingerprint /> Start Face Scan
                   </span>
                </Link>
             </div>
          </motion.div>

          {/* Card 3: Mood History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-panel p-8 rounded-3xl flex flex-col max-h-[320px]"
          >
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-heading text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   <FaHistory /> Recent Logs
                </h3>
                <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-1 rounded border border-purple-400/20">
                   {moodHistory.length} Entries
                </span>
             </div>

             <ul className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
                {moodHistory.length > 0 ? (
                  moodHistory.map((entry, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                         <span className="text-xl">{entry.emoji}</span>
                         <div className="flex flex-col">
                            <span className="text-sm font-bold text-white capitalize group-hover:text-purple-300 transition-colors">{entry.mood}</span>
                            <span className="text-[10px] text-gray-500">{new Date(entry.detectedAt).toLocaleDateString()}</span>
                         </div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 text-center py-8 italic text-sm">
                     No mood history available yet.
                  </li>
                )}
             </ul>
          </motion.div>
        </div>

        {/* --- Suggested Music Section --- */}
        <motion.section 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="border-t border-white/10 pt-12"
        >
           <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
              <h3 className="text-2xl font-heading font-bold text-white">Suggested for You</h3>
           </div>
           
           {/* Passed activeQuery which is either the mood OR the user search */}
           <SuggestedMusic query={activeQuery} />
        </motion.section>

      </main>

    </div>
  );
};

export default Dashboard;