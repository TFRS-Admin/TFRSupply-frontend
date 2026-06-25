import React from 'react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

export default function SectionLabel({ text }) {
  if (!text) return null;
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <p style={{ ...FS, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>{text}</p>
      <div style={{ width: 40, height: 3, background: '#c8102e' }} />
    </div>
  );
}