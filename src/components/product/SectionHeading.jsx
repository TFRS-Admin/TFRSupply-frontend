import React from 'react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

/**
 * Shared section title used across the product detail sections
 * (Fitment, Recommended Products, Related Packages, Specifications,
 * Configurator). Pulled out of each section so the eyebrow-label style
 * and spacing can't drift between sections that are meant to read as
 * one consistent page.
 */
export default function SectionHeading({ icon: Icon, children, description }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{
        ...FS, fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: '#1a2744', borderBottom: '2px solid #1a2744', paddingBottom: 8, margin: 0,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {Icon && <Icon size={14} />} {children}
      </p>
      {description && (
        <p style={{ ...FS, fontSize: 13, color: '#666', lineHeight: 1.6, marginTop: 8, marginBottom: 0 }}>{description}</p>
      )}
    </div>
  );
}
