import React, { useState } from "react";
import { motion } from "framer-motion";

export default function GlitchButton({ children, onClick, className = "", variant = "primary" }) {
  const [isGlitching, setIsGlitching] = useState(false);

  const handleClick = () => {
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 400);
    if (onClick) onClick();
  };

  return (
    <>
      <style>{`
        @keyframes glitch-effect {
          0%, 100% { text-shadow: none; transform: translate(0); }
          10% { text-shadow: -2px 0 #ff00ff, 2px 0 #00ffff; transform: translate(-1px, 1px); }
          20% { text-shadow: 2px 0 #ff00ff, -2px 0 #00ffff; transform: translate(1px, -1px); }
          30% { text-shadow: -1px 0 #00ffff, 1px 0 #ff00ff; transform: translate(-1px, 0); }
          40% { text-shadow: 1px 0 #00ffff, -1px 0 #ff00ff; transform: translate(1px, 1px); }
          50% { text-shadow: 0 -1px #ff00ff, 0 1px #00ffff; transform: translate(0, -1px); }
          60% { text-shadow: none; transform: translate(0); }
        }
        .glitch-active { animation: glitch-effect 0.4s ease-in-out; }
      `}</style>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={`${isGlitching ? 'glitch-active' : ''} ${
          variant === "primary"
            ? "bg-gradient-to-r from-violet-500 to-cyan-500 text-white"
            : "bg-slate-800 text-slate-300 border border-slate-700 hover:border-violet-500"
        } px-4 py-2 rounded-lg font-semibold text-sm transition-all ${className}`}
      >
        {children}
      </motion.button>
    </>
  );
}