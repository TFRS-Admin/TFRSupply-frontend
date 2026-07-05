/**
 * components/fleetQuote/MissingEquipmentReportSection.jsx
 * "Missing Equipment Report" — Critical/Recommended/Optional tier lists, plus
 * the same entries regrouped by Vehicle, Department Standard, or Category
 * (a toggle, not three simultaneous lists) — see
 * src/domain/fleetQuote/missingEquipmentReport.ts.
 */
import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import SectionHeading from '@/components/product/SectionHeading';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const TIER_STYLE = {
  critical: { label: 'Critical Missing Equipment', color: '#b91c1c', bg: '#fee2e2' },
  recommended: { label: 'Recommended Equipment', color: '#92400e', bg: '#fef3c7' },
  optional: { label: 'Optional Equipment', color: '#1a2744', bg: '#eef1f8' },
};

const TIER_CHIP_STYLE = {
  required: { color: '#b91c1c', bg: '#fee2e2' },
  recommended: { color: '#92400e', bg: '#fef3c7' },
  optional: { color: '#1a2744', bg: '#eef1f8' },
};

const GROUP_MODES = [
  { key: 'byVehicle', label: 'By Vehicle' },
  { key: 'byDepartmentStandard', label: 'By Department Standard' },
  { key: 'byCategory', label: 'By Category' },
];

function TierList({ tierKey, entries }) {
  const style = TIER_STYLE[tierKey];
  return (
    <div data-testid={`missing-equipment-tier-${tierKey}`}>
      <p style={{ ...FS, fontSize: 13, fontWeight: 700, color: style.color, margin: '0 0 8px' }}>{`${style.label} (${entries.length})`}</p>
      {entries.length === 0 ? (
        <p style={{ ...FS, fontSize: 13, color: '#888', margin: 0 }}>Nothing outstanding.</p>
      ) : (
        <ul style={{ ...FS, margin: 0, padding: '0 0 0 18px', fontSize: 13, lineHeight: 1.8, color: '#444' }}>
          {entries.map((entry, index) => (
            <li key={`${entry.buildId}-${entry.categoryId}-${index}`}>{entry.categoryLabel} — {entry.buildName}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function MissingEquipmentReportSection({ report }) {
  const [groupMode, setGroupMode] = useState('byVehicle');
  const groups = report[groupMode];
  const groupKeys = Object.keys(groups);

  return (
    <section style={{ marginBottom: 32 }} data-testid="missing-equipment-report-section">
      <SectionHeading icon={AlertTriangle}>Missing Equipment Report</SectionHeading>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '18px 20px', marginBottom: 16 }}>
        <div className="missing-equipment-tier-grid grid grid-cols-1 md:grid-cols-3 gap-6">
          <TierList tierKey="critical" entries={report.critical} />
          <TierList tierKey="recommended" entries={report.recommended} />
          <TierList tierKey="optional" entries={report.optional} />
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '18px 20px' }} data-testid="missing-equipment-grouped">
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          {GROUP_MODES.map((mode) => (
            <button
              key={mode.key}
              type="button"
              onClick={() => setGroupMode(mode.key)}
              data-testid={`missing-equipment-group-tab-${mode.key}`}
              style={{
                ...FS, fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 999, cursor: 'pointer', minHeight: 32,
                border: groupMode === mode.key ? '1.5px solid #1a2744' : '1.5px solid #e5e7eb',
                background: groupMode === mode.key ? '#1a2744' : '#fff',
                color: groupMode === mode.key ? '#fff' : '#1a2744',
              }}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {groupKeys.length === 0 ? (
          <p style={{ ...FS, fontSize: 13, color: '#888', margin: 0 }}>Nothing missing across this project.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {groupKeys.map((key) => (
              <div key={key}>
                <p style={{ ...FS, fontSize: 12, fontWeight: 700, color: '#1a2744', margin: '0 0 6px' }}>{key}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {groups[key].map((entry, index) => {
                    const chipStyle = TIER_CHIP_STYLE[entry.tier] ?? TIER_CHIP_STYLE.optional;
                    return (
                      <span key={`${key}-${index}`} style={{ fontSize: 12, padding: '3px 9px', borderRadius: 999, background: chipStyle.bg, color: chipStyle.color }}>
                        {entry.categoryLabel}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
