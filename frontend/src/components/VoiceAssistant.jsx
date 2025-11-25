import React, { useEffect, useState, useRef } from "react";
import { Mic, MicOff, Activity, Power, WifiOff, Move } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMusic } from "../context/MusicContext";

const VoiceAssistant = () => {
  const music = useMusic(); 
  
  // 1. BRIDGE: Always keep a reference to the latest music state
  const controlsRef = useRef(music);
  useEffect(() => {
    controlsRef.current = music;
  }, [music]);

  // --- AUTO PLAY NEXT TRACK ---
  // Listens for the audio 'ended' event to trigger the next song automatically
  useEffect(() => {
    const audio = music.audioRef?.current;
    if (!audio) return;

    const handleEnded = () => {
      // Use controlsRef to access the latest nextTrack function
      controlsRef.current.nextTrack();
    };

    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [music.audioRef]);

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
  const lastErrorRef = useRef(null);
  
  // Ref for drag boundaries
  const constraintsRef = useRef(null);

  // --- RECOGNITION SETUP ---
  useEffect(() => {
    // Brave supports webkitSpeechRecognition but often blocks the connection to Google
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        console.error("Browser does not support Speech API");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; 
    recognition.interimResults = false;
    recognition.lang = "en-US";

    // --- Connectivity Listeners ---
    const handleOnline = () => setErrorState(null);
    const handleOffline = () => setErrorState("network");
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    recognition.onstart = () => {
        setIsMicrophoneOn(true);
        setErrorState(null);
        lastErrorRef.current = null;
    };

    recognition.onerror = (event) => {
        // Ignore "no-speech" as it's normal behavior
        if (event.error === 'no-speech') {
            lastErrorRef.current = 'no-speech';
            return; 
        }

        console.log("Voice Error:", event.error);
        lastErrorRef.current = event.error;

        // FIXED for Brave Browser:
        if (event.error === 'network') {
            if (!navigator.onLine) {
                setErrorState("network");
            } else {
                console.warn("Speech API blocked or failed (Brave Shield likely active).");
            }
        } else if (event.error === 'not-allowed') {
            setErrorState("permission");
            shouldBeOnRef.current = false;
            setIsMicrophoneOn(false);
        }
    };

    recognition.onend = () => {
        setIsMicrophoneOn(false);
        
        // Smart Restart Logic
        if (shouldBeOnRef.current) {
            const isNetworkError = lastErrorRef.current === 'network';
            const delay = isNetworkError ? 2000 : 200; 
            
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
      
      // Clear errors on success
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
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []); 

  // --- VOLUME DUCKING ---
  useEffect(() => {
    const audio = music.audioRef.current;
    if (!audio) return;

    if (visualActive) {
      audio.volume = 0.2; // Lower volume when listening
    } else {
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

    const controls = controlsRef.current; 
    let commandFound = true;

    if (text.startsWith("play ")) {
        let query = text.replace("play", "").replace("songs", "").replace("song", "").trim();
        if (!query) query = "lofi";
        speak(`Playing ${query}`);
        controls.searchAndPlay(query);
        resetToStandby(); 
    
    } else if (text.includes("next") || text.includes("skip")) {
        speak("Next");
        controls.nextTrack();
    } else if (text.includes("previous") || text.includes("back")) {
        speak("Previous");
        controls.prevTrack();
    
    } else if (text.includes("stop") || text.includes("pause")) {
        speak("Paused");
        controls.togglePlay();
        resetToStandby();
    } else if (text.includes("resume") || text.includes("start")) {
        speak("Resuming");
        controls.togglePlay();
        resetToStandby();

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
        setErrorState(null);
    } else {
        shouldBeOnRef.current = true;
        try { recognitionRef.current.start(); } catch(e) {}
    }
  };

  return (
    <>
      {/* Invisible Constraints Container */}
      <div ref={constraintsRef} className="fixed inset-4 pointer-events-none z-[9990]" />

      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragMomentum={false}
        whileDrag={{ scale: 1.1, cursor: "grabbing" }}
        className="fixed bottom-24 right-6 z-[9999] flex flex-col items-end gap-2 cursor-grab touch-none"
        style={{ touchAction: "none" }} // Prevents browser scrolling while dragging on mobile
      >
        <AnimatePresence>
          {(feedback || visualActive || errorState === 'network') && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className={`backdrop-blur-md border px-4 py-2 rounded-xl mb-2 text-sm font-medium shadow-2xl pointer-events-none whitespace-nowrap
                ${errorState === 'network' ? "bg-red-900/90 border-red-400 text-white" :
                 visualActive ? "bg-purple-900/90 border-purple-400 text-white" : "bg-black/80 border-gray-600 text-gray-300"}`}
            >
              {errorState === 'network' ? "Reconnecting..." : feedback || "Listening..."}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={handleToggle}
          whileTap={{ scale: 0.9 }}
          animate={{ 
            scale: visualActive ? 1.2 : 1,
            boxShadow: visualActive ? "0 0 30px #a855f7" : "0 0 10px rgba(0,0,0,0.5)"
          }}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 group
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
          
          {/* Drag Handle Indicator (Visible on Hover) */}
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Move size={12} className="text-white" />
          </div>

          <div className="relative z-10">
             {errorState === 'network' ? <WifiOff className="text-white animate-pulse" /> : 
              !isMicrophoneOn ? <Power className="text-red-200" /> : 
              visualActive ? <Activity className="text-white animate-bounce" /> : <Mic className="text-purple-200" />}
          </div>
        </motion.button>
      </motion.div>
    </>
  );
};

export default VoiceAssistant;