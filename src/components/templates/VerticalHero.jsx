import React from 'react';
import { ChevronRight } from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

export default function VerticalHero({ hero }) {
  if (!hero) return null;
  return (
    <div className="relative overflow-hidden" style={{ background: '#111', minHeight: 380 }}>
      {hero.image && (
        <img src={hero.image} alt={hero.imageAlt || ''} className="absolute inset-0 w-full h-full object-cover opacity-40" />
      )}
      <div className="relative max-w-7xl mx-auto px-6 py-20 flex flex-col justify-center" style={{ minHeight: 380 }}>
        <h1 style={{ ...FS, fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 700, color: '#fff', lineHeight: 1.15, maxWidth: 580, marginBottom: '1rem' }}>
          {hero.title}
        </h1>
        {hero.subtitle && (
          <p style={{ ...FS, fontSize: 16, color: 'rgba(255,255,255,0.82)', maxWidth: 520, lineHeight: 1.65, marginBottom: '1.5rem' }}>
            {hero.subtitle}
          </p>
        )}
        {hero.cta && (
          <a href={hero.cta.href || '#'}
            style={{ ...FS, fontSize: 14, fontWeight: 700, color: '#c8102e', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fff', padding: '8px 16px' }}>
            {hero.cta.label} <ChevronRight size={14} />
          </a>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: '#c8102e' }} />
    </div>
  );
}