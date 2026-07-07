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
          <div className="vlt-category-card">
            <div className="vlt-category-card-icon">
              <Icon size={24} color="#c8102e" />
            </div>
            <p style={{ ...FS, fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: cat.desc ? 6 : 0 }}>{cat.label}</p>
            {cat.desc && <p style={{ ...FS, fontSize: 13, color: '#666', lineHeight: 1.55, flex: 1 }}>{cat.desc}</p>}
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
