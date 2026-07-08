import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, MessageSquare, Settings, BookOpen, Check } from 'lucide-react';

const FS = { fontFamily: "'Inter',sans-serif" };

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
export default function ProductHero({ title, subtitle, description, bullets = [], images = [], actions = {}, tabs = [], actionLabels = {}, infoPanel = null }) {
  const { whereToBuyUrl = '#', requestInfoUrl = '#', configuratorUrl = '#', manualUrl = '#' } = actions;
  const { configurator = 'Configure\nLightbar', manual = 'Manual' } = actionLabels;
  const hasIntro = Boolean(subtitle || (description && description !== subtitle));

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6 pb-8">
      <h1
        className="font-heading font-bold uppercase text-[#0f0f0f] mb-5"
        style={{ fontSize: 'clamp(1.6rem,5vw,2.25rem)', lineHeight: 1.15, letterSpacing: '-0.01em' }}
      >
        {title}
      </h1>

      <div className="product-hero-row flex items-start gap-10 lg:gap-12">
        {/* Left — 60% */}
        <div className="product-hero-media" style={{ flex: '0 0 60%', maxWidth: '60%' }}>
          <ImageGallery images={images} />
        </div>

        {/* Right — 40% */}
        <div className="product-hero-info flex flex-col gap-6" style={{ flex: '0 0 40%', maxWidth: '40%' }}>
          {/* Intro copy — subtitle leads, description (if distinct) adds supporting detail */}
          {hasIntro && (
            <div className="flex flex-col gap-2">
              {subtitle && (
                <p style={FS} className="text-[15px] leading-relaxed text-gray-700">{subtitle}</p>
              )}
              {description && description !== subtitle && (
                <p style={FS} className="text-[13px] leading-relaxed text-gray-500">{description}</p>
              )}
            </div>
          )}

          {infoPanel}

          {/* Bullets — premium feature list */}
          {bullets.length > 0 && (
            <div>
              <div className="mb-2.5 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <h2 className="font-heading text-[11px] font-bold uppercase tracking-wider text-gray-500">Key Features</h2>
              </div>
              <ul className="flex flex-col gap-2">
                {bullets.map((b, i) => {
                  const accent = i % 2 === 0
                    ? { bg: 'bg-[#c8102e]/10', text: 'text-[#c8102e]' }
                    : { bg: 'bg-amber-600/10', text: 'text-amber-600' };
                  return (
                    <li key={i} style={FS} className="flex items-start gap-2.5 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-[13.5px] leading-snug text-gray-700">
                      <span className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${accent.bg}`}>
                        <Check size={12} strokeWidth={3} className={accent.text} />
                      </span>
                      <span>{b}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Primary text-icon links */}
          <div className="product-hero-quick-links flex flex-wrap gap-3">
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
          <div className="flex gap-6 border-t border-gray-200 pt-4">
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
            <div className="flex flex-wrap items-center border-t border-gray-200 pt-3" style={{ rowGap: '0.5rem' }}>
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