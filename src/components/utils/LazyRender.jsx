import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function LazyRender({ children, placeholderHeight = "300px", threshold = 0.1 }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px 0px', threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={ref} className="w-full h-full">
      {isVisible ? children : (
        <div
          className="w-full bg-slate-900/50 rounded-xl border border-slate-800/50 animate-pulse flex items-center justify-center"
          style={{ minHeight: placeholderHeight }}
        >
          <div className="flex flex-col items-center gap-2 opacity-50">
            <motion.div
              className="w-8 h-8 rounded-full border-2 border-slate-600 border-t-slate-400"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-xs text-slate-500 font-mono">Loading Effect...</span>
          </div>
        </div>
      )}
    </div>
  );
}