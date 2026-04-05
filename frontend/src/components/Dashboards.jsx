import React, { useEffect, useState, useRef } from "react";
import { FaSearch, FaHistory, FaRobot, FaFingerprint } from "react-icons/fa";
import { motion } from "framer-motion";
import api from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import SuggestedMusic from "./SuggestedMusic";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, YAxis } from "recharts";

// --- Hero Mouse Parallax Throttling ---
const useMouseParallax = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        setMousePosition({
          x: (e.clientX / window.innerWidth) * 20,
          y: (e.clientY / window.innerHeight) * 20,
        });
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return mousePosition;
};

const Dashboard = () => {
  const [moodHistory, setMoodHistory] = useState([]);
  const [lastMood, setLastMood] = useState(null);
  const mousePosition = useMouseParallax();
  const [user, setUser] = useState(null);

  const [headerSearchInput, setHeaderSearchInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("trending songs");

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("User");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    if (parsedUser?.email) {
      api.get(`/mood/history/${parsedUser.email}`)
        .then((res) => {
          const history = res.data.reverse();
          setMoodHistory(history);
          if (history.length > 0) {
            setLastMood(history[0]);
            setActiveQuery(history[0].mood);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch mood history:", err);
        });
    }
  }, [navigate]);

  const handleHeaderSearch = (e) => {
    if (e.key === 'Enter' && headerSearchInput.trim() !== "") {
      setActiveQuery(headerSearchInput);
    }
  };

  const getAuraColors = () => {
    const mood = lastMood?.mood?.toLowerCase() || 'neutral';
    switch (mood) {
      case 'sad': return ['bg-blue-900/30', 'bg-slate-800/30'];
      case 'happy': return ['bg-orange-600/20', 'bg-yellow-500/20'];
      case 'angry': return ['bg-red-700/20', 'bg-orange-900/20'];
      case 'fearful': return ['bg-teal-900/20', 'bg-gray-800/20'];
      case 'surprised': return ['bg-pink-600/20', 'bg-purple-600/20'];
      case 'disgusted': return ['bg-green-900/20', 'bg-lime-900/20'];
      default: return ['bg-purple-900/20', 'bg-blue-900/15'];
    }
  };
  const [aura1, aura2] = getAuraColors();

  const analyticsData = [...moodHistory].reverse().map((entry, idx) => {
     let val = 50;
     const md = entry.mood.toLowerCase();
     if(md === 'happy') val = 100;
     else if(md === 'neutral' || md === 'surprised') val = 50;
     else if(md === 'sad' || md === 'fearful' || md === 'disgusted') val = 10;
     else if(md === 'angry') val = 20;

     return { 
       name: new Date(entry.detectedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }), 
       Positivity: val, 
       Mood: entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1) 
     };
  });

  return (
    <div className="relative min-h-screen bg-[#030303] text-white font-body overflow-x-hidden selection:bg-fuchsia-500 selection:text-white">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: mousePosition.x * -1, y: mousePosition.y * -1 }}
          className={`absolute top-[-10%] left-[-10%] w-[600px] h-[600px] ${aura1} rounded-full blur-[100px] mix-blend-screen transition-colors duration-1000`}
        />
        <motion.div
          animate={{ x: mousePosition.x, y: mousePosition.y }}
          className={`absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] ${aura2} rounded-full blur-[100px] mix-blend-screen transition-colors duration-1000`}
        />
        <div className="absolute inset-0 opacity-[0.05] translate-z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>

      <header className="relative z-20 pt-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-center md:text-left">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-1">Dashboard</p>
          <h2 className="text-4xl md:text-5xl font-heading font-bold">
            Welcome back, <span className="premium-gradient-text">{user?.username || "Guest"}</span>
          </h2>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end">
          <div className="relative group w-full md:w-64 hidden sm:block">
            <input
              type="text"
              placeholder="Search library..."
              value={headerSearchInput}
              onChange={(e) => setHeaderSearchInput(e.target.value)}
              onKeyDown={handleHeaderSearch}
              className="glass-search w-full text-white rounded-full py-3 px-5 pl-10 text-sm focus:outline-none focus:border-purple-500 transition-all"
            />
            <FaSearch className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
          </div>
        </motion.div>
      </header>

      <main className="relative z-10 px-6 md:px-12 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="glass-panel p-8 rounded-3xl relative overflow-hidden group will-change-transform">
            <div className="absolute top-0 right-0 p-4 opacity-20"><FaRobot size={40} /></div>
            <h3 className="text-sm font-heading text-gray-400 uppercase tracking-widest mb-6">Current State</h3>
            <div className="flex flex-col items-center justify-center py-4 relative">
              <div className="absolute w-32 h-32 bg-purple-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="text-7xl mb-4 relative z-10 transform group-hover:scale-110 transition-transform duration-300">{lastMood?.emoji || "😐"}</div>
              <p className="text-3xl font-bold text-white capitalize mb-1">{lastMood?.mood || "Neutral"}</p>
              <p className="text-xs text-gray-500">Detected via Facial Scan</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="glass-panel p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-fuchsia-500/20 blur-[60px] rounded-full pointer-events-none" />
            <div>
              <h3 className="text-sm font-heading text-gray-400 uppercase tracking-widest mb-2">New Analysis</h3>
              <p className="text-2xl font-bold text-white leading-tight">Analyze your mood to curate a new playlist.</p>
            </div>
            <div className="mt-8 flex justify-center">
              <Link to="/FaceScan" className="group relative w-full py-4 bg-white text-black rounded-2xl font-bold text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center justify-center gap-2 group-hover:text-white transition-colors"><FaFingerprint /> Start Face Scan</span>
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="glass-panel p-8 rounded-3xl flex flex-col max-h-[320px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-heading text-gray-400 uppercase tracking-widest flex items-center gap-2"><FaHistory /> Recent Logs</h3>
              <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-1 rounded border border-purple-400/20">{moodHistory.length} Entries</span>
            </div>
            <ul className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
              {moodHistory.length > 0 ? (
                moodHistory.map((entry, index) => (
                  <li key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group">
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
                <li className="text-gray-500 text-center py-8 italic text-sm">No mood history available yet.</li>
              )}
            </ul>
          </motion.div>
        </div>

        {/* Emotional Analytics Journey Chart */}
        {moodHistory.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="glass-panel p-6 md:p-8 rounded-3xl mb-16 relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
            <h3 className="text-sm font-heading text-gray-400 uppercase tracking-widest mb-6">Emotional Journey Analytics</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                  <XAxis dataKey="name" stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff40" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} ticks={[0, 50, 100]} tickFormatter={(val) => val === 100 ? 'High' : val === 50 ? 'Med' : 'Low'} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #ffffff20', borderRadius: '12px' }}
                    labelStyle={{ color: '#a855f7', fontWeight: 'bold', marginBottom: '4px' }}
                    formatter={(value, name, props) => [props.payload.Mood, 'Detected Mood']}
                  />
                  <Line type="monotone" dataKey="Positivity" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#0a0a0a', stroke: '#a855f7', strokeWidth: 2, r: 5 }} activeDot={{ r: 7, fill: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-xs text-gray-500 mt-4">Your emotional volatility index over your recent scan history.</p>
          </motion.div>
        )}

        <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }} className="border-t border-white/10 pt-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
            <h3 className="text-2xl font-heading font-bold text-white">Suggested for You</h3>
          </div>
          <SuggestedMusic query={activeQuery} />
        </motion.section>
      </main>
    </div>
  );
};

export default Dashboard;