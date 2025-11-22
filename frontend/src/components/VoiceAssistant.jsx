import React, { useEffect, useState, useRef } from "react";
import { Mic, MicOff, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const VoiceAssistant = ({ 
  onNext, 
  onPrev, 
  onPlay, 
  onPause, 
  onVolumeUp, 
  onVolumeDown,
  onSkip 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // True when "Hey Emotify" is detected
  const [feedback, setFeedback] = useState(""); // Text feedback to show user
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    // Check browser compatibility
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Keep listening
      recognition.interimResults = false; // Only final results
      recognition.lang = "en-US";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
        // Auto-restart if it stops (unless manually stopped)
        if (isListening) recognition.start();
      };

      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        console.log("Heard:", transcript);

        // 1. Check for Wake Word
        if (transcript.includes("hey emotify") || transcript.includes("emotify")) {
          handleCommand(transcript);
        }
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Speech Recognition not supported in this browser.");
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [isListening]);

  // Command Processor
  const handleCommand = (text) => {
    setIsProcessing(true);
    
    // Simple text-to-speech feedback
    const speak = (msg) => {
      const utterance = new SpeechSynthesisUtterance(msg);
      window.speechSynthesis.speak(utterance);
      setFeedback(msg);
      setTimeout(() => {
        setFeedback("");
        setIsProcessing(false);
      }, 3000);
    };

    if (text.includes("next") || text.includes("skip")) {
      speak("Playing next song");
      if (onNext) onNext();
    } else if (text.includes("previous") || text.includes("back")) {
      speak("Going back");
      if (onPrev) onPrev();
    } else if (text.includes("play") || text.includes("resume")) {
      speak("Resuming music");
      if (onPlay) onPlay();
    } else if (text.includes("pause") || text.includes("stop")) {
      speak("Pausing music");
      if (onPause) onPause();
    } else if (text.includes("volume up") || text.includes("louder") || text.includes("increase")) {
      speak("Volume up");
      if (onVolumeUp) onVolumeUp();
    } else if (text.includes("volume down") || text.includes("quieter") || text.includes("decrease")) {
      speak("Volume down");
      if (onVolumeDown) onVolumeDown();
    } else {
      speak("I'm listening, but didn't catch that command.");
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-2">
      {/* Feedback Bubble */}
      <AnimatePresence>
        {(feedback || isProcessing) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="bg-black/80 backdrop-blur-md border border-purple-500/30 text-white px-4 py-2 rounded-xl mb-2 text-sm font-medium shadow-lg"
          >
            {feedback || "Listening..."}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic Button / Orb */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleListening}
        className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500
          ${isListening 
            ? "bg-gradient-to-br from-purple-600 to-fuchsia-600 shadow-purple-500/40" 
            : "bg-gray-800 border border-gray-700 shadow-black/50"
          }`}
      >
        {/* Pulsing Rings when Active */}
        {isListening && (
          <>
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 bg-purple-500 rounded-full z-0"
            />
            <motion.div
              animate={{ scale: [1, 2], opacity: [0.3, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
              className="absolute inset-0 bg-fuchsia-500 rounded-full z-0"
            />
          </>
        )}

        {/* Icon */}
        <div className="relative z-10">
           {isListening ? (
             isProcessing ? <Activity className="text-white animate-pulse" /> : <Mic className="text-white" />
           ) : (
             <MicOff className="text-gray-400" />
           )}
        </div>
      </motion.button>
    </div>
  );
};

export default VoiceAssistant;