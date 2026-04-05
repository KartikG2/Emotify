import React, { useState, useEffect } from "react";
import { Play, Pause, Search, Disc, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMusic } from "../context/MusicContext";

// ... (PremiumStyles) ...
const PremiumStyles = () => (
  <style>{`
      @keyframes equalizer-mini { 0% { height: 20%; } 50% { height: 100%; } 100% { height: 20%; } }
      .bar-mini { width: 3px; background: #a855f7; animation: equalizer-mini 0.8s infinite ease-in-out; border-radius: 2px; }
      .glass-card-mini { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); backdrop-filter: blur(10px); transition: all 0.3s ease; }
      .glass-card-mini:hover { background: rgba(255, 255, 255, 0.08); border-color: rgba(168, 85, 247, 0.3); transform: translateY(-4px); }
      .sticky-player { background: rgba(0,0,0,0.8); backdrop-blur: 24px; border-top: 1px solid rgba(255,255,255,0.1); }
    `}</style>
);

export default function MusicPlayer() {
  const {
    tracks,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    fetchTracks
  } = useMusic();

  const [searchQuery, setSearchQuery] = useState("trending");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tracks.length === 0) handleFetch("trending");
  }, []);

  const handleFetch = async (query) => {
    setLoading(true);
    await fetchTracks(query);
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleFetch(searchQuery);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-body selection:bg-purple-500 selection:text-white pb-32">
      <PremiumStyles />

      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
          <div>
            <h1 className="text-5xl md:text-6xl font-heading font-bold tracking-tight">
              Sonic <span className="premium-gradient-text">Library</span>
            </h1>
          </div>
          <form onSubmit={handleSearch} className="w-full md:w-auto relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search song, artist, or mood..."
              className="glass-input w-full md:w-96 py-4 px-6 pl-12 rounded-full text-sm text-white bg-white/5 border border-white/10"
            />
            <button type="submit" className="absolute right-2 top-2.5 bg-white p-1.5 rounded-full text-black">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            </button>
          </form>
        </motion.div>

        {loading ? (
          <div className="text-center mt-20 text-gray-500 animate-pulse">Scanning Frequencies...</div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {tracks.map((track) => {
                const isActive = currentTrack?.id === track.id;
                return (
                  <motion.div
                    key={track.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ y: -8 }}
                    className={`glass-panel p-4 rounded-[2rem] cursor-pointer group transition-all duration-300 ${isActive ? 'border-purple-500/40 bg-purple-500/5' : 'hover:bg-white/5'}`}
                    onClick={() => playTrack(track)}
                  >
                    <div className="relative aspect-square rounded-[1.5rem] overflow-hidden mb-4 shadow-2xl">
                      <img src={track.album.images[0]?.url} alt={track.name} className="w-full h-full object-cover" />
                      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center">
                          {isActive && isPlaying ? <Pause size={20} /> : <Play className="ml-1" size={20} />}
                        </div>
                      </div>
                    </div>
                    <h3 className={`font-bold truncate ${isActive ? 'text-purple-400' : 'text-white'}`}>{track.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{track.artists[0]?.name}</p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}