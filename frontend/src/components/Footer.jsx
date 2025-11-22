import React from "react";
import { FaMusic } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-black border-t border-white/10 pt-16 pb-12 px-6 md:px-16 font-sans">
      <div className="max-w-8xl mx-auto flex flex-col md:flex-row justify-between items-end gap-10">
        
        {/* Left Side: Brand & Tagline */}
        <div className="space-y-6 max-w-md text-left">
          <div className="flex items-center gap-3">
             <FaMusic className="text-fuchsia-600 text-2xl" />
             <span className="text-2xl font-bold text-white tracking-wide font-heading">EMOTIFY</span>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed font-body">
            Bridging the gap between artificial intelligence and human emotion through the universal language of sound.
          </p>
        </div>

        {/* Right Side: Navigation & Copyright */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-16 w-full md:w-auto">
           <div className="flex gap-8 text-sm font-medium text-gray-400 font-body">
              <Link to="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="#" className="hover:text-white transition-colors">Terms</Link>
              <Link to="#" className="hover:text-white transition-colors">Contact</Link>
           </div>
           <div className="text-sm text-gray-600 font-body">
              © 2025 Emotify AI Inc.
           </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;