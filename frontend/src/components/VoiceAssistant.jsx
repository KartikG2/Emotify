import React, { useEffect, useState, useRef } from "react";
import { Mic, MicOff, Activity, Power, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMusic } from "../context/MusicContext";

const VoiceAssistant = () => {
  const music = useMusic(); 
  
  // 1. BRIDGE: Always keep a reference to the latest music state
  const controlsRef = useRef(music);
  useEffect(() => {
    controlsRef.current = music;
  }, [music]);

  // --- UI State ---
  const [isMicrophoneOn, setIsMicrophoneOn] = useState(false); 
  const [visualActive, setVisualActive] = useState(false); 
  const [feedback, setFeedback] = useState(""); 
  const [errorState, setErrorState] = useState(null);
  
  // --- Logic Refs ---
  const recognitionRef = useRef(null);
  const silenceTimer = useRef(null);
  const isActiveRef = useRef(false); 
  const isProcessingRef = useRef(false); 
  const shouldBeOnRef = useRef(false);
  const lastErrorRef = useRef(null); // <--- NEW: Tracks error for restart logic

  // --- RECOGNITION SETUP ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.error("Browser does not support Speech API");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; 
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
        setIsMicrophoneOn(true);
        setErrorState(null);
        lastErrorRef.current = null; // Reset error ref on successful start
    };

    recognition.onerror = (event) => {
        // Ignore "no-speech" as it's normal behavior for always-on listening
        if (event.error === 'no-speech') {
            lastErrorRef.current = 'no-speech';
            return; 
        }

        console.log("Voice Error:", event.error);
        lastErrorRef.current = event.error; // Save error to ref

        if (event.error === 'network') setErrorState("network");
        if (event.error === 'not-allowed') {
            setErrorState("permission");
            shouldBeOnRef.current = false;
            setIsMicrophoneOn(false);
        }
    };

    recognition.onend = () => {
        setIsMicrophoneOn(false);
        
        // Smart Restart Logic
        if (shouldBeOnRef.current) {
            // Check the REF, not the state (State is stale inside useEffect)
            const isNetworkError = lastErrorRef.current === 'network';
            
            // Wait 2s for network errors, 1s for normal restarts (prevents rapid looping)
            const delay = isNetworkError ? 2000 : 1000; 
            
            setTimeout(() => {
                if (shouldBeOnRef.current) {
                    try { 
                        recognition.start(); 
                    } catch (e) {
                        console.warn("Restart failed, retrying...");
                    }
                }
            }, delay);
        }
    };

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      console.log("🎤 Heard:", transcript);
      setErrorState(null);
      lastErrorRef.current = null;

      if (!isActiveRef.current) {
        const wakeWords = ["hey emotify", "emotify", "hey spotify", "modify", "notify", "play music"];
        if (wakeWords.some(word => transcript.includes(word))) {
            activateAssistant();
        }
      } else {
        processCommand(transcript);
      }
    };

    recognitionRef.current = recognition;
    
    // Cleanup
    return () => {
        shouldBeOnRef.current = false;
        recognition.abort();
    };
  }, []); 

  // --- VOLUME DUCKING ---
  useEffect(() => {
    const audio = music.audioRef.current;
    if (!audio) return;

    if (visualActive) {
      audio.volume = 0.2; // Lower volume when listening
    } else {
      // Restore volume safely
      const safeVolume = (Number.isFinite(music.volume) && music.volume >= 0 && music.volume <= 1) ? music.volume : 1.0;
      audio.volume = safeVolume; 
    }
  }, [visualActive, music.volume]);

  // --- HELPERS ---
  const speak = (msg) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(msg);
    window.speechSynthesis.speak(utterance);
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 4000);
  };

  const activateAssistant = () => {
    isActiveRef.current = true;
    setVisualActive(true);
    speak("I'm listening");
    resetSilenceTimer();
  };

  // --- COMMAND PROCESSOR ---
  const processCommand = (text) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    const controls = controlsRef.current; // Access latest controls
    let commandFound = true;

    // 1. PLAY / SEARCH LOGIC (Improved)
    if (text.startsWith("play ")) {
        let query = text.replace("play", "").replace("songs", "").replace("song", "").trim();
        if (!query) query = "lofi";
        speak(`Playing ${query}`);
        controls.searchAndPlay(query);
        resetToStandby(); 
    
    // 2. NAVIGATION
    } else if (text.includes("next") || text.includes("skip")) {
        speak("Next");
        controls.nextTrack();
    } else if (text.includes("previous") || text.includes("back")) {
        speak("Previous");
        controls.prevTrack();
    
    // 3. PLAYBACK STATE
    } else if (text.includes("stop") || text.includes("pause")) {
        speak("Paused");
        controls.togglePlay();
        resetToStandby();
    } else if (text.includes("resume") || text.includes("start")) {
        speak("Resuming");
        controls.togglePlay();
        resetToStandby();

    // 4. VOLUME
    } else if (text.includes("volume up") || text.includes("increase") || text.includes("louder")) {
        controls.adjustVolume("up");
        resetToStandby(); 
    } else if (text.includes("volume down") || text.includes("decrease") || text.includes("quieter")) {
        controls.adjustVolume("down");
        resetToStandby(); 
    } else {
        commandFound = false;
    }

    if (commandFound && isActiveRef.current) resetSilenceTimer();
    
    setTimeout(() => { isProcessingRef.current = false; }, 1000);
  };

  const resetSilenceTimer = () => {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    silenceTimer.current = setTimeout(() => {
      resetToStandby();
    }, 10000); 
  };

  const resetToStandby = () => {
    isActiveRef.current = false;
    setVisualActive(false); 
    setFeedback("");
  };

  const handleToggle = () => {
    if (!recognitionRef.current) return;
    if (shouldBeOnRef.current) {
        shouldBeOnRef.current = false;
        recognitionRef.current.abort();
        setIsMicrophoneOn(false);
        resetToStandby();
        setErrorState(null); // Clear errors on manual stop
    } else {
        shouldBeOnRef.current = true;
        try { recognitionRef.current.start(); } catch(e) {}
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end gap-2">
      <AnimatePresence>
        {(feedback || visualActive || errorState === 'network') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`backdrop-blur-md border px-4 py-2 rounded-xl mb-2 text-sm font-medium shadow-2xl 
              ${errorState === 'network' ? "bg-red-900/90 border-red-400 text-white" :
               visualActive ? "bg-purple-900/90 border-purple-400 text-white" : "bg-black/80 border-gray-600 text-gray-300"}`}
          >
            {errorState === 'network' ? "Reconnecting..." : feedback || "Listening..."}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ 
          scale: visualActive ? 1.2 : 1,
          boxShadow: visualActive ? "0 0 30px #a855f7" : "0 0 10px rgba(0,0,0,0.5)"
        }}
        className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500
          ${isMicrophoneOn
            ? visualActive 
                ? "bg-gradient-to-br from-purple-600 to-pink-600 border-2 border-white/20" 
                : "bg-gray-800 border-2 border-purple-500/50"
            : "bg-red-900/80 border-2 border-red-500/50"
          }`}
      >
        {visualActive && (
           <span className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></span>
        )}
        <div className="relative z-10">
           {errorState === 'network' ? <WifiOff className="text-white animate-pulse" /> : 
            !isMicrophoneOn ? <Power className="text-red-200" /> : 
            visualActive ? <Activity className="text-white animate-bounce" /> : <Mic className="text-purple-200" />}
        </div>
      </motion.button>
    </div>
  );
};

export default VoiceAssistant;