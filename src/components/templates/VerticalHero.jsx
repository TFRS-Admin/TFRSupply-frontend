import React from 'react';
import { ChevronRight } from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

export default function VerticalHero({ hero }) {
  if (!hero) return null;
  return (
    <div className="relative overflow-hidden" style={{ background: '#111', minHeight: 440 }}>
      {hero.image && (
        <img src={hero.image} alt={hero.imageAlt || ''} className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.55 }} />
      )}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(90deg, rgba(8,8,8,0.94) 0%, rgba(8,8,8,0.78) 36%, rgba(8,8,8,0.4) 68%, rgba(8,8,8,0.15) 100%)' }}
      />
      <div className="relative max-w-7xl mx-auto px-6 py-24 flex flex-col justify-center" style={{ minHeight: 440 }}>
        {hero.eyebrow && (
          <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
            <span style={{ width: 32, height: 3, background: '#c8102e', display: 'inline-block' }} />
            <span style={{ ...FS, fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#f5b942' }}>
              {hero.eyebrow}
            </span>
          </div>
        )}
        <h1 style={{ ...FS, fontSize: 'clamp(2.2rem,4.6vw,3.2rem)', fontWeight: 800, color: '#fff', lineHeight: 1.1, maxWidth: 620, marginBottom: '1.1rem', textShadow: '0 2px 14px rgba(0,0,0,0.5)' }}>
          {hero.title}
        </h1>
        {hero.subtitle && (
          <p style={{ ...FS, fontSize: 17, color: 'rgba(255,255,255,0.9)', maxWidth: 540, lineHeight: 1.65, marginBottom: '1.85rem', textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
            {hero.subtitle}
          </p>
        )}
        {hero.cta && (
          <a href={hero.cta.href || '#'} className="vlt-hero-cta"
            style={{ ...FS, fontSize: 14, fontWeight: 700, color: '#c8102e', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', padding: '13px 24px', width: 'fit-content' }}>
            {hero.cta.label} <ChevronRight size={15} />
          </a>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: '#c8102e' }} />
    </div>
  );
}
