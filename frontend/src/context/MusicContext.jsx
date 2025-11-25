import React, { createContext, useContext, useState, useRef, useEffect } from "react";

const MusicContext = createContext();

export const useMusic = () => useContext(MusicContext);

export const MusicProvider = ({ children }) => {
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Initialize volume at 1.0 (100%)
  const [volume, setVolume] = useState(1.0); 
  
  const audioRef = useRef(null);
  const isFetchingRef = useRef(false);

  // --- FALLBACK DATA ---
  const FALLBACK_TRACKS = [
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
  ];

  // --- API HANDLER ---
  const fetchTracks = async (query) => {
    // 1. INPUT CHECK
    if (!query) return [];

    // 2. CACHE CHECK (Return data, don't just return undefined)
    if (query === 'lofi' && tracks.length > 0) {
        return tracks; 
    }

    // 3. LOCK CHECK (Return current tracks if busy)
    if (isFetchingRef.current) {
        return tracks;
    }
    
    isFetchingRef.current = true;
    try {
      const res = await fetch(
        `https://v1.nocodeapi.com/kartikg1/spotify/QuJcgYtQlsFOiwcQ/search?q=${query}&type=track`
      );

      // 4. API LIMIT CHECK
      if (res.status === 429) {
         setTracks(FALLBACK_TRACKS);
         return FALLBACK_TRACKS; // <--- VITAL RETURN
      }

      const data = await res.json();
      const songData = data.tracks?.items || [];
      const filtered = songData.filter((track) => track.preview_url);
      
      const finalResult = filtered.length > 0 ? filtered : FALLBACK_TRACKS;
      
      setTracks(finalResult);
      return finalResult; // <--- VITAL RETURN (This was missing)

    } catch (err) {
      console.error("Fetch Error:", err);
      setTracks(FALLBACK_TRACKS);
      return FALLBACK_TRACKS; // <--- VITAL RETURN
    } finally {
      isFetchingRef.current = false;
    }
  };

  const searchAndPlay = async (query) => {
    // Now results will actually contain the array
    const results = await fetchTracks(query);
    
    if (results && results.length > 0) {
        console.log(`Auto-playing first result: ${results[0].name}`);
        playTrack(results[0]);
    } else {
        console.warn("No playable results found.");
    }
  };

  // --- AUDIO CONTROLS ---
  const playTrack = (track) => {
    const audio = audioRef.current;
    if (!track || !audio) return;

    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      audio.src = track.preview_url;
      audio.volume = volume;
      
      // Promise handling to prevent "Play request interrupted" errors
      const playPromise = audio.play();
      if (playPromise !== undefined) {
          playPromise.catch((e) => console.error("Playback error:", e));
      }
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(e => console.error(e));
      setIsPlaying(true);
    }
  };

  const nextTrack = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    playTrack(tracks[nextIndex]);
  };

  const prevTrack = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    playTrack(tracks[prevIndex]);
  };

  // --- VOLUME FIX ---
  const adjustVolume = (direction) => {
    const audio = audioRef.current;
    let newVol = direction === "up" ? volume + 0.2 : volume - 0.2;
    newVol = Math.round(newVol * 10) / 10;
    newVol = Math.max(0, Math.min(1, newVol));
    
    console.log(`Volume changing: ${volume} -> ${newVol}`);
    setVolume(newVol);
    if (audio) audio.volume = newVol;
  };

  useEffect(() => {
    if (tracks.length === 0) fetchTracks("lofi"); 
    const audio = audioRef.current;
    const handleEnded = () => nextTrack(); 
    if(audio) {
        audio.addEventListener('ended', handleEnded);
        return () => audio.removeEventListener('ended', handleEnded);
    }
  }, []); 

  const value = {
    tracks, setTracks, currentTrack, isPlaying, volume,
    playTrack, togglePlay, nextTrack, prevTrack, adjustVolume,
    fetchTracks, searchAndPlay, audioRef
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </MusicContext.Provider>
  );
};