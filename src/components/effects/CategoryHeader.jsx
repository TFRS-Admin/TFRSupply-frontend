import React from "react";
import { motion } from "framer-motion";

export default function CategoryHeader({ icon: Icon, title, description, gradient }) {
  const isColor = (str) => str && (str.startsWith('#') || str.startsWith('rgb') || str.startsWith('hsl'));
  
  const rawGradient = gradient && typeof gradient === 'string' ? gradient : '';
  const firstPart = rawGradient.split(',')[0].trim();
  
  const gradientStart = isColor(firstPart) ? firstPart : '#8b5cf6';
  const gradientFull = isColor(firstPart) ? rawGradient : '#8b5cf6, #06b6d4';
  
  return (
    <div className="relative pt-0 pb-16 -mt-24 overflow-hidden">
      <div 
        className="absolute inset-0 opacity-30"
        style={{ background: `linear-gradient(180deg, ${gradientStart} 0%, transparent 100%)` }}
      />
      <div 
        className="absolute inset-0 opacity-20 blur-3xl"
        style={{ background: `radial-gradient(ellipse at center top, ${gradientFull}, transparent 70%)` }}
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-44">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1, rotate: 360, boxShadow: `0 0 30px ${gradientStart}` }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
            className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 mb-6 cursor-pointer"
          >
            <Icon className="w-8 h-8 text-white" />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">{description}</p>
        </motion.div>
      </div>
    </div>
  );
}