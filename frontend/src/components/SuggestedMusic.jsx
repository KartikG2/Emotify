import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, Search, Disc, Music, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Premium Styles ---
const PremiumStyles = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&family=Space+Grotesk:wght@300;500;700&display=swap');
      
      .font-heading { font-family: 'Space Grotesk', sans-serif; }
      .font-body { font-family: 'Outfit', sans-serif; }
      
      .glass-panel {
        background: rgba(20, 20, 20, 0.6);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
      }

      .glass-input {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
      }
      .glass-input:focus {
        background: rgba(255, 255, 255, 0.1);
        border-color: #a855f7;
        box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.1);
        outline: none;
      }

      @keyframes equalizer {
        0% { height: 20%; }
        50% { height: 100%; }
        100% { height: 20%; }
      }
      .bar {
        width: 3px;
        background: #a855f7;
        animation: equalizer 0.8s infinite ease-in-out;
        border-radius: 2px;
      }
      .bar:nth-child(1) { animation-delay: 0.1s; }
      .bar:nth-child(2) { animation-delay: 0.3s; }
      .bar:nth-child(3) { animation-delay: 0.0s; }
      .bar:nth-child(4) { animation-delay: 0.4s; }
    `}
  </style>
);

const SuggestedMusic = ({ query }) => {
  const [songs, setSongs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [playingUrl, setPlayingUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);

  // --- Fetch Logic ---
  const fetchSongs = async (searchQuery) => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://v1.nocodeapi.com/satyam88singh/spotify/ydfAheeOBfBczwCO/search?q=${searchQuery}&type=track`
      );
      const data = await res.json();
      // Filter out tracks without preview URLs
      const validSongs = (data.tracks?.items || []).filter(song => song.preview_url);
      setSongs(validSongs);
    } catch (err) {
      console.error("Error fetching songs:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Effects ---
  useEffect(() => {
    if (query) {
      setSearchTerm(query); // Update search bar text to match query
      fetchSongs(query);
    }
  }, [query]);

  // --- Handlers ---
  const handlePlay = (url) => {
    const audio = audioRef.current;
    if (!url || !audio) return;

    if (playingUrl === url) {
      audio.pause();
      setPlayingUrl(null);
    } else {
      audio.src = url;
      audio.play().catch((err) => console.error("Playback error:", err));
      setPlayingUrl(url);
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    fetchSongs(searchTerm);
  };

  return (
    <div className="w-full text-white font-body">
      <PremiumStyles />

      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-purple-400 mb-2 uppercase tracking-widest">
             <Disc size={14} className="animate-spin-slow" /> AI Curation
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold">
             Sonic <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-500">Landscape</span>
          </h2>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleManualSearch} className="relative w-full md:w-80 group">
          <input
            type="text"
            placeholder="Search vibe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input w-full py-3 pl-10 pr-12 rounded-full text-sm text-white placeholder-gray-500"
          />
          <Search className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={16} />
          <button 
            type="submit"
            className="absolute right-2 top-2 bg-white/10 p-1.5 rounded-full hover:bg-purple-600 hover:text-white transition-all"
          >
            <Music size={14} />
          </button>
        </form>
      </div>

      {/* --- Content Grid --- */}
      {loading ? (
        // Skeleton Loading State
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white/5 rounded-[1.5rem] h-64 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence>
            {songs.length > 0 ? (
              songs.map((track, index) => {
                const isPlaying = playingUrl === track.preview_url;

                return (
                  <motion.div
                    key={track.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8 }}
                    className={`glass-panel p-4 rounded-[1.5rem] group cursor-pointer transition-all duration-300 ${
                      isPlaying ? "border-purple-500/50 bg-purple-500/5" : "hover:border-white/20 hover:bg-white/5"
                    }`}
                    onClick={() => handlePlay(track.preview_url)}
                  >
                    {/* Album Art */}
                    <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 shadow-2xl">
                      <img
                        src={track.album.images[0]?.url}
                        alt={track.name}
                        className={`w-full h-full object-cover transition-transform duration-700 ${
                          isPlaying ? "scale-110" : "group-hover:scale-110"
                        }`}
                      />
                      
                      {/* Play Overlay */}
                      <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-300 ${
                        isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}>
                        <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                          {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-1" />}
                        </div>
                      </div>
                    </div>

                    {/* Song Info */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="overflow-hidden">
                        <h3 className={`font-heading font-bold text-lg truncate ${isPlaying ? "text-purple-400" : "text-white"}`}>
                          {track.name}
                        </h3>
                        <p className="text-xs text-gray-400 truncate group-hover:text-gray-300 transition-colors">
                          {track.artists.map(a => a.name).join(", ")}
                        </p>
                      </div>

                      {/* Mini Visualizer */}
                      {isPlaying ? (
                        <div className="flex gap-[2px] items-end h-4 mt-1">
                          <div className="bar h-2"></div>
                          <div className="bar h-3"></div>
                          <div className="bar h-1"></div>
                          <div className="bar h-4"></div>
                        </div>
                      ) : (
                        <Volume2 size={16} className="text-gray-600 mt-1" />
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full py-20 text-center opacity-50">
                <Disc size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="font-heading text-xl">No audio matches found.</p>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Hidden Audio Player */}
      <audio ref={audioRef} onEnded={() => setPlayingUrl(null)} />
    </div>
  );
};

export default SuggestedMusic;