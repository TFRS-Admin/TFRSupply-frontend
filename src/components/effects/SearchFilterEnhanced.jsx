import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const categories = [
  { id: "all", label: "All", color: "violet" },
  { id: "visual", label: "Visual", color: "violet" },
  { id: "audio", label: "Audio", color: "cyan" },
  { id: "transition", label: "Transitions", color: "pink" },
  { id: "navigation", label: "Navigation", color: "amber" },
  { id: "button", label: "Buttons", color: "emerald" },
  { id: "chat", label: "Chat", color: "blue" },
  { id: "agent", label: "AI Agent", color: "purple" },
  { id: "admin", label: "Admin", color: "slate" },
  { id: "marketing", label: "Marketing", color: "rose" },
  { id: "creative", label: "Creative", color: "fuchsia" },
  { id: "ecommerce", label: "E-commerce", color: "orange" },
  { id: "content", label: "Content", color: "teal" },
  { id: "communication", label: "Comms", color: "indigo" },
  { id: "social", label: "Social", color: "pink" },
  { id: "productivity", label: "Productivity", color: "green" },
  { id: "gaming", label: "Gaming", color: "red" },
];

const allEffectSuggestions = [
  { name: "Wave Divider", page: "DividerEffects", category: "Dividers" },
  { name: "Glitch Effect", page: "VisualEffects", category: "Visual" },
  { name: "Neon Glow", page: "VisualEffects", category: "Visual" },
  { name: "Ripple Button", page: "ButtonEffects", category: "Buttons" },
  { name: "Chat Bubble", page: "ChatEffects", category: "Chat" },
  { name: "Particle System", page: "VisualEffects", category: "Visual" },
  { name: "Loading Spinner", page: "LoadingSpinners", category: "Loading" },
  { name: "Fade Transition", page: "Transitions", category: "Transitions" },
  { name: "VHS Effect", page: "VisualEffects", category: "Visual" },
  { name: "Frosted Glass", page: "VisualEffects", category: "Visual" },
];

export default function SearchFilterEnhanced({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  resultCount,
  suggestions = allEffectSuggestions
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = suggestions.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [searchQuery, suggestions]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-4 mb-8">
      <style>{`
        .category-glitch:hover {
          animation: cat-glitch 0.3s ease-in-out;
        }
        @keyframes cat-glitch {
          0%, 100% { text-shadow: none; transform: translate(0); }
          20% { text-shadow: -1px 0 #ff00ff, 1px 0 #00ffff; transform: translate(-1px, 0); }
          40% { text-shadow: 1px 0 #ff00ff, -1px 0 #00ffff; transform: translate(1px, 0); }
          60% { text-shadow: -1px 0 #00ffff, 1px 0 #ff00ff; transform: translate(-1px, 0); }
          80% { text-shadow: 1px 0 #00ffff, -1px 0 #ff00ff; transform: translate(1px, 0); }
        }
      `}</style>

      <div className="relative" ref={searchRef}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
        <Input
          type="text"
          placeholder="Search effects by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery && setShowSuggestions(filteredSuggestions.length > 0)}
          className="pl-12 pr-10 py-6 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 rounded-xl"
        />
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(""); setShowSuggestions(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {filteredSuggestions.map((s, i) => (
                <Link
                  key={i}
                  to={createPageUrl(s.page)}
                  onClick={() => setShowSuggestions(false)}
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-800 transition-colors"
                >
                  <span className="text-white text-sm">{s.name}</span>
                  <span className="text-slate-500 text-xs">{s.category}</span>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`category-glitch px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === cat.id
                ? "bg-violet-500 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {resultCount !== undefined && (
        <p className="text-slate-500 text-sm">
          Showing <span className="text-violet-400 font-semibold">{resultCount}</span> effects
          {searchQuery && <span> for "<span className="text-white">{searchQuery}</span>"</span>}
        </p>
      )}
    </div>
  );
}