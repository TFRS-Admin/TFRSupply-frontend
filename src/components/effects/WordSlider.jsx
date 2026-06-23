import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const defaultWords = ["Effects", "Components", "Animations", "UI Patterns", "Code Snippets"];

export default function WordSlider({ words = defaultWords, className = "" }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(i => (i + 1) % words.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [words]);

  return (
    <span className={`inline-block overflow-hidden ${className}`} style={{ height: "1.2em", verticalAlign: "middle" }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="inline-block"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}