import React, { useEffect, useState } from "react";
import { Play, Pause, Disc, Music, BarChart2, Globe, Clock, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMusic } from "../context/MusicContext"; 

const PremiumStyles = () => (
  <style>
    {`
      @keyframes equalizer-mini { 0% { height: 20%; } 50% { height: 100%; } 100% { height: 20%; } }
      .bar-mini { width: 3px; background: #a855f7; animation: equalizer-mini 0.8s infinite ease-in-out; border-radius: 2px; }
      .glass-card-mini { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); backdrop-filter: blur(10px); transition: all 0.3s ease; }
      .glass-card-mini:hover { background: rgba(255, 255, 255, 0.08); border-color: rgba(168, 85, 247, 0.3); transform: translateY(-4px); }
    `}
  </style>
);

const SuggestedMusic1 = ({ mood, intensity, historyBias }) => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("");
  const [queryType, setQueryType] = useState({ icon: <Music size={12}/>, label: "Standard" });
  
  const { playTrack, currentTrack, isPlaying, setTracks } = useMusic();

  // --- 1. ENHANCED SMART QUERY ENGINE ---
  const generateSmartQuery = (mood, intensity, history) => {
      let queryParts = [];
      let typeInfo = { icon: <Music size={12}/>, label: "Standard" };

      // A. Mood Base
      queryParts.push(mood);

      // B. Intensity Modifiers
      if (intensity > 0.8) {
          if (mood === 'happy') queryParts.push("party dance high energy");
          if (mood === 'sad') queryParts.push("screaming emotional rock");
          if (mood === 'angry') queryParts.push("heavy metal workout");
          if (mood === 'neutral') queryParts.push("focus trance fast");
      } else if (intensity < 0.5) {
          if (mood === 'happy') queryParts.push("acoustic chill morning");
          if (mood === 'sad') queryParts.push("slow piano melancholic");
          if (mood === 'angry') queryParts.push("meditation calm peaceful");
          if (mood === 'neutral') queryParts.push("lofi sleep ambient");
      }

      // C. DISCOVERY ENGINE (The "Secret Sauce")
      // Randomly inject Flavor: 40% Trending, 30% Nostalgia, 30% Regional
      const roll = Math.random();

      if (roll < 0.4) {
          // TRENDING (40% Chance)
          queryParts.push("viral top 50 2024");
          typeInfo = { icon: <TrendingUp size={12} className="text-green-400" />, label: "Trending Now" };
      } else if (roll < 0.7) {
          // NOSTALGIA / OLD SONGS (30% Chance)
          const decades = ["90s", "2000s", "80s classic"];
          const randomDecade = decades[Math.floor(Math.random() * decades.length)];
          queryParts.push(`${randomDecade} hits`);
          typeInfo = { icon: <Clock size={12} className="text-yellow-400" />, label: `Retro ${randomDecade}` };
      } else {
          // LANGUAGE / REGIONAL (30% Chance)
          // Add more languages here if you want
          const langs = ["Bollywood Hindi", "Punjabi", "Tollywood", "English Global","kannada","Tamil","Telugu","Hollywood","marathi","bengali","Malayalam","Spanish","French","Italian","German","Japanese","Korean"];
          const randomLang = langs[Math.floor(Math.random() * langs.length)];
          queryParts.push(randomLang);
          typeInfo = { icon: <Globe size={12} className="text-blue-400" />, label: `${randomLang} Mix` };
      }

      // D. History Injection
      if (history) {
         queryParts.push(history);
      }
      
      return { query: queryParts.join(" "), type: typeInfo };
  };

  useEffect(() => {
    const fetchSongs = async () => {
      if (!mood) return;
      setLoading(true);
      
      // Generate Query
      const { query, type } = generateSmartQuery(mood, intensity, historyBias);
      setCurrentQuery(query);
      setQueryType(type);

      try {
        const res = await fetch(
          `https://v1.nocodeapi.com/kartikg1/spotify/QuJcgYtQlsFOiwcQ/search?q=${encodeURIComponent(query)}&type=track`
        );
        const data = await res.json();
        // Filter for valid preview URLs and limit results
        const validSongs = (data.tracks?.items || []).filter(track => track.preview_url).slice(0, 8); 
        setSongs(validSongs);
      } catch (err) {
        console.error("Error fetching songs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, [mood, intensity]); 

  const handlePlaySong = (track) => {
    setTracks(songs); 
    playTrack(track);
  };

  return (
    <div className="w-full">
      <PremiumStyles />
      
      {/* Algorithm Info Bar */}
      <div className="flex items-center justify-between mb-4 px-1">
         <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono uppercase truncate max-w-[70%]">
            <BarChart2 size={12} /> Query: "{currentQuery}"
         </div>
         <div className="flex items-center gap-2 text-[10px] text-white bg-white/10 px-2 py-1 rounded-full border border-white/5">
            {queryType.icon} {queryType.label}
         </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 animate-pulse">
              <div className="w-10 h-10 rounded bg-white/10" />
              <div className="h-2 w-1/2 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence mode="wait">
            {songs.map((track, index) => {
              const isActive = currentTrack?.preview_url === track.preview_url && isPlaying;

              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glass-card-mini p-2 rounded-xl flex items-center gap-3 cursor-pointer group ${
                    isActive ? "bg-purple-500/10 border-purple-500/30" : ""
                  }`}
                  onClick={() => handlePlaySong(track)}
                >
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <img src={track.album.images[0]?.url} alt={track.name} className="w-full h-full object-cover rounded-lg" />
                    {isActive && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                           <div className="flex gap-[2px] h-3 items-end">
                              <div className="w-[2px] bg-white animate-bounce" style={{animationDelay:'0.1s'}}></div>
                              <div className="w-[2px] bg-white animate-bounce" style={{animationDelay:'0.2s'}}></div>
                              <div className="w-[2px] bg-white animate-bounce" style={{animationDelay:'0.0s'}}></div>
                           </div>
                        </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-bold truncate ${isActive ? "text-purple-400" : "text-white"}`}>{track.name}</h4>
                    <p className="text-[10px] text-gray-400 truncate">{track.artists[0].name}</p>
                  </div>
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                     <Play size={14} className="text-white" />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {songs.length === 0 && !loading && (
             <div className="text-center py-8 text-gray-500 text-xs">
                No preview-enabled tracks found for this mood mix.
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuggestedMusic1;