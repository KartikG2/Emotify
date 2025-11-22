import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Search, Music, Disc, Loader2, Volume2, SkipBack, SkipForward, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Custom Premium Styles ---
const PremiumStyles = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&family=Space+Grotesk:wght@300;500;700&display=swap');
      
      :root {
        --primary: #a855f7;
        --bg-deep: #050505;
        --glass-border: rgba(255, 255, 255, 0.08);
      }

      .font-heading { font-family: 'Space Grotesk', sans-serif; }
      .font-body { font-family: 'Outfit', sans-serif; }
      
      .glass-panel {
        background: rgba(20, 20, 20, 0.4);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid var(--glass-border);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
      }

      .glass-input {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid var(--glass-border);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
      }
      .glass-input:focus {
        background: rgba(255, 255, 255, 0.08);
        border-color: var(--primary);
        box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.1);
      }

      .premium-gradient-text {
        background: linear-gradient(135deg, #fff 0%, #d8b4fe 50%, #a855f7 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      /* Sticky Player Blur */
      .sticky-player {
        background: rgba(10, 10, 10, 0.85);
        backdrop-filter: blur(20px);
        border-top: 1px solid var(--glass-border);
      }

      /* Equalizer Animation */
      @keyframes bounce {
        0%, 100% { height: 4px; }
        50% { height: 16px; }
      }
      .eq-bar {
        width: 3px;
        background: var(--primary);
        border-radius: 2px;
        animation: bounce 1s infinite ease-in-out;
      }
      .eq-paused { animation-play-state: paused; height: 4px; }
    `}
  </style>
);

export default function MusicPlayer() {
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null); // Holds full track object
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("lofi"); // Default search
  const [loading, setLoading] = useState(false);
  
  const audioRef = useRef(null);

  // Initial Load
  useEffect(() => {
    fetchTracks(searchQuery);
  }, []);

  const fetchTracks = async (query) => {
    if (!query) return;
    setLoading(true);
    try {
      // Note: Using the API key from your snippet. In prod, use env vars.
      const res = await fetch(
        `https://v1.nocodeapi.com/satyam88singh/spotify/ydfAheeOBfBczwCO/search?q=${query}&type=track`
      );
      const data = await res.json();
      const songData = data.tracks?.items || [];
      const filtered = songData.filter((track) => track.preview_url);
      setTracks(filtered);
    } catch (err) {
      console.error("Error fetching tracks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTracks(searchQuery);
  };

  const playTrack = (track) => {
    const audio = audioRef.current;
    
    // If clicking the currently playing track -> Toggle Pause
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play();
        setIsPlaying(true);
      }
    } else {
      // New Track
      setCurrentTrack(track);
      setIsPlaying(true);
      audio.src = track.preview_url;
      audio.play().catch((err) => console.error("Playback Error:", err));
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-body selection:bg-purple-500 selection:text-white pb-32">
      <PremiumStyles />

      {/* --- Ambient Background --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12">
        
        {/* --- Header --- */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-gray-400 mb-4 tracking-widest uppercase">
              <Music size={12} className="text-purple-500" /> Official Audio Engine
            </div>
            <h1 className="text-5xl md:text-6xl font-heading font-bold tracking-tight">
              Sonic <span className="premium-gradient-text">Library</span>
            </h1>
          </div>

          {/* --- Search Bar --- */}
          <form onSubmit={handleSearch} className="w-full md:w-auto relative group">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search song, artist, or mood..."
              className="glass-input w-full md:w-96 py-4 px-6 pl-12 rounded-full text-sm text-white placeholder-gray-500"
            />
            <Search className="absolute left-4 top-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={20} />
            <button type="submit" className="absolute right-2 top-2.5 bg-white/10 p-1.5 rounded-full hover:bg-purple-600 hover:text-white transition-all">
               {loading ? <Loader2 size={18} className="animate-spin" /> : <Disc size={18} />}
            </button>
          </form>
        </motion.div>

        {/* --- Tracks Grid --- */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
             {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="h-64 bg-white/5 rounded-3xl animate-pulse" />
             ))}
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {tracks.map((track, index) => {
                const isActive = currentTrack?.id === track.id;
                
                return (
                  <motion.div
                    key={track.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8 }}
                    className={`glass-panel p-4 rounded-[2rem] cursor-pointer group transition-all duration-300 ${isActive ? 'border-purple-500/40 bg-purple-500/5' : 'hover:bg-white/5'}`}
                    onClick={() => playTrack(track)}
                  >
                    {/* Album Art Container */}
                    <div className="relative aspect-square rounded-[1.5rem] overflow-hidden mb-4 shadow-2xl">
                      <img
                        src={track.album.images[0]?.url}
                        alt={track.name}
                        className={`w-full h-full object-cover transition-transform duration-700 ${isActive && isPlaying ? 'scale-110' : 'group-hover:scale-105'}`}
                      />
                      
                      {/* Overlay */}
                      <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                          {isActive && isPlaying ? <Pause fill="black" size={20} /> : <Play fill="black" className="ml-1" size={20} />}
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex justify-between items-start gap-2 px-1">
                      <div className="overflow-hidden">
                        <h3 className={`font-heading font-bold text-lg truncate ${isActive ? 'text-purple-400' : 'text-white'}`}>
                          {track.name}
                        </h3>
                        <p className="text-sm text-gray-400 truncate">{track.artists[0]?.name}</p>
                      </div>
                      
                      {/* Mini Visualizer */}
                      {isActive && isPlaying && (
                        <div className="flex gap-1 items-end h-4 mt-2">
                          <div className="eq-bar" style={{ animationDelay: '0s' }}></div>
                          <div className="eq-bar" style={{ animationDelay: '0.2s' }}></div>
                          <div className="eq-bar" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && tracks.length === 0 && (
           <div className="text-center py-32 opacity-50">
              <Disc size={64} className="mx-auto mb-4 text-gray-700" />
              <p className="font-heading text-xl text-gray-500">No sonic data found.</p>
           </div>
        )}
      </div>

      {/* --- Sticky Bottom Player --- */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 sticky-player z-50 px-6 py-4 md:px-12"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              
              {/* Left: Info */}
              <div className="flex items-center gap-4">
                <img 
                  src={currentTrack.album.images[0]?.url} 
                  alt="Art" 
                  className="w-14 h-14 rounded-xl shadow-lg animate-[spin_10s_linear_infinite]" 
                  style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
                />
                <div className="hidden sm:block">
                  <h4 className="text-white font-bold font-heading">{currentTrack.name}</h4>
                  <p className="text-xs text-gray-400">{currentTrack.artists[0]?.name}</p>
                </div>
                <button className="ml-4 text-gray-400 hover:text-purple-500 transition-colors">
                  <Heart size={18} />
                </button>
              </div>

              {/* Center: Controls */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-6">
                  <button className="text-gray-400 hover:text-white transition-colors"><SkipBack size={20} /></button>
                  <button 
                    onClick={() => playTrack(currentTrack)}
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform text-black shadow-lg shadow-purple-500/20"
                  >
                    {isPlaying ? <Pause fill="black" size={20} /> : <Play fill="black" className="ml-1" size={20} />}
                  </button>
                  <button className="text-gray-400 hover:text-white transition-colors"><SkipForward size={20} /></button>
                </div>
                {/* Progress Bar (Visual only for demo) */}
                <div className="w-full md:w-96 h-1 bg-white/10 rounded-full overflow-hidden mt-2">
                   <motion.div 
                      className="h-full bg-purple-500" 
                      initial={{ width: "0%" }}
                      animate={{ width: isPlaying ? "100%" : "0%" }}
                      transition={{ duration: 30, ease: "linear", repeat: Infinity }} // 30s preview duration
                   />
                </div>
              </div>

              {/* Right: Volume (Visual) */}
              <div className="hidden md:flex items-center gap-3 min-w-[100px]">
                 <Volume2 size={18} className="text-gray-400" />
                 <div className="h-1 flex-1 bg-white/20 rounded-full">
                    <div className="w-[70%] h-full bg-white rounded-full" />
                 </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        onEnded={() => setIsPlaying(false)}
        onError={(e) => console.error("Audio Error", e)}
      />
    </div>
  );
}