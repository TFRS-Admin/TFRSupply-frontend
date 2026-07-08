import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, MessageSquare, Settings, BookOpen, Check } from 'lucide-react';

// ── Image Gallery ─────────────────────────────────────────────────────────────
function ImageGallery({ images = [] }) {
  const [active, setActive] = useState(0);
  if (!images.length) return null;
  const prev = () => setActive(i => (i - 1 + images.length) % images.length);
  const next = () => setActive(i => (i + 1) % images.length);

  return (
    <div className="flex flex-col gap-3">
      <div className="product-hero-gallery-main relative bg-white border border-gray-200 rounded-md overflow-hidden flex items-center justify-center" style={{ minHeight: 400 }}>
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
          <div className="absolute bottom-2 right-2 font-body text-[11px] font-semibold text-gray-600 bg-white/90 rounded-md px-2 py-0.5">
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
              className={`flex-shrink-0 w-20 h-16 overflow-hidden bg-white border rounded-md transition-all flex items-center justify-center ${
                i === active ? 'opacity-100 border-[#C8102E]' : 'opacity-60 hover:opacity-90 border-gray-200'
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
  const { configurator = 'Configure Lightbar', manual = 'Manual' } = actionLabels;
  const hasIntro = Boolean(subtitle || (description && description !== subtitle));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-heading uppercase font-extrabold tracking-tight text-[#0F0F0F] text-4xl leading-tight mb-4">
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
                <p className="font-body text-lg text-gray-600 mb-6 leading-relaxed">{subtitle}</p>
              )}
              {description && description !== subtitle && (
                <p className="font-body text-sm text-gray-500 leading-relaxed">{description}</p>
              )}
            </div>
          )}

          {infoPanel}

          {/* Bullets — Key Features list */}
          {bullets.length > 0 && (
            <div>
              <h2 className="font-heading text-xs font-bold uppercase tracking-wide text-gray-500 mb-2.5">Key Features</h2>
              <ul className="flex flex-col">
                {bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 rounded-md border border-gray-200 bg-gray-50 p-3 mb-2 font-body text-sm text-gray-700 leading-relaxed">
                    <Check size={16} strokeWidth={3} className="mt-0.5 flex-shrink-0 text-[#C8102E]" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Primary CTA */}
          <a
            href={configuratorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#C8102E] text-white font-heading uppercase font-bold rounded-md px-6 py-3 w-full text-center hover:bg-[#A50D25] transition-colors flex items-center justify-center gap-2"
          >
            <Settings size={16} /> {configurator}
          </a>

          {/* Secondary CTAs */}
          <div className="product-hero-quick-links flex flex-wrap gap-3">
            {[
              { href: manualUrl, icon: <BookOpen size={14} />, label: manual },
              { href: whereToBuyUrl, icon: <MapPin size={14} />, label: 'Where to Buy' },
              { href: requestInfoUrl, icon: <MessageSquare size={14} />, label: 'Request Info' },
            ].map(({ href, icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-gray-300 text-gray-700 font-heading uppercase font-bold text-xs rounded-md px-4 py-2 hover:border-[#C8102E] hover:text-[#C8102E] transition-colors flex items-center gap-2"
              >
                {icon} {label}
              </a>
            ))}
          </div>

          {/* Quick-jump anchor nav */}
          {tabs.length > 0 && (
            <div className="flex flex-wrap items-center border-t border-gray-200 pt-3" style={{ rowGap: '0.5rem' }}>
              {tabs.map((tab, i) => (
                <React.Fragment key={tab.href}>
                  <a href={tab.href} className="font-body text-sm text-[#C8102E] font-semibold hover:underline">
                    {tab.label}
                  </a>
                  {i < tabs.length - 1 && <span className="text-gray-300 mx-2.5">|</span>}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
