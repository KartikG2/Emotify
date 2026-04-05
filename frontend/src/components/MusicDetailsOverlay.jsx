import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Music, Type, Repeat, Shuffle, Volume2, SkipBack, SkipForward, Play, Pause } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import api from '../api/api';
import ProgressBar from './ProgressBar';

const MusicDetailsOverlay = ({ isOpen, onClose }) => {
  const { currentTrack, isPlaying, togglePlay, nextTrack, prevTrack } = useMusic();
  const [lyrics, setLyrics] = useState(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [activeTab, setActiveTab] = useState('playing'); // 'playing' or 'lyrics'

  useEffect(() => {
    if (isOpen && currentTrack) {
      fetchLyrics(currentTrack.id);
    }
  }, [isOpen, currentTrack]);

  const fetchLyrics = async (songId) => {
    setLoadingLyrics(true);
    try {
      const res = await api.get(`/Music/suggestions?songId=${songId}`);
      if (res.data.success) {
        setLyrics(res.data.lyrics);
      } else {
        setLyrics([{ words: "Lyrics not available for this track." }]);
      }
    } catch (error) {
      console.error("Lyrics Error:", error);
      setLyrics([{ words: "Unable to load lyrics at this time." }]);
    } finally {
      setLoadingLyrics(false);
    }
  };

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[60] bg-black flex flex-col md:flex-row"
        >
          {/* Dynamic Background Blur */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img 
              src={currentTrack.album.images[0]?.url} 
              alt="Background" 
              className="w-full h-full object-cover scale-150 blur-[100px] opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black" />
          </div>

          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white backdrop-blur-md"
          >
            <X size={24} />
          </button>

          {/* Left Side: Artwork & Main Info */}
          <div className={`relative flex-1 flex flex-col items-center justify-center p-8 transition-all duration-500 ${activeTab === 'lyrics' ? 'md:max-w-md' : 'w-full'}`}>
            <motion.div 
              layoutId="player-art"
              className="relative w-full max-w-[400px] aspect-square rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-12"
            >
              <img 
                src={currentTrack.album.images[0]?.url} 
                alt={currentTrack.name} 
                className={`w-full h-full object-cover transition-transform duration-1000 ${isPlaying ? 'scale-105' : 'scale-100'}`}
              />
            </motion.div>

            <div className="text-center w-full max-w-md">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 truncate">{currentTrack.name}</h2>
              <p className="text-xl text-purple-400 font-medium mb-8">{currentTrack.artists[0]?.name}</p>
              
              <div className="mb-12">
                <ProgressBar />
              </div>

              <div className="flex items-center justify-center gap-8 md:gap-12">
                <button onClick={prevTrack} className="text-white transform hover:scale-110 active:scale-95 transition-all outline-none">
                  <SkipBack size={32} />
                </button>
                <button 
                  onClick={togglePlay}
                  className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center shadow-xl shadow-purple-500/20 transform hover:scale-105 active:scale-95 transition-all outline-none"
                >
                  {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </button>
                <button onClick={nextTrack} className="text-white transform hover:scale-110 active:scale-95 transition-all outline-none">
                  <SkipForward size={32} />
                </button>
              </div>

              {/* Mobile Tab Switcher */}
              <div className="flex md:hidden mt-12 gap-4 justify-center">
                 <button 
                  onClick={() => setActiveTab('playing')}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'playing' ? 'bg-white text-black' : 'bg-white/10 text-white'}`}
                 >
                   Playing
                 </button>
                 <button 
                  onClick={() => setActiveTab('lyrics')}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'lyrics' ? 'bg-white text-black' : 'bg-white/10 text-white'}`}
                 >
                   Lyrics
                 </button>
              </div>
            </div>
          </div>

          {/* Right Side: Lyrics Panel */}
          <motion.div 
            className={`relative flex-1 bg-white/5 backdrop-blur-2xl border-l border-white/10 flex flex-col p-8 md:p-12 overflow-hidden transition-all duration-500 ${activeTab === 'lyrics' || window.innerWidth > 768 ? 'opacity-100' : 'opacity-0 h-0 md:h-auto'}`}
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <Type className="text-purple-500" /> Lyrics
              </h3>
              {loadingLyrics && <Loader2 className="animate-spin text-purple-500" />}
            </div>

            <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide space-y-6">
              {lyrics ? (
                lyrics.map((line, idx) => (
                  <p 
                    key={idx} 
                    className="text-2xl md:text-3xl font-bold text-white/50 hover:text-white transition-all cursor-pointer leading-tight"
                  >
                    {line.words}
                  </p>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 italic">
                  Search melodies...
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Helper for Lucide Loader which I missed in imports
const Loader2 = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

export default MusicDetailsOverlay;
