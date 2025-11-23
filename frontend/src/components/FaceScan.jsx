import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import { FaMicrochip, FaPause, FaPlay, FaWaveSquare, FaCamera } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import SuggestedMusic1 from "./SuggestedMusic1";

// --- Premium Black Styles ---
const PremiumStyles = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&family=Space+Grotesk:wght@300;500;700&display=swap');
      
      .font-heading { font-family: 'Space Grotesk', sans-serif; }
      .font-body { font-family: 'Outfit', sans-serif; }
      
      .glass-black {
        background: rgba(5, 5, 5, 0.9);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      }

      @keyframes scan-vertical {
        0% { top: 0%; opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { top: 100%; opacity: 0; }
      }

      .scan-line {
        position: absolute;
        left: 0;
        width: 100%;
        height: 3px;
        background: #a855f7;
        box-shadow: 0 0 10px #a855f7, 0 0 20px #a855f7;
        animation: scan-vertical 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      }

      .premium-text-gradient {
        background: linear-gradient(to right, #ffffff, #c084fc);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    `}
  </style>
);

const FaceScan = () => {
  const videoRef = useRef(null);
  const intervalRef = useRef(null);
  
  // State for Mood Data
  const [moodData, setMoodData] = useState({ mood: null, intensity: 0, label: "Scanning..." });
  const [dominantHistory, setDominantHistory] = useState(null);
  
  // State for Scanner Control
  const [isPaused, setIsPaused] = useState(false); // New Pause State
  const [loadingModels, setLoadingModels] = useState(true);
  const [cameraError, setCameraError] = useState(false);
  
  // Rate Limiting Refs
  const lastUpdateRef = useRef(0);
  
  const { user } = useAuth();

  // --- 1. Load History on Mount ---
  useEffect(() => {
    if(user?.email) {
        axios.get(`http://localhost:4000/mood/stats/${user.email}`)
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
    // Stop detection loop if models loading, camera error, OR PAUSED
    if (loadingModels || cameraError || isPaused) {
       if (intervalRef.current) clearInterval(intervalRef.current);
       return;
    }

    const runDetection = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(async () => {
        if (!videoRef.current) return;

        // SKIP processing if paused (double check)
        if (isPaused) return;

        const result = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        if (result?.expressions) {
          const sorted = result.expressions.asSortedArray();
          const topResult = sorted[0]; 

          const currentMood = topResult.expression;
          const confidence = topResult.probability;

          // Determine Intensity Label
          let intensityLabel = "Moderate";
          if (confidence > 0.85) intensityLabel = "High";
          if (confidence < 0.50) intensityLabel = "Low";

          const now = Date.now();
          
          // --- STRICT THROTTLING ---
          // 1. Must be at least 5 seconds since last update
          // 2. AND (Mood must change OR Intensity Category must change)
          // This prevents API calls just because confidence went from 0.91 to 0.92
          const timeElapsed = now - lastUpdateRef.current;
          const isDifferentMood = moodData.mood !== currentMood;
          const isDifferentIntensity = moodData.label !== intensityLabel;

          if (timeElapsed > 5000 && (isDifferentMood || isDifferentIntensity)) {
             
             lastUpdateRef.current = now;
             
             setMoodData({
                mood: currentMood,
                intensity: confidence,
                label: intensityLabel
             });

             // Background Save
             saveExpressionToDB(currentMood);
          }
        }
      }, 500); // Check every 500ms
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
  }, [loadingModels, cameraError, isPaused, moodData.mood, moodData.label]); // Add isPaused and label to deps

  const saveExpressionToDB = async (mood) => {
    if (!user?.email) return;
    try {
      await axios.post("http://localhost:4000/mood/save", { userId: user.email, mood });
    } catch (err) { console.error("DB Save Failed", err); }
  };

  const togglePause = () => {
     setIsPaused(!isPaused);
  };

  return (
    <div className="min-h-screen bg-black text-white font-body pt-24 pb-20 px-4 md:px-6">
      <PremiumStyles />
      
      <div className="fixed inset-0 z-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header - Responsive Text */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-[#0A0A0A] text-xs font-mono text-purple-400 mb-4 tracking-widest uppercase">
             <div className={`w-2 h-2 rounded-full ${!isPaused ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
             {isPaused ? "Engine Paused" : "Real-Time Emotion Engine"}
          </div>
          <h1 className="text-3xl md:text-6xl font-heading font-bold mb-2">
            Live <span className="premium-text-gradient">Sentiment</span> Analysis
          </h1>
        </motion.div>

        {/* Responsive Layout: Flex Col on Mobile, Grid on Desktop */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          {/* --- Scanner Area (Top on Mobile) --- */}
          <div className="w-full lg:col-span-7 relative">
            <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-[#050505] shadow-2xl aspect-[4/3] group">
              
              {/* Controls Overlay */}
              <div className="absolute top-4 right-4 z-40">
                 <button 
                    onClick={togglePause}
                    className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-full hover:bg-white/10 transition-colors text-white"
                 >
                    {isPaused ? <FaPlay size={14} /> : <FaPause size={14} />}
                 </button>
              </div>

              {loadingModels && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black text-purple-400">
                   <FaMicrochip className="text-4xl mb-4 animate-pulse" />
                   <p className="font-mono text-sm">INITIALIZING AI...</p>
                </div>
              )}
              
              {/* Camera Feed */}
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-500 ${isPaused ? 'opacity-40 grayscale' : 'opacity-80'}`}
              />

              {/* Paused State Overlay */}
              {isPaused && !loadingModels && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                     <div className="bg-black/60 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full flex items-center gap-3">
                        <FaCamera className="text-gray-400" />
                        <span className="font-mono text-sm tracking-widest">SCANNING PAUSED</span>
                     </div>
                  </div>
              )}

              {/* Active Scanning Overlay */}
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
            
            <p className="text-center text-xs text-gray-500 mt-4 font-mono">
               {isPaused ? "Tap play button to resume scanning" : "Keep your face in frame for real-time updates"}
            </p>
          </div>

          {/* --- Results & Music Area (Bottom on Mobile) --- */}
          <div className="w-full lg:col-span-5 flex flex-col gap-6">
              
             {/* Mood Card */}
             <motion.div className="glass-black p-6 md:p-8 rounded-[2rem] border-l-4 border-l-purple-500 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-900/20 blur-[50px] rounded-full" />
                
                <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">Live Detection</h3>
                
                <div className="flex items-center justify-between">
                   <div>
                      <AnimatePresence mode="wait">
                        <motion.div 
                           key={moodData.mood || "wait"}
                           initial={{ y: 20, opacity: 0 }}
                           animate={{ y: 0, opacity: 1 }}
                           className="text-4xl md:text-5xl font-heading font-bold text-white capitalize"
                        >
                           {moodData.mood || "Ready..."}
                        </motion.div>
                      </AnimatePresence>
                      <p className="text-sm text-purple-400 mt-1 flex items-center gap-2">
                         <FaWaveSquare /> {moodData.label} Intensity
                      </p>
                   </div>
                   
                   <div className="text-5xl md:text-6xl animate-bounce">
                      {moodData.mood === 'happy' && '⚡'}
                      {moodData.mood === 'sad' && '🌧️'}
                      {moodData.mood === 'angry' && '🔥'}
                      {moodData.mood === 'neutral' && '🌊'}
                      {moodData.mood === 'surprised' && '✨'}
                   </div>
                </div>
             </motion.div>

             {/* Dynamic Playlist Component */}
             <div className="glass-black rounded-[2rem] p-6 border border-white/10 min-h-[300px]">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                   <h3 className="text-lg font-bold text-white">Live Mix</h3>
                   {dominantHistory && (
                      <span className="text-[10px] border border-white/10 px-2 py-1 rounded-full text-gray-400 hidden sm:inline-block">
                        History Bias: {dominantHistory}
                      </span>
                   )}
                </div>
                
                {/* PASSING DATA TO MUSIC COMPONENT */}
                {moodData.mood && (
                   <SuggestedMusic1 
                      mood={moodData.mood} 
                      intensity={moodData.intensity} 
                      historyBias={dominantHistory} 
                   />
                )}
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceScan;