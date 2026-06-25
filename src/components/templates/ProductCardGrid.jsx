import React from 'react';
import { Link } from 'react-router-dom';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

export default function ProductCardGrid({ items = [], columns = 4 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns},1fr)`, gap: '1.5rem' }}>
      {items.map(p => {
        const inner = (
          <div className="bg-white border border-gray-200 overflow-hidden h-full flex flex-col"
            style={{ transition: 'border-color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#c8102e'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
            {p.image && <img src={p.image} alt={p.label} className="w-full object-cover" style={{ height: 180 }} />}
            <div className="p-4 flex flex-col flex-1">
              <p style={{ ...FS, fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: '0.3rem' }}>{p.label}</p>
              {p.tagline && <p style={{ ...FS, fontSize: 12, fontWeight: 600, color: '#c8102e', marginBottom: 6, fontStyle: 'italic' }}>{p.tagline}</p>}
              {p.desc && <p style={{ ...FS, fontSize: 13, color: '#666', lineHeight: 1.55, flex: 1 }}>{p.desc}</p>}
              <p style={{ ...FS, fontSize: 12, fontWeight: 700, color: '#c8102e', marginTop: '0.75rem', letterSpacing: '0.04em' }}>LEARN MORE</p>
            </div>
          </div>
        );
        if (p.to) return <Link key={p.label} to={p.to} style={{ textDecoration: 'none', color: 'inherit' }}>{inner}</Link>;
        return <a key={p.label} href={p.href || '#'} style={{ textDecoration: 'none', color: 'inherit' }}>{inner}</a>;
      })}
    </div>
  );
}