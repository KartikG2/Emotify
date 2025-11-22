import React, { useEffect, useState, useRef } from "react";
import { Play, Pause, Disc, Music, Volume2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Premium Styles (Scoped) ---
const PremiumStyles = () => (
  <style>
    {`
      /* Equalizer Animation */
      @keyframes equalizer-mini {
        0% { height: 20%; }
        50% { height: 100%; }
        100% { height: 20%; }
      }
      .bar-mini {
        width: 3px;
        background: #a855f7;
        animation: equalizer-mini 0.8s infinite ease-in-out;
        border-radius: 2px;
      }
      .bar-mini:nth-child(1) { animation-delay: 0.1s; }
      .bar-mini:nth-child(2) { animation-delay: 0.3s; }
      .bar-mini:nth-child(3) { animation-delay: 0.0s; }
      .bar-mini:nth-child(4) { animation-delay: 0.4s; }

      /* Glass Effect for Cards */
      .glass-card-mini {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
      }
      .glass-card-mini:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: rgba(168, 85, 247, 0.3);
        transform: translateY(-4px);
      }
    `}
  </style>
);

const SuggestedMusic1 = ({ expression }) => {
  const [songs, setSongs] = useState([]);
  const [playingUrl, setPlayingUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const fetchSongs = async () => {
      if (!expression) return;
      setLoading(true);
      setSongs([]); // Clear previous results immediately

      try {
        // Note: In production, move API keys to .env variables
        const res = await fetch(
          `https://v1.nocodeapi.com/satyam88singh/spotify/ydfAheeOBfBczwCO/search?q=${expression}&type=track`
        );
        const data = await res.json();
        
        // Filter only songs with valid preview URLs
        const validSongs = (data.tracks?.items || []).filter(track => track.preview_url);
        setSongs(validSongs);
      } catch (err) {
        console.error("Error fetching songs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
    
    // Cleanup audio on unmount or expression change
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingUrl(null);
      }
    };
  }, [expression]);

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

  return (
    <div className="w-full">
      <PremiumStyles />

      {/* --- Loading State --- */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 animate-pulse">
              <div className="w-12 h-12 rounded-lg bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 bg-white/10 rounded" />
                <div className="h-2 w-1/2 bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence mode="wait">
            {songs.length > 0 ? (
              songs.map((track, index) => {
                const isPlaying = playingUrl === track.preview_url;

                return (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`glass-card-mini p-3 rounded-xl flex items-center gap-4 group cursor-pointer ${
                      isPlaying ? "bg-purple-500/10 border-purple-500/30" : ""
                    }`}
                    onClick={() => handlePlay(track.preview_url)}
                  >
                    {/* Album Art + Play Button Overlay */}
                    <div className="relative w-14 h-14 flex-shrink-0">
                      <img
                        src={track.album.images[0]?.url}
                        alt={track.name}
                        className="w-full h-full object-cover rounded-lg shadow-lg"
                      />
                      <div className={`absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center transition-opacity duration-200 ${
                        isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}>
                        {isPlaying ? (
                          <Pause size={16} className="text-white fill-white" />
                        ) : (
                          <Play size={16} className="text-white fill-white ml-0.5" />
                        )}
                      </div>
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-bold truncate ${isPlaying ? "text-purple-400" : "text-white"}`}>
                        {track.name}
                      </h4>
                      <p className="text-xs text-gray-400 truncate">
                        {track.artists.map(a => a.name).join(", ")}
                      </p>
                    </div>

                    {/* Visualizer / Status Icon */}
                    <div className="flex-shrink-0">
                      {isPlaying ? (
                        <div className="flex gap-[2px] items-end h-4">
                          <div className="bar-mini h-2"></div>
                          <div className="bar-mini h-3"></div>
                          <div className="bar-mini h-1"></div>
                        </div>
                      ) : (
                        <Disc size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full py-8 text-center opacity-50">
                 <Music size={32} className="mx-auto mb-2 text-gray-600" />
                 <p className="text-sm font-mono text-gray-500 uppercase">No exact matches found.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio ref={audioRef} onEnded={() => setPlayingUrl(null)} onError={() => setPlayingUrl(null)} />
    </div>
  );
};

export default SuggestedMusic1;