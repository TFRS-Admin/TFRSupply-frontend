import React, { useState, useEffect } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const wilsonWisdoms = [
  "Well, you know what they say: 'A journey of a thousand miles begins with a single step.' - Lao Tzu",
  "As the great philosopher Aristotle once said, 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.'",
  "You know, there's an old saying: 'The only constant in life is change.' - Heraclitus",
  "Confucius once wrote, 'It does not matter how slowly you go as long as you do not stop.'",
  "Remember what Socrates said: 'The only true wisdom is in knowing you know nothing.'",
  "There's ancient wisdom: 'Fall seven times, stand up eight.' - Japanese proverb",
  "Marcus Aurelius wrote: 'Very little is needed to make a happy life; it is all within yourself.'",
  "The wise ones tell us: 'What we think, we become.' - Buddha",
  "Fortune favors the bold.' - Virgil",
  "A smooth sea never made a skilled sailor.",
];

export default function WilsonQuote({ version = "1.0.0" }) {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    setQuote(wilsonWisdoms[dayOfYear % wilsonWisdoms.length]);
  }, []);

  return (
    <HoverCard openDelay={50} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button className="text-xs text-slate-500 hover:text-violet-400 transition-colors font-mono">
          v{version} ✨
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 bg-slate-900/95 border-slate-700 text-white p-4 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧙‍♂️</span>
            <span className="font-semibold text-violet-400 text-sm">WILSON SAYS</span>
          </div>
          <p className="text-slate-300 text-sm italic leading-relaxed">"{quote}"</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}