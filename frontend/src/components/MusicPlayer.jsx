import React, { useState, useEffect } from "react";
import { Play, Pause, Search, Disc, Loader2, Volume2, SkipBack, SkipForward } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMusic } from "../context/MusicContext";

// ... (Keep PremiumStyles exactly as it was) ...
const PremiumStyles = () => (
  <style>{/* ... your styles ... */}</style>
);

export default function MusicPlayer() {
  // Import centralized logic
  const { 
    tracks, 
    currentTrack, 
    isPlaying, 
    playTrack, 
    togglePlay,
    nextTrack,
    prevTrack,
    fetchTracks // Import the fetch function
  } = useMusic();

  const [searchQuery, setSearchQuery] = useState("lofi");
  const [loading, setLoading] = useState(false);
  
  // Initial Load
  useEffect(() => {
    if(tracks.length === 0) handleFetch("lofi");
  }, []);

  // Helper to handle loading state + context fetch
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
      
      {/* ... Ambient Background ... */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20">
         {/* Header & Search */}
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
                className="glass-input w-full md:w-96 py-4 px-6 pl-12 rounded-full text-sm text-black placeholder-gray-500"
              />
              <button type="submit" className="absolute right-2 top-2.5 bg-black p-1.5 rounded-full">
                 {loading ? <Loader2 size={18} className="animate-spin" /> : <Disc size={18} />}
              </button>
           </form>
         </motion.div>

         {/* Tracks Grid */}
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
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
         )}
      </div>

      {/* Sticky Player */}
      {/* <AnimatePresence>
        {currentTrack && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 sticky-player z-50 px-6 py-4 md:px-12"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={currentTrack.album.images[0]?.url} alt="Art" className="w-14 h-14 rounded-xl animate-[spin_10s_linear_infinite]" style={{ animationPlayState: isPlaying ? 'running' : 'paused' }} />
                <div>
                  <h4 className="text-white font-bold">{currentTrack.name}</h4>
                  <p className="text-xs text-gray-400">{currentTrack.artists[0]?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <button onClick={prevTrack} className="text-gray-400 hover:text-white"><SkipBack size={20} /></button>
                <button onClick={togglePlay} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-lg shadow-purple-500/20">
                  {isPlaying ? <Pause size={20} /> : <Play className="ml-1" size={20} />}
                </button>
                <button onClick={nextTrack} className="text-gray-400 hover:text-white"><SkipForward size={20} /></button>
              </div>

              <div className="hidden md:flex items-center gap-3">
                  <Volume2 size={18} className="text-gray-400" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}
    </div>
  );
}