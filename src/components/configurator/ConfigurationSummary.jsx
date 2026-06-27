/**
 * components/configurator/ConfigurationSummary.jsx
 * Displays configurator state: step buttons, dependency notices,
 * exclusion/warning banners, accessories, SKU preview, completion gating.
 */

import React from 'react';
import { useConfiguration } from '@/context/ConfigurationContext';
import { AlertTriangle, XCircle, CheckCircle, ChevronRight, RotateCcw, Percent, Package, FlaskConical } from 'lucide-react';
import { useVehicle } from '@/context/VehicleContext';
import { getRecommendedLengths } from '@/data/vehicleLengthMap';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

// ─── Length Recommendation Callout ────────────────────────────────────────

function LengthRecommendationCallout({ step, recommendedSegments, onUseRecommended }) {
  if (!recommendedSegments || recommendedSegments.length === 0) return null;

  const recommended = step.options.filter(o => recommendedSegments.includes(o.skuSegment));
  if (recommended.length === 0) return null;

  const primaryLabel = recommended[0].label;
  const alsoCompatible = recommended.slice(1);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
      padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0',
      marginBottom: 8,
    }}>
      <div style={{ fontSize: 11, color: '#15803d' }}>
        <strong>Recommended for your vehicle:</strong> {primaryLabel}
        {alsoCompatible.length > 0 && (
          <span style={{ color: '#166534' }}> · also fits {alsoCompatible.map(o => o.label).join(', ')}</span>
        )}
      </div>
      <button
        onClick={onUseRecommended}
        style={{
          ...FS,
          fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
          padding: '4px 10px', cursor: 'pointer',
          background: '#16a34a', color: '#fff',
          border: 'none',
        }}
      >
        Use {primaryLabel}
      </button>
    </div>
  );
}

// ─── Step Selector ─────────────────────────────────────────────────────────

function StepSelector({ step, recommendedSegments = [] }) {
  const { selections, selectOption } = useConfiguration();
  const val = selections[step.id];
  const selected = Array.isArray(val) ? val : val ? [val] : [];
  const hasRecommendations = recommendedSegments.length > 0;
  const lengthNotYetSelected = step.id === 'length' && selected.length === 0;

  // Find the first recommended option id to select on one-click
  const firstRecommendedOpt = step.options.find(o => recommendedSegments.includes(o.skuSegment));

  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1a2744', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        {step.label}
        {step.required && <span style={{ color: '#c8102e' }}>*</span>}
        {step.multiple && <span style={{ fontSize: 10, fontWeight: 400, color: '#888', letterSpacing: '0.04em', textTransform: 'none' }}>(select all that apply)</span>}
      </p>
      {lengthNotYetSelected && hasRecommendations && firstRecommendedOpt && (
        <LengthRecommendationCallout
          step={step}
          recommendedSegments={recommendedSegments}
          onUseRecommended={() => selectOption(step.id, firstRecommendedOpt.id)}
        />
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {step.options.map(opt => {
          const isSelected = selected.includes(opt.id);
          const isRecommended = hasRecommendations && recommendedSegments.includes(opt.skuSegment);
          return (
            <div key={opt.id} style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <button
                onClick={() => selectOption(step.id, opt.id)}
                title={opt.description || undefined}
                style={{
                  ...FS,
                  fontSize: 12,
                  padding: '6px 12px',
                  border: `2px solid ${isSelected ? '#c8102e' : isRecommended ? '#16a34a' : '#d0d0d0'}`,
                  background: isSelected ? '#c8102e' : isRecommended ? '#f0fdf4' : '#fff',
                  color: isSelected ? '#fff' : '#333',
                  cursor: 'pointer',
                  fontWeight: isSelected ? 700 : 400,
                  transition: 'all 0.12s',
                }}
              >
                {opt.label}
                {opt.priceModifier > 0 && (
                  <span style={{ marginLeft: 4, opacity: 0.8, fontSize: 11 }}>+${opt.priceModifier}</span>
                )}
              </button>
              {isRecommended && !isSelected && (
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: '#15803d', background: '#dcfce7', border: '1px solid #bbf7d0',
                  padding: '1px 5px', lineHeight: 1.4,
                }}>
                  ✓ Fits
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Dependency Notice ─────────────────────────────────────────────────────

function DependencyNotice({ dep }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', marginBottom: 6 }}>
      <ChevronRight size={14} style={{ color: '#1d4ed8', flexShrink: 0, marginTop: 1 }} />
      <div>
        <p style={{ fontSize: 12, color: '#1e40af', margin: '0 0 2px', fontWeight: 600 }}>
          Required by your "{dep.triggerLabel}" selection
        </p>
        <p style={{ fontSize: 12, color: '#1e40af', margin: 0 }}>
          {dep.message || `"${dep.targetStepLabel}" is now required.`}
        </p>
      </div>
    </div>
  );
}

// ─── Hard Exclusion Notice ─────────────────────────────────────────────────

function ExclusionNotice({ v }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', marginBottom: 6 }}>
      <XCircle size={14} style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }} />
      <div>
        <p style={{ fontSize: 12, color: '#991b1b', margin: '0 0 2px', fontWeight: 700 }}>
          Incompatible: "{v.optionALabel}" + "{v.optionBLabel}"
        </p>
        <p style={{ fontSize: 12, color: '#991b1b', margin: 0 }}>{v.message}</p>
      </div>
    </div>
  );
}

// ─── SKU Attribute Verification Notice ────────────────────────────────────

function SkuVerificationNotice({ unverifiedSteps }) {
  if (!unverifiedSteps || unverifiedSteps.length === 0) return null;
  const labels = unverifiedSteps.map(s => s.stepLabel).join(', ');
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '8px 12px', background: '#f0f9ff', border: '1px solid #bae6fd', marginTop: 6 }}>
      <FlaskConical size={13} style={{ color: '#0284c7', flexShrink: 0, marginTop: 1 }} />
      <p style={{ fontSize: 11, color: '#0369a1', margin: 0 }}>
        <strong>Unverified attribute{unverifiedSteps.length > 1 ? 's' : ''}:</strong> {labels} — inferred from Shopify export, not confirmed against real option names. SKU match may shift once verified.
      </p>
    </div>
  );
}

// ─── Soft Warning Notice ───────────────────────────────────────────────────

function WarningNotice({ v }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', background: '#fffbeb', border: '1px solid #fde68a', marginBottom: 6 }}>
      <AlertTriangle size={14} style={{ color: '#d97706', flexShrink: 0, marginTop: 1 }} />
      <div>
        <p style={{ fontSize: 12, color: '#92400e', margin: '0 0 2px', fontWeight: 600 }}>
          Advisory: "{v.optionALabel}" + "{v.optionBLabel}"
        </p>
        <p style={{ fontSize: 12, color: '#92400e', margin: 0 }}>{v.message}</p>
      </div>
    </div>
  );
}

// ─── Completion Gate ───────────────────────────────────────────────────────

function CompletionGate({ isComplete, pendingSteps, hardViolations }) {
  if (isComplete) {
    return (
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
        <CheckCircle size={15} style={{ color: '#16a34a' }} />
        <p style={{ margin: 0, fontSize: 12, color: '#15803d', fontWeight: 600 }}>
          Configuration complete — all required steps filled, no conflicts.
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 14, padding: '10px 14px', background: '#fafafa', border: '1px solid #e8e8e8' }}>
      {hardViolations.length > 0 && (
        <p style={{ margin: '0 0 6px', fontSize: 12, color: '#dc2626', fontWeight: 600 }}>
          ✕ Resolve {hardViolations.length} incompatibility conflict{hardViolations.length > 1 ? 's' : ''} above before continuing.
        </p>
      )}
      {pendingSteps.length > 0 && (
        <>
          <p style={{ margin: '0 0 4px', fontSize: 11, color: '#666' }}>Required steps remaining:</p>
          <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
            {pendingSteps.map(step => (
              <li key={step.id} style={{ fontSize: 12, color: '#c8102e', fontWeight: 600, marginBottom: 2 }}>
                {step.label}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// ─── Main Summary ──────────────────────────────────────────────────────────

export default function ConfigurationSummary() {
  const { session, summary, resetConfiguration } = useConfiguration();
  const { selectedVehicle } = useVehicle();
  const recommendedLengths = getRecommendedLengths(selectedVehicle);

  if (!session || !summary) return null;

  const {
    resolvedSelections,
    accessories,
    depRequirements,
    violations,
    completion,
    selectedSku,
    matchingSkus,
    skuStatus,
    unverifiedSteps,
    priceDisplay,
    isComplete,
    pendingSteps,
  } = summary;

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
        <div style={{
          height: '100%',
          width: `${completion}%`,
          background: isComplete ? '#16a34a' : hardViolations.length > 0 ? '#dc2626' : '#c8102e',
          transition: 'width 0.3s',
        }} />
      </div>

      <div style={{ padding: '20px' }}>
        {/* Step selectors */}
        {session.steps.map(step => (
          <StepSelector
            key={step.id}
            step={step}
            recommendedSegments={step.id === 'length' ? recommendedLengths : []}
          />
        ))}

        {/* Dependency notices — shown after step inputs */}
        {depRequirements.map(dep => (
          <DependencyNotice key={dep.ruleId} dep={dep} />
        ))}

        {/* Hard exclusions */}
        {hardViolations.map(v => (
          <ExclusionNotice key={v.ruleId} v={v} />
        ))}

        {/* Soft warnings */}
        {softWarnings.map(v => (
          <WarningNotice key={v.ruleId} v={v} />
        ))}

        {/* Summary box */}
        <div style={{ marginTop: 24, borderTop: '2px solid #1a2744', paddingTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1a2744' }}>
              Your Configuration
            </p>
            <span style={{ fontSize: 11, fontWeight: 700, color: isComplete ? '#16a34a' : hardViolations.length > 0 ? '#dc2626' : '#c8102e', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Percent size={11} /> {completion}% Complete
            </span>
          </div>

          {resolvedSelections.length === 0 && accessories.length === 0 && (
            <p style={{ fontSize: 12, color: '#888', fontStyle: 'italic' }}>No selections made yet.</p>
          )}

          {/* Per-step single selections */}
          {resolvedSelections.map(sel => (
            <div key={sel.stepId} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f0f0f0', fontSize: 12 }}>
              <span style={{ color: '#666' }}>{sel.stepLabel}</span>
              <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{sel.selected.join(', ')}</span>
            </div>
          ))}

          {/* Accessories — multi-select, listed individually */}
          {accessories.length > 0 && (
            <div style={{ marginTop: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 0', borderBottom: '1px solid #f0f0f0' }}>
                <Package size={11} style={{ color: '#888', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#666', flexShrink: 0 }}>Accessories</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a', marginLeft: 'auto', textAlign: 'right' }}>
                  {accessories.map(a => a.optionLabel).join(' · ')}
                </span>
              </div>
            </div>
          )}

          {/* SKU Match */}
          {skuStatus && skuStatus !== 'none' && (
            <div style={{
              marginTop: 14, padding: '10px 14px',
              background: skuStatus === 'matched' ? '#f0fdf4' : '#fffbeb',
              border: `1px solid ${skuStatus === 'matched' ? '#bbf7d0' : '#fde68a'}`,
            }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, color: skuStatus === 'matched' ? '#15803d' : '#92400e', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {skuStatus === 'matched' ? 'Matching SKU' : 'Narrowing SKU'}
              </p>
              {skuStatus === 'matched' && selectedSku && (
                <p style={{ margin: 0, fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#1a2744' }}>{selectedSku}</p>
              )}
              {skuStatus === 'multiple' && (
                <p style={{ margin: 0, fontSize: 12, color: '#92400e' }}>
                  {matchingSkus.length} SKUs match current selections — complete remaining steps to resolve.
                </p>
              )}
              {accessories.length > 0 && (
                <p style={{ margin: '4px 0 0', fontFamily: 'monospace', fontSize: 11, color: '#888' }}>
                  +{accessories.map(a => a.optionLabel).join(', ')}
                </p>
              )}
              <SkuVerificationNotice unverifiedSteps={unverifiedSteps} />
            </div>
          )}
          {skuStatus === 'none' && resolvedSelections.length > 0 && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca' }}>
              <p style={{ margin: 0, fontSize: 12, color: '#991b1b', fontWeight: 600 }}>No matching SKU found for this combination.</p>
            </div>
          )}

          {/* Price */}
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#666' }}>Pricing</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1a2744' }}>{priceDisplay}</span>
          </div>

          {/* Completion gate */}
          <CompletionGate
            isComplete={isComplete}
            pendingSteps={pendingSteps}
            hardViolations={hardViolations}
          />
        </div>
      </div>

      {/* Prototype watermark */}
      <div style={{ borderTop: '1px solid #f0f0f0', padding: '8px 20px', background: '#fafafa' }}>
        <p style={{ margin: 0, fontSize: 10, color: '#bbb', letterSpacing: '0.04em' }}>
          ⚠ PROTOTYPE CONFIGURATOR — SKU list and data are illustrative only
        </p>
      </div>
    </div>
  );
}