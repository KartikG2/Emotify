import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from "react";
import api from "../api/api"; // Import Unified API Utility

const MusicContext = createContext();

export const useMusic = () => useContext(MusicContext);

export const MusicProvider = ({ children }) => {
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1.0); 
  
  // -- NEW: State for Track Metadata/Time --
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef(null);
  const isFetchingRef = useRef(false);

  // --- FALLBACK DATA ---
  const FALLBACK_TRACKS = useMemo(() => [
    {
      id: "demo1",
      name: "Chill Lofi Beat",
      preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      album: { images: [{ url: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop" }] },
      artists: [{ name: "System Offline" }]
    },
    {
      id: "demo2",
      name: "Night Vibes",
      preview_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      album: { images: [{ url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop" }] },
      artists: [{ name: "Backup Mode" }]
    }
  ], []);

  // --- API HANDLERS - Stable Identities ---
  const fetchTracks = useCallback(async (query) => {
    if (!query) return [];
    if (query === 'lofi' && tracks.length > 0) return tracks; 
    if (isFetchingRef.current) return tracks;
    
    isFetchingRef.current = true;
    try {
      const res = await api.get(`/Music/search?q=${query}`);
      const songData = res.data.tracks?.items || [];
      const filtered = songData.filter((track) => track.preview_url);
      
      const finalResult = filtered.length > 0 ? filtered : FALLBACK_TRACKS;
      
      setTracks(finalResult);
      return finalResult;

    } catch (err) {
      console.error("Fetch Error:", err);
      setTracks(FALLBACK_TRACKS);
      return FALLBACK_TRACKS;
    } finally {
      isFetchingRef.current = false;
    }
  }, [tracks, FALLBACK_TRACKS]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(e => console.error(e));
      setIsPlaying(true);
    }
  }, []);

  const playTrack = useCallback((track) => {
    const audio = audioRef.current;
    if (!track || !audio) return;

    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      audio.src = track.preview_url;
      audio.volume = volume;
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
          playPromise.catch((e) => console.error("Playback error:", e));
      }
    }
  }, [currentTrack, volume, togglePlay]);

  const nextTrack = useCallback(() => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    playTrack(tracks[nextIndex]);
  }, [currentTrack, tracks, playTrack]);

  const prevTrack = useCallback(() => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    playTrack(tracks[prevIndex]);
  }, [currentTrack, tracks, playTrack]);

  const adjustVolume = useCallback((direction) => {
    const audio = audioRef.current;
    let newVol = direction === "up" ? volume + 0.2 : volume - 0.2;
    newVol = Math.round(newVol * 10) / 10;
    newVol = Math.max(0, Math.min(1, newVol));
    
    setVolume(newVol);
    if (audio) audio.volume = newVol;
  }, [volume]);

  // -- NEW: CONTROL HANDLERS --
  const seekTo = useCallback((time) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const searchAndPlay = useCallback(async (query) => {
    const results = await fetchTracks(query);
    if (results && results.length > 0) {
        playTrack(results[0]);
    }
  }, [fetchTracks, playTrack]);

  // -- UPDATED: Effect for Audio Listeners --
  useEffect(() => {
    if (tracks.length === 0) fetchTracks("lofi"); 
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => nextTrack(); 
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [fetchTracks, nextTrack, tracks.length]); 

  const value = useMemo(() => ({
    tracks, setTracks, currentTrack, isPlaying, volume,
    currentTime, duration, formatTime, seekTo, // Expose new state/funcs
    playTrack, togglePlay, nextTrack, prevTrack, adjustVolume,
    fetchTracks, searchAndPlay, audioRef
  }), [
    tracks, currentTrack, isPlaying, volume, currentTime, duration, seekTo, 
    playTrack, togglePlay, nextTrack, prevTrack, adjustVolume, fetchTracks, searchAndPlay
  ]);

  return (
    <MusicContext.Provider value={value}>
      {children}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </MusicContext.Provider>
  );
};