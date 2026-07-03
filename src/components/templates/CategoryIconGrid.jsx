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

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

export default function CategoryIconGrid({ items = [], columns = 4 }) {
  return (
    <div className="pd-product-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${columns},1fr)`, gap: '1.5rem' }}>
      {items.map(cat => {
        const Icon = ICON_MAP[cat.icon] || Tag;
        const inner = (
          <div className="border border-gray-200 p-5 flex flex-col items-start gap-3 h-full"
            style={{ transition: 'border-color 0.15s', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#c8102e'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
            <Icon size={28} color="#c8102e" />
            <p style={{ ...FS, fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{cat.label}</p>
            {cat.desc && <p style={{ ...FS, fontSize: 13, color: '#666', lineHeight: 1.55 }}>{cat.desc}</p>}
          </div>
        );
        if (cat.to) return <Link key={cat.label} to={cat.to} style={{ textDecoration: 'none', color: 'inherit' }}>{inner}</Link>;
        return <a key={cat.label} href={cat.href || '#'} style={{ textDecoration: 'none', color: 'inherit' }}>{inner}</a>;
      })}
    </div>
  );
}