/**
 * components/upfitBuilder/UpfitBuilderStepperSidebar.jsx
 * Desktop stepper — every guided-flow step (5 setup stages, 12 upfit
 * categories, Review) with a status icon and tier badge, clickable to jump
 * directly to any step (this feature never hard-gates navigation). Desktop
 * only (`hidden lg:block`); UpfitBuilderMobileProgress covers small screens.
 */
import React from 'react';
import { CheckCircle2, Circle, MinusCircle } from 'lucide-react';
import { StandardTierChip } from '@/components/departmentStandards/DepartmentStandardBadge';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const STATUS_ICON = {
  complete: <CheckCircle2 size={16} color="#16a34a" />,
  skipped: <MinusCircle size={16} color="#999" />,
  missing: <Circle size={16} color="#ccc" />,
  upcoming: <Circle size={16} color="#ccc" />,
};

export default function UpfitBuilderStepperSidebar({ items, currentStepId, onGoToStep }) {
  return (
    <nav
      className="hidden lg:block"
      aria-label="Guided upfit builder steps"
      data-testid="upfit-builder-stepper-sidebar"
      style={{ ...FS, width: 240, flexShrink: 0 }}
    >
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#999', margin: '0 0 12px' }}>
        Guided Steps
      </p>
      <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((item) => {
          const isCurrent = item.stepId === currentStepId;
          return (
            <li key={item.stepId}>
              <button
                type="button"
                onClick={() => onGoToStep(item.stepId)}
                aria-current={isCurrent ? 'step' : undefined}
                style={{
                  ...FS, width: '100%', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left',
                  padding: '9px 10px', marginBottom: 2, border: 'none', borderRadius: 2, cursor: 'pointer',
                  background: isCurrent ? '#eef1f8' : 'transparent',
                  color: isCurrent ? '#1a2744' : '#444', fontWeight: isCurrent ? 700 : 500, fontSize: 13,
                }}
              >
                {STATUS_ICON[item.status] ?? STATUS_ICON.missing}
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.tier && item.tier !== 'optional' && <StandardTierChip tier={item.tier} compact />}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
