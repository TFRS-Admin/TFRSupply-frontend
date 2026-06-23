import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const loadingMessages = [
  "INITIALIZING SYSTEMS...",
  "LOADING EFFECTS...",
  "COMPILING AWESOME...",
  "ALMOST THERE...",
];

export default function GlitchLoader({ isLoading = true, onComplete }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) return;

    const messageInterval = setInterval(() => {
      setMessageIndex(i => (i + 1) % loadingMessages.length);
    }, 800);

    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(progressInterval);
          if (onComplete) onComplete();
          return 100;
        }
        return p + 2;
      });
    }, 30);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [isLoading, onComplete]);

  if (!isLoading) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950"
      >
        <style>{`
          @keyframes glitch-text {
            0%, 100% { text-shadow: none; }
            25% { text-shadow: -2px 0 #ff00ff, 2px 0 #00ffff; }
            50% { text-shadow: 2px 0 #ff00ff, -2px 0 #00ffff; }
            75% { text-shadow: -1px 0 #00ffff, 1px 0 #ff00ff; }
          }
          .glitch-text { animation: glitch-text 0.5s ease-in-out infinite; }
        `}</style>

        <div className="text-center space-y-8 px-4">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto rounded-full border-4 border-violet-500/30 border-t-violet-500"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-violet-400 text-lg font-bold">⚡</span>
            </div>
          </div>

          <div>
            <p className="glitch-text text-violet-400 font-mono text-sm font-bold tracking-widest">
              {loadingMessages[messageIndex]}
            </p>
          </div>

          <div className="w-64 mx-auto">
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <p className="text-slate-500 text-xs mt-2 font-mono">{progress}%</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}