import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

/**
 * Image + title + description + primary CTA for a single nav vertical.
 * Presentation-only — the vertical's copy/image comes from
 * src/config/navigationVerticals.js, not fetched here.
 */
export default function NavigationImagePanel({ image, imageAlt, tagline, description, ctaLabel = 'Shop Now', ctaHref, comingSoon = false }) {
  return (
    <div className="flex flex-col h-full">
      <div className="relative overflow-hidden rounded-sm" style={{ aspectRatio: '4 / 3', background: '#f0f0f0' }}>
        <img
          src={image}
          alt={imageAlt || tagline}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {comingSoon && (
          <span
            className="absolute top-2 left-2"
            style={{ ...FS, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: '#1c1c1c', color: '#fff', padding: '3px 8px', borderRadius: 2 }}
          >
            Coming Soon
          </span>
        )}
      </div>

      <p style={{ ...FS, fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginTop: 14 }}>{tagline}</p>
      {description && (
        <p style={{ ...FS, fontSize: 13, color: '#666', lineHeight: 1.55, marginTop: 6 }}>{description}</p>
      )}

      {ctaHref && !comingSoon && (
        <Link
          to={ctaHref}
          className="inline-flex items-center gap-1.5 w-fit"
          style={{ ...FS, fontSize: 13, fontWeight: 700, color: '#c8102e', marginTop: 14, letterSpacing: '0.02em' }}
        >
          {ctaLabel}
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
