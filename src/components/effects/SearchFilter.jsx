import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

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

export default function SearchFilter({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  resultCount
}) {
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

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          type="text"
          placeholder="Search effects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 pr-10 py-6 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 rounded-xl"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
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