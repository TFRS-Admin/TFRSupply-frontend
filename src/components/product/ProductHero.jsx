import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, MessageSquare, Settings, BookOpen, CheckCircle2 } from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

// ── Image Gallery ─────────────────────────────────────────────────────────────
function ImageGallery({ images = [] }) {
  const [active, setActive] = useState(0);
  if (!images.length) return null;
  const prev = () => setActive(i => (i - 1 + images.length) % images.length);
  const next = () => setActive(i => (i + 1) % images.length);

  return (
    <div className="flex flex-col gap-3">
      <div className="product-hero-gallery-main relative bg-white border border-gray-200 overflow-hidden flex items-center justify-center" style={{ minHeight: 400 }}>
        <img
          src={images[active].src}
          alt={images[active].alt}
          className="max-w-full max-h-[420px] object-contain"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'; }}
        />
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition-all"
            >
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition-all"
            >
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          </>
        )}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2" style={{ ...FS, fontSize: 11, fontWeight: 600, color: '#666', background: 'rgba(255,255,255,0.9)', padding: '2px 8px' }}>
            {active + 1} / {images.length}
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              className={`flex-shrink-0 w-20 h-16 overflow-hidden bg-white border transition-all flex items-center justify-center ${
                i === active ? 'opacity-100 border-[#c8102e]' : 'opacity-60 hover:opacity-90 border-gray-200'
              }`}
            >
              <img src={img.src} alt={img.alt} className="max-w-full max-h-full object-contain"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=60'; }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Product Hero ──────────────────────────────────────────────────────────────
export default function ProductHero({ title, subtitle, bullets = [], images = [], actions = {}, tabs = [], actionLabels = {}, infoPanel = null }) {
  const { whereToBuyUrl = '#', requestInfoUrl = '#', configuratorUrl = '#', manualUrl = '#' } = actions;
  const { configurator = 'Configure\nLightbar', manual = 'Manual' } = actionLabels;

  return (
    <div className="max-w-7xl mx-auto px-4 pt-8 pb-10">
      <h1 style={{ ...FS, fontSize: 'clamp(1.6rem,5vw,2.25rem)', fontWeight: 800, color: '#1a1a1a', lineHeight: 1.15, letterSpacing: '-0.01em', marginBottom: '1.5rem' }}>
        {title}
      </h1>

      <div className="product-hero-row" style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
        {/* Left — 60% */}
        <div className="product-hero-media" style={{ flex: '0 0 60%', maxWidth: '60%' }}>
          <ImageGallery images={images} />
        </div>

        {/* Right — 40% */}
        <div className="product-hero-info" style={{ flex: '0 0 40%', maxWidth: '40%' }}>
          {subtitle && <p style={{ ...FS, fontSize: 15, color: '#4b4b4b', lineHeight: 1.65, marginBottom: '1.25rem' }}>{subtitle}</p>}

          {infoPanel}

          {/* Bullets */}
          {bullets.length > 0 && (
            <ul style={{ ...FS, listStyle: 'none', padding: 0, marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {bullets.map((b, i) => (
                <li key={i} style={{ fontSize: '14px', color: '#333', lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <CheckCircle2 size={16} style={{ color: '#c8102e', flexShrink: 0, marginTop: 2 }} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Primary text-icon links */}
          <div className="product-hero-quick-links" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {[
              { href: whereToBuyUrl, icon: <MapPin size={14} />, label: 'Where to Buy' },
              { href: requestInfoUrl, icon: <MessageSquare size={14} />, label: 'Request Information' },
            ].map(({ href, icon, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                style={{
                  ...FS, fontWeight: 700, fontSize: '13px', color: '#c8102e', textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: '6px', minHeight: 40,
                  padding: '8px 14px', border: '1px solid #f0d3d8', background: '#fdf5f6',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fbe9eb'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fdf5f6'; }}
              >{icon} {label}</a>
            ))}
          </div>

          {/* Icon-above-label secondary links */}
          <div style={{ display: 'flex', gap: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e5e5e5', marginBottom: '1.5rem' }}>
            {[
              { href: configuratorUrl, icon: <Settings size={24} />, label: configurator },
              { href: manualUrl, icon: <BookOpen size={24} />, label: manual },
            ].map(({ href, icon, label }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="group"
                style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textAlign: 'center', minWidth: 56 }}
              >
                <div className="w-14 h-14 flex items-center justify-center bg-gray-100 group-hover:bg-gray-200 transition-colors">
                  <span className="text-gray-600 group-hover:text-[#c8102e] transition-colors">{icon}</span>
                </div>
                <span style={{ ...FS, fontSize: '11px', fontWeight: 700, color: '#3d3d3d', lineHeight: 1.3, whiteSpace: 'pre-line', textAlign: 'center' }}>{label}</span>
              </a>
            ))}
          </div>

          {/* Quick-jump anchor nav */}
          {tabs.length > 0 && (
            <div style={{ display: 'flex', borderTop: '1px solid #e5e5e5', paddingTop: '1rem', flexWrap: 'wrap', alignItems: 'center', rowGap: '0.5rem' }}>
              {tabs.map((tab, i) => (
                <React.Fragment key={tab.href}>
                  <a href={tab.href}
                    style={{ ...FS, fontSize: '13px', color: '#c8102e', fontWeight: 600, textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                  >{tab.label}</a>
                  {i < tabs.length - 1 && <span style={{ color: '#ccc', margin: '0 10px' }}>|</span>}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}