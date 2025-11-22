import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FaHeadphones, FaMusic, FaSmile, FaPlay, FaMagic, FaFingerprint } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// Import your audio files
import excuse from "../music/Excuses.mp3";
import sidhu from "../music/295.mp3";
import jatt from "../music/Jatt Di Clip 2.mp3";
import brownMunde from "../music/Paani Paani.mp3"; 

// --- Custom Fonts Injection ---
const FontStyles = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&family=Space+Grotesk:wght@300;500;700&display=swap');
      
      .font-heading { font-family: 'Space Grotesk', sans-serif; }
      .font-body { font-family: 'Outfit', sans-serif; }
      
      .premium-gradient-text {
        background: linear-gradient(135deg, #fff 0%, #a855f7 50%, #ec4899 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    `}
  </style>
);

const Home = () => {
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse parallax effect for background
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20,
        y: (e.clientY / window.innerHeight) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (

    <div className="relative min-h-screen bg-[#030303] text-white font-body overflow-x-hidden selection:bg-fuchsia-500 selection:text-white">
      <FontStyles />

      {/* --- Cinematic Background --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ x: mousePosition.x * -1, y: mousePosition.y * -1 }}
          className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[150px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ x: mousePosition.x, y: mousePosition.y }}
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-pink-900/15 rounded-full blur-[150px] mix-blend-screen" 
        />
        {/* Noise Texture Overlay for "Film Grain" feel */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      </div>
      {/* --- Hero Section --- */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center pt-32 pb-20 px-6 md:px-16 max-w-8xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left: Typography & Motion */}
          <div className="text-left space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-heading uppercase tracking-widest text-fuchsia-300"
            >
              <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></span>
              EMOTIFY Live
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-7xl md:text-[6.5rem] font-heading font-bold leading-[0.95] tracking-tight"
            >
              <span className="premium-gradient-text block pb-2">Your Mood.</span>
              <span className="text-white opacity-90">Your Music.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-lg font-light"
            >
              Emotify detects <span className="text-white font-medium">your face </span> to deliver songs that match your vibe.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/login"
                className="relative group px-8 py-4 bg-white text-black rounded-full font-heading font-bold overflow-hidden"
              >
                <div className="absolute inset-0 bg-fuchsia-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative group-hover:text-white transition-colors flex items-center gap-2">
                  <FaFingerprint /> Start Scan
                </span>
              </Link>
              
              <button className="px-8 py-4 rounded-full border border-white/20 font-heading font-medium hover:bg-white/5 transition-colors text-white/80">
                Watch Demo
              </button>
            </motion.div>
          </div>

          {/* Right: Abstract Glass Card (The "Official" Look) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 blur-3xl rounded-full opacity-40 animate-pulse" />
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              
              <div className="flex justify-between items-start mb-12">
                <div className="space-y-1">
                  <h3 className="text-sm font-heading text-gray-400 uppercase tracking-widest">Analysis Engine</h3>
                  <p className="text-2xl font-bold text-white">Active</p>
                </div>
                <FaMagic className="text-3xl text-fuchsia-500 animate-spin-slow" style={{ animationDuration: '10s' }} />
              </div>

              <div className="space-y-6 relative z-10">
                 <p className="text-lg text-gray-300 leading-relaxed font-light">
                  "Emotify powers the backbone of next-gen music recommendation systems with state-of-the-art emotion detection & real-time mood matching."
                 </p>
                 <div className="h-[1px] w-full bg-white/10" />
                 <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-mono">EMOTIFY Live</span>
                    <button className="text-sm font-bold text-white hover:text-fuchsia-400 transition-colors uppercase tracking-wider" onClick={() => window.location.href = "/login"}>
                      Start Scan &rarr;
                    </button>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Stats Section (Official Metrics) --- */}
      <section className="py-10 px-6 md:px-16 max-w-7xl mx-auto z-10 relative">
        <div className="grid md:grid-cols-2 gap-8">
            {[
              { val: "192k", label: "Songs Analyzed", color: "text-fuchsia-400", glow: "bg-fuchsia-900/20" },
              { val: "07", label: "Emotion Patterns", color: "text-purple-400", glow: "bg-purple-900/20" }
            ].map((stat, idx) => (
               <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="relative bg-[#080808] p-12 rounded-[2.5rem] border border-white/5 overflow-hidden group hover:border-white/10 transition-colors duration-500"
              >
                <div className={`absolute -right-20 -bottom-20 w-80 h-80 ${stat.glow} blur-[100px] opacity-50 group-hover:opacity-100 transition-opacity duration-700`} />
                <h3 className={`text-7xl md:text-8xl font-heading font-bold ${stat.color} mb-4`}>{stat.val}</h3>
                <p className="text-gray-400 text-xl font-body tracking-wide">{stat.label}</p>
              </motion.div>
            ))}
        </div>
      </section>

      {/* --- How It Works (Tech Steps) --- */}
      <section className="py-32 px-6 md:px-16 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">System Process</h2>
            <p className="text-gray-500">Advanced music processing</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <FaSmile />, title: "Detection", desc: "Your facial expressions and voice are analyzed using AI." },
              { icon: <FaHeadphones />, title: "Analysis", desc: "We decode your mood using smart algorithms." },
              { icon: <FaMusic />, title: "Delivery", desc: "Songs that match your emotions start playing instantly." },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                whileHover={{ y: -10 }}
                className="bg-white/[0.02] backdrop-blur-sm p-10 rounded-3xl border border-white/5 hover:bg-white/[0.05] transition-all duration-300"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-fuchsia-600 to-purple-700 rounded-2xl flex items-center justify-center text-white text-2xl mb-8 shadow-lg shadow-purple-900/30">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-heading font-bold text-white mb-4">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Suggested Songs (Premium Grid) --- */}
      <section className="py-24 px-6 md:px-16 relative z-10 bg-gradient-to-b from-transparent to-black/80">
        <div className="max-w-8xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
             <div>
               <h2 className="text-4xl font-heading font-bold text-white">Curated Selection</h2>
               <p className="text-gray-500 mt-2">Based on your current mood reading</p>
             </div>
             <button className="text-fuchsia-400 font-bold hover:text-white transition-colors">View All History &rarr;</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Excuses", artist: "AP Dhillon", image: "https://c.saavncdn.com/890/Excuses-English-2021-20210930112054-500x500.jpg", audio: excuse },
              { title: "295", artist: "Sidhu Moose Wala", image: "https://i1.sndcdn.com/artworks-zs1LZCGop7fKxviM-OwQ5zg-t1080x1080.jpg", audio: sidhu },
              { title: "Jatt Di Clip 2", artist: "Singga", image: "https://lyricsgana.wordpress.com/wp-content/uploads/2019/12/singga_jatt_di_clip_2-1.jpg?w=1024", audio: jatt },
              { title: "Paani Paani", artist: "AP Dhillon", image: "https://i.scdn.co/image/ab67616d0000b273365b3fb800c19f7ff72602da", audio: brownMunde },
            ].map((song, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10, rotateX: 5, rotateY: 5 }}
                className="group relative bg-[#111] rounded-3xl p-4 border border-white/5 hover:border-fuchsia-500/30 transition-all duration-500 shadow-2xl hover:shadow-fuchsia-900/20"
                style={{ perspective: '1000px' }}
              >
                <div className="relative overflow-hidden rounded-2xl mb-5 aspect-square">
                    <img src={song.image} alt={song.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                        <button className="w-14 h-14 bg-fuchsia-500 rounded-full flex items-center justify-center text-white pl-1 shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 cubic-bezier(0.175, 0.885, 0.32, 1.275)">
                            <FaPlay />
                        </button>
                    </div>
                </div>
                <div className="px-2">
                  <h3 className="text-lg font-heading font-bold text-white truncate">{song.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 font-medium">{song.artist}</p>
                  <audio controls className="w-full h-8 opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 invert">
                    <source src={song.audio} type="audio/mpeg" />
                  </audio>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;