import React from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMusic } from "../context/MusicContext";

export default function GlobalPlayer() {
  const { currentTrack, isPlaying, togglePlay, nextTrack, prevTrack } = useMusic();

  return (
    <AnimatePresence>
      {currentTrack && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-[50] px-4 pb-4 pointer-events-none" // pointer-events-none lets clicks pass through surrounding areas
        >
          <div className="pointer-events-auto max-w-5xl mx-auto bg-black/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-3 shadow-2xl flex items-center justify-between gap-4">
            
            {/* Left: Song Info */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="relative w-14 h-14 shrink-0">
                <img 
                    src={currentTrack.album.images[0]?.url} 
                    alt="Art" 
                    className="w-full h-full rounded-full object-cover animate-[spin_8s_linear_infinite]" 
                    style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
                />
                <div className="absolute inset-0 rounded-full border border-white/10" />
              </div>
              <div className="min-w-0 overflow-hidden">
                <h4 className="text-white font-bold truncate text-sm sm:text-base">{currentTrack.name}</h4>
                <p className="text-xs text-gray-400 truncate">{currentTrack.artists[0]?.name}</p>
              </div>
            </div>

            {/* Center: Controls */}
            <div className="flex items-center gap-4 shrink-0">
              <button onClick={prevTrack} className="text-gray-400 hover:text-white transition-colors">
                <SkipBack size={20} />
              </button>
              
              <button 
                onClick={togglePlay} 
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shadow-lg shadow-purple-500/20"
              >
                {isPlaying ? <Pause fill="black" size={20} /> : <Play fill="black" className="ml-1" size={20} />}
              </button>
              
              <button onClick={nextTrack} className="text-gray-400 hover:text-white transition-colors">
                <SkipForward size={20} />
              </button>
            </div>

            {/* Right: Visual (Hidden on mobile) */}
            <div className="hidden sm:flex items-center gap-2 text-gray-400 shrink-0">
               <Volume2 size={16} />
               <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-2/3" />
               </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}