import React, { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import { FaCode, FaBrain, FaSpotify, FaMusic, FaLightbulb, FaRocket } from 'react-icons/fa';
// Link is no longer needed if we remove the navbar, but keeping it in case you add buttons later
import { Link } from 'react-router-dom';

// --- Custom Fonts Injection (Same as Home) ---
const FontStyles = () => (
  <style>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&family=Space+Grotesk:wght@300;500;700&display=swap');
      .font-heading { font-family: 'Space Grotesk', sans-serif; }
      .font-body { font-family: 'Outfit', sans-serif; }
      .glass-panel {
        background: rgba(20, 20, 20, 0.6);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      .premium-gradient-text {
        background: linear-gradient(135deg, #fff 0%, #a855f7 50%, #ec4899 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    `}
  </style>
);

const About = () => {
  const { scrollYProgress } = useScroll();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse parallax effect
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

      {/* --- Ambient Background --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ x: mousePosition.x * -1, y: mousePosition.y * -1 }}
          className="absolute top-[-10%] left-[20%] w-[700px] h-[700px] bg-purple-900/20 rounded-full blur-[120px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ x: mousePosition.x, y: mousePosition.y }}
          className="absolute bottom-[-10%] right-[20%] w-[600px] h-[600px] bg-fuchsia-900/15 rounded-full blur-[120px] mix-blend-screen" 
        />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      </div>

      {/* --- Main Content --- */}
      {/* kept pt-32 to ensure space for external navbar */}
      <div className="relative z-10 pt-32 pb-20 px-6 md:px-16 max-w-6xl mx-auto">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6">
            The <span className="premium-gradient-text">Emotify Team.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
            A group exploring how the mind, technology, and music connect.
          </p>
        </motion.div>

        {/* Grid Layout: Team & Mission */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-32">
          
          {/* Left: Image & decorative elements */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center"
          >
             <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-500 to-purple-600 rounded-full blur-[80px] opacity-20" />
             <div className="relative w-full max-w-md aspect-square rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group">
                {/* Placeholder for Team Image */}
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" // Generic team photo
                  alt="Emotify Team" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                    <h3 className="text-2xl font-heading font-bold">The Team</h3>
                    <p className="text-fuchsia-400 text-sm">Full Stack Engineers</p>
                </div>
             </div>
          </motion.div>

          {/* Right: Text Content */}
          <motion.div 
             initial={{ opacity: 0, x: 50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8, delay: 0.2 }}
             className="space-y-8"
          >
            <div className="glass-panel p-8 rounded-3xl">
              <h2 className="text-3xl font-heading font-bold mb-4 text-white">Emotify Members</h2>
              <p className="text-gray-400 leading-relaxed mb-6">
                We are a collective of passionate full-stack developers with a love for turning innovative ideas into reality. 
                Specializing in the <span className="text-white font-medium">MERN stack</span>, we build systems that don't just function—they feel.
              </p>
              <div className="flex flex-wrap gap-3">
                {['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind'].map((tech) => (
                  <span key={tech} className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-fuchsia-300 font-mono">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
               <div className="flex-1 glass-panel p-6 rounded-2xl text-center hover:bg-white/5 transition-colors">
                  <FaRocket className="mx-auto text-2xl text-purple-500 mb-3" />
                  <h3 className="font-bold text-white">Performance</h3>
               </div>
               <div className="flex-1 glass-panel p-6 rounded-2xl text-center hover:bg-white/5 transition-colors">
                  <FaLightbulb className="mx-auto text-2xl text-yellow-500 mb-3" />
                  <h3 className="font-bold text-white">Innovation</h3>
               </div>
            </div>
          </motion.div>
        </div>

        {/* Technology Section (MoodSync) */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
           <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 rounded-[2.5rem] opacity-30 blur-lg" />
           <div className="relative bg-[#080808] rounded-[2.5rem] p-8 md:p-16 border border-white/10 overflow-hidden">
              
              <div className="grid md:grid-cols-2 gap-12">
                 <div>
                    <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">
                       What is <span className="text-fuchsia-500">EMOTIFY?</span>
                    </h2>
                    <p className="text-gray-400 text-lg leading-relaxed mb-8">
                       It is the core engine behind Emotify. An intelligent emotion-based system that reads your facial expressions to understand exactly how you feel.
                    </p>
                    <ul className="space-y-4">
                       {[
                          { icon: <FaBrain className="text-pink-500"/>, text: "Powered by Face-API.js & TensorFlow" },
                          { icon: <FaSpotify className="text-green-500"/>, text: "Seamless Spotify API Integration" },
                          { icon: <FaCode className="text-blue-500"/>, text: "Real-time Latency Optimization" }
                       ].map((item, idx) => (
                          <li key={idx} className="flex items-center gap-4 text-white/90">
                             <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                {item.icon}
                             </div>
                             <span className="text-lg">{item.text}</span>
                          </li>
                       ))}
                    </ul>
                 </div>

                 {/* Visual Representation of Logic */}
                 <div className="flex flex-col justify-center gap-4">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center gap-4">
                       <div className="text-xs font-mono text-gray-500">INPUT</div>
                       <div className="h-[1px] flex-1 bg-white/10"></div>
                       <div className="text-white font-bold">Facial Data</div>
                    </div>
                    <div className="flex justify-center">
                       <div className="h-8 w-[1px] bg-gradient-to-b from-white/10 to-fuchsia-500"></div>
                    </div>
                    <div className="bg-fuchsia-500/10 p-6 rounded-2xl border border-fuchsia-500/30 text-center">
                       <h3 className="text-fuchsia-400 font-mono text-sm mb-1">PROCESSING ENGINE</h3>
                       <p className="text-2xl font-bold text-white">AI Analysis</p>
                    </div>
                    <div className="flex justify-center">
                       <div className="h-8 w-[1px] bg-gradient-to-b from-fuchsia-500 to-white/10"></div>
                    </div>
                     <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex items-center gap-4">
                       <div className="text-white font-bold">Curated Audio</div>
                       <div className="h-[1px] flex-1 bg-white/10"></div>
                       <div className="text-xs font-mono text-gray-500">OUTPUT</div>
                    </div>
                 </div>
              </div>

           </div>
        </motion.div>

      </div>


    </div>
  );
};

export default About;