/**
 * components/configurator/ConfigurationSummary.jsx
 * Displays the current configuration state: steps, selections,
 * dependencies, warnings, SKU preview, and completion.
 */

import React from 'react';
import { useConfiguration } from '@/context/ConfigurationContext';
import { AlertTriangle, XCircle, CheckCircle, ChevronRight, RotateCcw, Percent } from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

// ─── Step Selector ─────────────────────────────────────────────────────────

function StepSelector({ step }) {
  const { selections, selectOption } = useConfiguration();
  const val = selections[step.id];
  const selected = Array.isArray(val) ? val : val ? [val] : [];

  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1a2744', marginBottom: 8 }}>
        {step.label}
        {step.required && <span style={{ color: '#c8102e', marginLeft: 4 }}>*</span>}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {step.options.map(opt => {
          const isSelected = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => selectOption(step.id, opt.id)}
              title={opt.description || undefined}
              style={{
                ...FS,
                fontSize: 12,
                padding: '6px 12px',
                border: `2px solid ${isSelected ? '#c8102e' : '#d0d0d0'}`,
                background: isSelected ? '#c8102e' : '#fff',
                color: isSelected ? '#fff' : '#333',
                cursor: 'pointer',
                fontWeight: isSelected ? 700 : 400,
                transition: 'all 0.12s',
              }}
            >
              {opt.label}
              {opt.priceModifier > 0 && (
                <span style={{ marginLeft: 4, opacity: 0.75, fontSize: 11 }}>+${opt.priceModifier}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Summary ──────────────────────────────────────────────────────────

export default function ConfigurationSummary() {
  const { session, summary, resetConfiguration } = useConfiguration();

  if (!session || !summary) return null;

  const { resolvedSelections, depRequirements, violations, completion, skuPreview, priceDisplay, isComplete } = summary;

  const hardViolations = violations.filter(v => v.type === 'excludes');
  const softWarnings   = violations.filter(v => v.type === 'warns');

  return (
    <div style={{ ...FS, border: '1px solid #e8e8e8', background: '#fff' }}>
      {/* Header */}
      <div style={{ background: '#1a2744', color: '#fff', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Product Configurator
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>{session.label}</p>
        </div>
        <button
          onClick={resetConfiguration}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', cursor: 'pointer', padding: '5px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}
        >
          <RotateCcw size={11} /> Reset
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: '#f0f0f0' }}>
        <div style={{ height: '100%', width: `${completion}%`, background: completion === 100 ? '#16a34a' : '#c8102e', transition: 'width 0.3s' }} />
      </div>

      <div style={{ padding: '20px' }}>
        {/* Step selectors */}
        {session.steps.map(step => (
          <StepSelector key={step.id} step={step} />
        ))}

        {/* Dependency notices */}
        {depRequirements.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {depRequirements.map(dep => (
              <div key={dep.ruleId} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', marginBottom: 6 }}>
                <ChevronRight size={14} style={{ color: '#1d4ed8', flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: '#1e40af', margin: 0 }}>{dep.message || `Step "${dep.stepId}" is now required.`}</p>
              </div>
            ))}
          </div>
        )}

        {/* Hard violations */}
        {hardViolations.map(v => (
          <div key={v.ruleId} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', marginBottom: 6 }}>
            <XCircle size={14} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: '#991b1b', margin: 0 }}>{v.message}</p>
          </div>
        ))}

        {/* Soft warnings */}
        {softWarnings.map(v => (
          <div key={v.ruleId} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', background: '#fffbeb', border: '1px solid #fde68a', marginBottom: 6 }}>
            <AlertTriangle size={14} style={{ color: '#d97706', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: '#92400e', margin: 0 }}>{v.message}</p>
          </div>
        ))}

        {/* Summary box */}
        <div style={{ marginTop: 20, borderTop: '2px solid #1a2744', paddingTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1a2744' }}>Your Configuration</p>
            <span style={{ fontSize: 11, fontWeight: 700, color: completion === 100 ? '#16a34a' : '#c8102e', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Percent size={11} /> {completion}% Complete
            </span>
          </div>

          {resolvedSelections.length === 0 && (
            <p style={{ fontSize: 12, color: '#888', fontStyle: 'italic' }}>No selections made yet.</p>
          )}

          {resolvedSelections.map(sel => (
            <div key={sel.stepId} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f0f0', fontSize: 12 }}>
              <span style={{ color: '#666' }}>{sel.stepLabel}</span>
              <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{sel.selected.join(', ')}</span>
            </div>
          ))}

          {/* SKU Preview */}
          {skuPreview && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: '#f7f8fa', border: '1px solid #e0e0e0' }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, color: '#888', letterSpacing: '0.06em', textTransform: 'uppercase' }}>SKU Preview</p>
              <p style={{ margin: 0, fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#1a2744' }}>{skuPreview}</p>
              <p style={{ margin: '4px 0 0', fontSize: 10, color: '#aaa', fontStyle: 'italic' }}>Prototype — not a production SKU</p>
            </div>
          )}

          {/* Price */}
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#666' }}>Pricing</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1a2744' }}>{priceDisplay}</span>
          </div>

          {/* Completion status */}
          {isComplete ? (
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <CheckCircle size={15} style={{ color: '#16a34a' }} />
              <p style={{ margin: 0, fontSize: 12, color: '#15803d', fontWeight: 600 }}>Configuration complete — ready to request a quote.</p>
            </div>
          ) : (
            <p style={{ marginTop: 12, fontSize: 11, color: '#888', fontStyle: 'italic' }}>
              Complete all required fields (*) to generate your final configuration.
            </p>
          )}
        </div>
      </div>

      {/* Prototype watermark */}
      <div style={{ borderTop: '1px solid #f0f0f0', padding: '8px 20px', background: '#fafafa' }}>
        <p style={{ margin: 0, fontSize: 10, color: '#bbb', letterSpacing: '0.04em' }}>
          ⚠ PROTOTYPE CONFIGURATOR — Data and SKUs are illustrative only
        </p>
      </div>
    </div>
  );
}