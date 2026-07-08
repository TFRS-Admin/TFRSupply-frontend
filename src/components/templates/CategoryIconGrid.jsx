import React from 'react';
import { Link } from 'react-router-dom';
import {
  Layers, Volume2, Lightbulb, ArrowRight, Shield, AlertTriangle,
  Zap, Settings, Phone, FileDown, BarChart2, Tag
} from 'lucide-react';

const ICON_MAP = {
  Layers, Volume2, Lightbulb, ArrowRight, Shield, AlertTriangle,
  Zap, Settings, Phone, FileDown, BarChart2, Tag
};

export default function CategoryIconGrid({ items = [], columns = 4 }) {
  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${columns},1fr)` }}>
      {items.map(cat => {
        const Icon = ICON_MAP[cat.icon] || Tag;
        const inner = (
          <div className="group relative flex h-full flex-col items-start gap-1.5 rounded-md border border-gray-200 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#C8102E] hover:shadow-md">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 transition-colors duration-200 group-hover:bg-[#C8102E]/10">
              <Icon size={24} className="text-[#C8102E]" />
            </div>
            <p className={`font-heading text-base font-bold uppercase tracking-tight text-[#0F0F0F] ${cat.desc ? 'mb-1.5' : ''}`}>
              {cat.label}
            </p>
            {cat.desc && (
              <p className="font-body flex-1 text-sm leading-relaxed text-gray-500">{cat.desc}</p>
            )}
            <span className="absolute right-5 top-5 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100">
              <ArrowRight size={16} className="text-[#C8102E]" />
            </span>
          </div>
        );
        if (cat.to) return <Link key={cat.label} to={cat.to} className="text-inherit no-underline">{inner}</Link>;
        return <a key={cat.label} href={cat.href || '#'} className="text-inherit no-underline">{inner}</a>;
      })}
    </div>
  );
}
