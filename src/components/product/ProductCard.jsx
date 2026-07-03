import React from 'react';
import { Link } from 'react-router-dom';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

/**
 * Shared product discovery card. Accepts a display-ready view model rather
 * than a raw Product/CategoryProductCard so it can render results from both
 * catalogService.searchProducts() and the denormalized category product
 * cards without either caller reshaping its data to match the other.
 */
export default function ProductCard({ id, href, label, image, imageAlt, tagline, specs = [], badges = [] }) {
  const content = (
    <div className="border border-gray-200 overflow-hidden h-full flex flex-col bg-white"
      style={{ transition: 'border-color 0.15s' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c8102e'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}>
      {image && <img src={image} alt={imageAlt || label} className="w-full object-cover" style={{ height: 180 }} />}
      <div className="p-4 flex flex-col flex-1" style={FS}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>{label}</p>
        {tagline && <p style={{ fontSize: 12, color: '#c8102e', fontStyle: 'italic', marginBottom: 6 }}>{tagline}</p>}
        {specs.length > 0 && (
          <ul style={{ fontSize: 12, color: '#777', paddingLeft: '1rem', flex: 1 }}>
            {specs.map((spec) => <li key={spec}>{spec}</li>)}
          </ul>
        )}
        {badges.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
            {badges.map((badge) => (
              <span key={badge} style={{ fontSize: 10, fontWeight: 700, background: '#f0f4ff', color: '#1a2744', padding: '2px 6px', letterSpacing: '0.05em' }}>{badge}</span>
            ))}
          </div>
        )}
        <p style={{ fontSize: 12, fontWeight: 700, color: '#c8102e', marginTop: '0.75rem', letterSpacing: '0.04em' }}>
          {href ? 'VIEW DETAILS' : 'DETAILS COMING SOON'}
        </p>
      </div>
    </div>
  );

  if (!href) {
    return <div key={id} style={{ opacity: 0.85, cursor: 'default' }}>{content}</div>;
  }

  return (
    <Link key={id} to={href} style={{ textDecoration: 'none', color: 'inherit' }}>
      {content}
    </Link>
  );
}
