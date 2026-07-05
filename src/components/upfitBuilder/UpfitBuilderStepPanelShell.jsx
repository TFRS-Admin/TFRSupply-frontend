/**
 * components/upfitBuilder/UpfitBuilderStepPanelShell.jsx
 * Shared panel chrome (heading, body, Back/Continue footer) for every guided
 * step — the 5 setup stages, the 12 category steps, and Review — so each
 * step component only supplies its own body content and next/back wiring.
 */
import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

export default function UpfitBuilderStepPanelShell({
  title, description, children, onBack, onNext, nextLabel = 'Continue', nextDisabled = false, extraActions,
}) {
  return (
    <div
      className="upfit-builder-step-panel"
      data-testid="upfit-builder-step-panel"
      style={{ ...FS, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '20px 22px', flex: 1, minWidth: 0 }}
    >
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a2744', margin: '0 0 6px' }}>{title}</h2>
      {description && <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, margin: '0 0 18px', maxWidth: 560 }}>{description}</p>}

      <div style={{ marginBottom: 22 }}>{children}</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', borderTop: '1px solid #eee', paddingTop: 16 }}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={{ ...FS, fontSize: 13, fontWeight: 700, color: '#1a2744', background: 'none', border: '2px solid #1a2744', padding: '10px 16px', minHeight: 44, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={14} /> Back
          </button>
        )}
        <div style={{ flex: 1 }} />
        {extraActions}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            style={{
              ...FS, fontSize: 13, fontWeight: 700, color: '#fff', background: nextDisabled ? '#e5b3bd' : '#c8102e',
              border: 'none', padding: '12px 18px', minHeight: 44, cursor: nextDisabled ? 'not-allowed' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            {nextLabel} <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
