import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import { FaRedo, FaSmile, FaMicrochip, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
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

      .scan-grid {
        background-image: 
          linear-gradient(rgba(168, 85, 247, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(168, 85, 247, 0.05) 1px, transparent 1px);
        background-size: 40px 40px;
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
  const [expression, setExpression] = useState(null);
  const [scanning, setScanning] = useState(true);
  const [loadingModels, setLoadingModels] = useState(true);
  const [cameraError, setCameraError] = useState(false);
  const { user } = useAuth();

  // --- 1. Initialize Models & Video ---
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

    // Cleanup
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
        console.error("Camera Error:", err);
        setCameraError(true);
      });
  };

  // --- 2. Detection Logic (Handles Restart Properly) ---
  useEffect(() => {
    // Stop if not scanning, loading, or error
    if (!scanning || loadingModels || cameraError) return;

    const runDetection = () => {
      // Clear any existing interval to prevent duplicates
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(async () => {
        if (!videoRef.current) return;

        // Detect Face
        const result = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        if (result?.expressions) {
          // Find strongest emotion
          const maxExp = Object.entries(result.expressions).reduce((a, b) =>
            a[1] > b[1] ? a : b
          );
          
          // Confidence Threshold (Wait for > 60% certainty)
          if (maxExp[1] > 0.6) {
            const detectedMood = maxExp[0];
            
            // 1. Stop Scanning
            clearInterval(intervalRef.current);
            setScanning(false); 
            
            // 2. Update State
            setExpression(detectedMood);
            
            // 3. Save to DB
            saveExpressionToDB(detectedMood);
          }
        }
      }, 500); // Check every 500ms
    };

    // Trigger Detection
    const video = videoRef.current;
    if (video && video.readyState >= 4) {
      // If video is already playing (Try Again case), start immediately
      runDetection();
    } else if (video) {
      // If video is loading (Initial Load case), wait for play event
      video.addEventListener("playing", runDetection);
    }

    return () => {
      if (video) video.removeEventListener("playing", runDetection);
      clearInterval(intervalRef.current);
    };
  }, [scanning, loadingModels, cameraError]); 

  // --- 3. Backend Sync ---
  const saveExpressionToDB = async (mood) => {
    if (!user?.email) return;
    try {
      await axios.post(
        "http://localhost:4000/mood/save",
        { userId: user.email, mood: mood },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("DB Save Failed:", err);
    }
  };

  // --- 4. Try Again Logic ---
  const handleRescan = () => {
    setExpression(null); // Clear old result
    setScanning(true);   // This triggers the useEffect above to restart detection
  };

  return (
    <div className="min-h-screen bg-black text-white font-body selection:bg-purple-500 selection:text-white pt-24 pb-20">
      <PremiumStyles />

      {/* --- Ambient Background --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        
        {/* --- Header --- */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-[#0A0A0A] text-xs font-mono text-gray-500 mb-4 tracking-widest uppercase">
             <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
             Emotion AI Online
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-2">
            Expression <span className="premium-text-gradient">Analysis</span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Advanced computer vision mapping to detect micro-expressions and curate your sonic reality.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          
          {/* --- Left: The Scanner (Span 7) --- */}
          <div className="lg:col-span-7 relative">
            <motion.div 
              layout
              className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-[#050505] shadow-2xl aspect-[4/3] group"
            >
              {/* 1. Loading State */}
              {loadingModels && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black font-mono text-purple-400">
                   <FaMicrochip className="text-4xl mb-4 animate-pulse" />
                   <p>LOADING NEURAL NETWORKS...</p>
                </div>
              )}

              {/* 2. Error State */}
              {cameraError && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0A0A0A] text-red-500">
                   <FaExclamationTriangle className="text-5xl mb-4" />
                   <p className="font-bold">CAMERA ACCESS DENIED</p>
                   <p className="text-gray-500 text-sm mt-2">Please enable camera permissions in your browser.</p>
                </div>
              )}

              {/* 3. Video Feed */}
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover transform scale-x-[-1] transition-all duration-700 ${!scanning ? 'grayscale opacity-60' : 'opacity-100'}`}
              />

              {/* 4. Scanner HUD (Visible when scanning) */}
              <AnimatePresence>
                {scanning && !loadingModels && !cameraError && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 pointer-events-none"
                  >
                     {/* Grid & Laser */}
                     <div className="absolute inset-0 scan-grid opacity-20" />
                     <div className="scan-line" />
                     
                     {/* Corner Brackets */}
                     <div className="absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-purple-500 rounded-tl-xl" />
                     <div className="absolute top-6 right-6 w-12 h-12 border-r-2 border-t-2 border-purple-500 rounded-tr-xl" />
                     <div className="absolute bottom-6 left-6 w-12 h-12 border-l-2 border-b-2 border-purple-500 rounded-bl-xl" />
                     <div className="absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-purple-500 rounded-br-xl" />

                     {/* Status Label */}
                     <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 border border-white/10 px-4 py-1 rounded-full backdrop-blur-md">
                        <p className="text-xs font-mono text-purple-400 animate-pulse">ANALYZING EXPRESSIONS...</p>
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 5. Success Overlay */}
              {!scanning && expression && (
                 <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-black/80 backdrop-blur-md border border-purple-500/30 p-8 rounded-2xl text-center shadow-2xl"
                    >
                       <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4 shadow-[0_0_30px_rgba(34,197,94,0.3)] rounded-full" />
                       <h3 className="text-2xl font-heading font-bold text-white">Emotion Detected</h3>
                       <p className="text-gray-400 text-sm">Processing Audio Match</p>
                    </motion.div>
                 </div>
              )}
            </motion.div>
          </div>

          {/* --- Right: Data & Controls (Span 5) --- */}
          <div className="lg:col-span-5 flex flex-col gap-6">
             
             {/* 1. Result Card */}
             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className="glass-black p-8 rounded-[2rem] relative overflow-hidden border-l-4 border-l-purple-500"
             >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-900/20 blur-[50px] rounded-full pointer-events-none" />
                
                <h3 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-6">Current Emotional State</h3>
                
                {expression ? (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="flex items-center justify-between"
                   >
                      <div>
                         <div className="text-5xl md:text-6xl font-heading font-bold text-white capitalize mb-2">
                            {expression}
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="text-sm text-green-400 font-mono">CONFIDENCE HIGH</span>
                         </div>
                      </div>
                      {/* Dynamic Emoji Display */}
                      <div className="text-7xl drop-shadow-2xl filter grayscale-0 transition-all">
                          {expression === 'happy' && '😁'}
                          {expression === 'sad' && '🌧️'}
                          {expression === 'angry' && '😡'}
                          {expression === 'neutral' && '😐'}
                          {expression === 'surprised' && '😲'}
                          {expression === 'fearful' && '😨'}
                          {expression === 'disgusted' && '🤢'}
                      </div>
                   </motion.div>
                ) : (
                   <div className="flex items-center gap-4 opacity-30">
                      <div className="w-12 h-12 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin" />
                      <div>
                         <div className="h-6 w-32 bg-white/20 rounded mb-2 animate-pulse" />
                         <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
                      </div>
                   </div>
                )}
             </motion.div>

             {/* 2. Action Button (Rescan) */}
             <AnimatePresence>
               {!scanning && (
                  <motion.button
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onClick={handleRescan}
                    className="w-full py-5 bg-white text-black rounded-2xl font-bold font-heading uppercase tracking-wide hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center gap-3"
                  >
                     <FaSmile /> Try Again
                  </motion.button>
               )}
             </AnimatePresence>

             {/* 3. Suggested Music Container */}
             <AnimatePresence>
                {expression && (
                   <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.2 }}
                     className="glass-black rounded-[2rem] p-6 border border-white/10"
                   >
                      <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                         <h3 className="text-lg font-bold text-white">Mood Playlist</h3>
                         <span className="text-xs font-mono text-purple-400">GENERATED</span>
                      </div>
                      
                      {/* SuggestedMusic1 receives the NEW mood automatically */}
                      <SuggestedMusic1 expression={expression} />
                   </motion.div>
                )}
             </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceScan;