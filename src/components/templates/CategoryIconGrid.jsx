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
    <div className="pd-product-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${columns},1fr)`, gap: '1.5rem' }}>
      {items.map(cat => {
        const Icon = ICON_MAP[cat.icon] || Tag;
        const inner = (
          <div className="vlt-category-card">
            <div className="vlt-category-card-icon">
              <Icon size={24} color="#c8102e" />
            </div>
            <p className={`font-heading text-base font-bold uppercase tracking-tight text-[#0f0f0f] ${cat.desc ? 'mb-1.5' : ''}`}>{cat.label}</p>
            {cat.desc && <p className="font-body flex-1 text-sm leading-relaxed text-gray-500">{cat.desc}</p>}
            <span className="vlt-category-card-arrow">
              <ArrowRight size={16} color="#c8102e" />
            </span>
          </div>
        );
        if (cat.to) return <Link key={cat.label} to={cat.to} style={{ textDecoration: 'none', color: 'inherit' }}>{inner}</Link>;
        return <a key={cat.label} href={cat.href || '#'} style={{ textDecoration: 'none', color: 'inherit' }}>{inner}</a>;
      })}
    </div>
  );
}
