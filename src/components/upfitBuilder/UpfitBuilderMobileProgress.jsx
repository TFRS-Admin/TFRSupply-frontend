/**
 * components/upfitBuilder/UpfitBuilderMobileProgress.jsx
 * Mobile-only sticky progress summary — current step label, position in the
 * sequence, and an overall completion bar. Replaces the desktop stepper
 * sidebar on small screens (`lg:hidden`) so the guided flow stays a single
 * column with no horizontal overflow.
 */
import React from 'react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

export default function UpfitBuilderMobileProgress({ stepLabel, stepNumber, stepCount, percent }) {
  return (
    <div
      className="lg:hidden"
      data-testid="upfit-builder-mobile-progress"
      style={{
        ...FS, position: 'sticky', top: 0, zIndex: 5, background: '#fff', borderBottom: '1px solid #e5e7eb',
        padding: '10px 16px', marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#1a2744', margin: 0 }}>
          Step {stepNumber} of {stepCount}: {stepLabel}
        </p>
        <span style={{ fontSize: 11, color: '#666' }}>{percent}%</span>
      </div>
      <div style={{ height: 6, background: '#eee', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${percent}%`, height: '100%', background: '#c8102e' }} />
      </div>
    </div>
  );
}
