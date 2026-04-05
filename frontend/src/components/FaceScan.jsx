import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import api from "../api/api";
import { useAuth } from "../context/AuthProvider";
import { FaMicrochip, FaPause, FaPlay, FaWaveSquare, FaCamera } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import SuggestedMusic1 from "./SuggestedMusic1";

// --- Premium Black Styles ---
const DETECTION_OPTIONS = new faceapi.TinyFaceDetectorOptions();

const FaceScan = () => {
  const videoRef = useRef(null);
  const intervalRef = useRef(null);
  
  // State for Mood Data
  const [moodData, setMoodData] = useState({ mood: null, intensity: 0, label: "Scanning..." });
  const [dominantHistory, setDominantHistory] = useState(null);
  
  // State for Scanner Control
  const [isPaused, setIsPaused] = useState(false); 
  const [loadingModels, setLoadingModels] = useState(true);
  const [cameraError, setCameraError] = useState(false);
  
  // Rate Limiting Refs
  const lastUpdateRef = useRef(0);
  const moodDataRef = useRef({ mood: null, label: "Scanning..." });
  
  const { user } = useAuth();

  // --- 1. Load History on Mount ---
  useEffect(() => {
    if(user?.email) {
        api.get(`/mood/stats/${user.email}`)
             .then(res => setDominantHistory(res.data.dominant))
             .catch(err => console.log("History fetch error", err));
    }
  }, [user]);

  // --- 2. Initialize Models ---
  useEffect(() => {
    const initSystem = async () => {
      const MODEL_URL = "/models";
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(`${MODEL_URL}/tiny_face_detector`),
          faceapi.nets.faceLandmark68Net.loadFromUri(`${MODEL_URL}/face_landmark_68`),
          faceapi.nets.faceExpressionNet.loadFromUri(`${MODEL_URL}/face_expression`),
        ]);
        setLoadingModels(false);
        startVideo();
      } catch (err) {
        console.error("Model Load Failed", err);
      }
    };
    initSystem();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
      clearInterval(intervalRef.current);
    };
  }, []);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraError(false);
        }
      })
      .catch((err) => {
        setCameraError(true);
      });
  };

  // --- 3. Real-Time Detection Logic ---
  useEffect(() => {
    if (loadingModels || cameraError || isPaused) {
       if (intervalRef.current) clearInterval(intervalRef.current);
       return;
    }

    const runDetection = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(async () => {
        if (!videoRef.current) return;
        if (isPaused) return;

        const result = await faceapi
          .detectSingleFace(videoRef.current, DETECTION_OPTIONS)
          .withFaceExpressions();

        if (result?.expressions) {
          const sorted = result.expressions.asSortedArray();
          const topResult = sorted[0]; 

          const currentMood = topResult.expression;
          const confidence = topResult.probability;

          let intensityLabel = "Moderate";
          if (confidence > 0.85) intensityLabel = "High";
          if (confidence < 0.50) intensityLabel = "Low";

          const now = Date.now();
          const timeElapsed = now - lastUpdateRef.current;
          const isDifferentMood = moodDataRef.current.mood !== currentMood;
          const isDifferentIntensity = moodDataRef.current.label !== intensityLabel;

          if (timeElapsed > 5000 && (isDifferentMood || isDifferentIntensity)) {
              lastUpdateRef.current = now;
              const nextState = { mood: currentMood, intensity: confidence, label: intensityLabel };
              moodDataRef.current = nextState;
              setMoodData(nextState);
              saveExpressionToDB(currentMood);
              if (isDifferentMood && currentMood) {
                 speakMood(currentMood);
              }
          }
        }
      }, 1000);
    };

    const video = videoRef.current;
    if (video && video.readyState >= 4) {
      runDetection();
    } else if (video) {
      video.addEventListener("playing", runDetection);
    }

    return () => {
      if (video) video.removeEventListener("playing", runDetection);
      clearInterval(intervalRef.current);
    };
  }, [loadingModels, cameraError, isPaused]);

  const saveExpressionToDB = async (mood) => {
    if (!user?.email) return;
    try {
      await api.post("/mood/save", { userId: user.email, mood });
    } catch (err) { console.error("DB Save Failed", err); }
  };

  const speakMood = (mood) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    const messages = {
      happy: "You look vibrant and happy! Let's keep that energy flowing.",
      sad: "I sense you're feeling a bit down. Let's find some warm, comforting tracks.",
      angry: "You seem frustrated. Let's channel that into some powerful music.",
      neutral: "You're feeling focused and balanced. Let's find a steady rhythm to match.",
      surprised: "Catching you off guard! Let's match that spark.",
      fearful: "Take a deep breath. Here are some calm frequencies to ease your mind.",
      disgusted: "Let's refresh the atmosphere and clear your mind."
    };

    const msg = new SpeechSynthesisUtterance(messages[mood] || "Scanning complete. Let's play some music.");
    msg.volume = 0.8;
    msg.rate = 0.95;
    msg.pitch = 1.05;
    window.speechSynthesis.speak(msg);
  };

  const togglePause = () => { setIsPaused(!isPaused); };

  return (
    <div className="min-h-screen bg-black text-white font-body pt-24 pb-20 px-4 md:px-6">
      <div className="fixed inset-0 z-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-[#0A0A0A] text-xs font-mono text-purple-400 mb-4 tracking-widest uppercase">
             <div className={`w-2 h-2 rounded-full ${!isPaused ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
             {isPaused ? "Engine Paused" : "Real-Time Emotion Engine"}
          </div>
          <h1 className="text-3xl md:text-6xl font-heading font-bold mb-2">Live <span className="premium-text-gradient">Sentiment</span> Analysis</h1>
        </motion.div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          <div className="w-full lg:col-span-7 relative">
            <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-[#050505] shadow-2xl aspect-[4/3] group">
              <div className="absolute top-4 right-4 z-40">
                 <button onClick={togglePause} className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-full hover:bg-white/10 transition-colors text-white">
                    {isPaused ? <FaPlay size={14} /> : <FaPause size={14} />}
                 </button>
              </div>
              {loadingModels && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black text-purple-400">
                   <FaMicrochip className="text-4xl mb-4 animate-pulse" />
                   <p className="font-mono text-sm">INITIALIZING AI...</p>
                </div>
              )}
              <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-500 ${isPaused ? 'opacity-40 grayscale' : 'opacity-80'}`} />
              {isPaused && !loadingModels && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                     <div className="bg-black/60 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full flex items-center gap-3">
                        <FaCamera className="text-gray-400" />
                        <span className="font-mono text-sm tracking-widest">SCANNING PAUSED</span>
                     </div>
                  </div>
              )}
              {!loadingModels && !isPaused && (
                <div className="absolute inset-0 pointer-events-none">
                   <div className="scan-line" />
                   <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded border border-white/10">
                      <p className="text-[10px] font-mono text-gray-400">CONFIDENCE: {(moodData.intensity * 100).toFixed(0)}%</p>
                   </div>
                   <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur px-3 py-1 rounded border border-white/10">
                      <p className="text-[10px] font-mono text-gray-400">INTENSITY: {moodData.label.toUpperCase()}</p>
                   </div>
                </div>
              )}
            </div>
            <p className="text-center text-xs text-gray-500 mt-4 font-mono">{isPaused ? "Tap play button to resume scanning" : "Keep your face in frame for real-time updates"}</p>
          </div>

          <div className="w-full lg:col-span-5 flex flex-col gap-6">
             <motion.div className="glass-black p-6 md:p-8 rounded-[2rem] border-l-4 border-l-purple-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-900/20 blur-[50px] rounded-full" />
                <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">Live Detection</h3>
                <div className="flex items-center justify-between">
                   <div>
                      <AnimatePresence mode="wait">
                        <motion.div key={moodData.mood || "wait"} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-4xl md:text-5xl font-heading font-bold text-white capitalize">{moodData.mood || "Ready..."}</motion.div>
                      </AnimatePresence>
                      <p className="text-sm text-purple-400 mt-1 flex items-center gap-2"><FaWaveSquare /> {moodData.label} Intensity</p>
                   </div>
                   <div className="text-5xl md:text-6xl animate-bounce">
                      {moodData.mood === 'happy' && '😁'}
                      {moodData.mood === 'sad' && '😟'}
                      {moodData.mood === 'angry' && '😠'}
                      {moodData.mood === 'neutral' && '😐'}
                      {moodData.mood === 'surprised' && '😲'}
                      {moodData.mood === 'fearful' && '😨'}
                      {moodData.mood === 'disgusted' && '🤢'}
                      {!moodData.mood && '⌛'}
                   </div>
                </div>
             </motion.div>
             <div className="glass-black rounded-[2rem] p-6 border border-white/10 min-h-[300px]">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                   <h3 className="text-lg font-bold text-white">Live Mix</h3>
                   {dominantHistory && (<span className="text-[10px] border border-white/10 px-2 py-1 rounded-full text-gray-400 hidden sm:inline-block">History Bias: {dominantHistory}</span>)}
                </div>
                {moodData.mood && (<SuggestedMusic1 mood={moodData.mood} intensityLabel={moodData.label} historyBias={dominantHistory} />)}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceScan;