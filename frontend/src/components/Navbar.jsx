import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Menu, X, User, LogOut } from "lucide-react"; // Switched to lucide-react for stability

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null); // State to track login
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Scroll Effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Check Authentication State
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem("User");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkAuth(); // Run on mount

    // Listen for the custom event dispatched from Login.jsx
    window.addEventListener("storage", checkAuth);
    
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // 3. Logout Logic
  const handleLogout = () => {
    localStorage.removeItem("User");
    localStorage.removeItem("token");
    setUser(null);
    setIsOpen(false);
    window.dispatchEvent(new Event("storage")); // Notify app of logout
    navigate("/login");
  };

  // Navigation Links
  const links = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Emo Player", path: "/musicplayer" },
    { name: "Dashboard", path: "/dashboard" },
  ];

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&family=Space+Grotesk:wght@300;500;700&display=swap');
          .font-heading { font-family: 'Space Grotesk', sans-serif; }
          .font-body { font-family: 'Outfit', sans-serif; }
          
          .nav-glass {
            background: rgba(5, 5, 5, 0.7);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
          }
        `}
      </style>

      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4"
      >
        <nav 
          className={`nav-glass rounded-full px-6 md:px-8 py-3 flex items-center justify-between transition-all duration-300 
          ${isOpen ? 'rounded-2xl w-full max-w-md flex-col gap-4' : 'w-full max-w-3xl'}`}
        >
          
          {/* --- Logo Section --- */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsOpen(false)}>
              <div className="relative flex items-center justify-center w-8 h-8 bg-gradient-to-tr from-purple-600 to-fuchsia-600 rounded-full text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Music className="w-4 h-4" />
              </div>
              <span className="text-xl font-heading font-bold text-white tracking-wide group-hover:text-purple-300 transition-colors">
                EMOTIFY
              </span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden text-gray-300 hover:text-white focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* --- Desktop Links --- */}
          <ul className="hidden md:flex items-center gap-8 font-body font-medium text-sm text-gray-400">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <li key={link.name} className="relative">
                  <Link 
                    to={link.path} 
                    className={`transition-colors duration-300 hover:text-white ${isActive ? "text-white font-semibold" : ""}`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.span 
                        layoutId="underline"
                        className="absolute left-0 -bottom-1 w-full h-[2px] bg-gradient-to-r from-purple-500 to-fuchsia-500" 
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* --- Right Side (Login OR Profile) --- */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                 {/* Username Display (Optional) */}
                 <span className="text-xs font-bold text-purple-300 hidden lg:block">
                    Hi, {user.username}
                 </span>
                 
                 {/* Logout Button */}
                 <button 
                   onClick={handleLogout}
                   className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-red-500/10 hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-300 text-xs font-bold text-red-400 uppercase tracking-wider"
                 >
                   <LogOut className="w-4 h-4" />
                 </button>
              </div>
            ) : (
              /* Login Button (Only shows if NO user) */
              <Link 
                to="/login" 
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 text-xs font-bold text-white uppercase tracking-wider"
              >
                <User className="w-4 h-4 text-purple-400" />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* --- Mobile Menu Dropdown --- */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden w-full overflow-hidden flex flex-col gap-4 pb-4 mt-2 border-t border-white/10 pt-4"
              >
                {links.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`text-center py-2 text-sm font-heading tracking-wider hover:bg-white/5 rounded-lg transition-colors ${
                      location.pathname === link.path ? "text-purple-400 font-bold bg-white/5" : "text-gray-400"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}

                {/* Mobile Login/Logout */}
                {user ? (
                  <button 
                    onClick={handleLogout}
                    className="w-full py-3 mt-2 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-red-400 font-bold text-sm"
                  >
                    Logout
                  </button>
                ) : (
                  <Link 
                    to="/login"
                    onClick={() => setIsOpen(false)} 
                    className="w-full py-3 mt-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-xl text-center text-white font-bold text-sm"
                  >
                    Login Account
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </nav>
      </motion.header>
    </>
  );
};

export default Navbar;