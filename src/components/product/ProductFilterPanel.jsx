import React from 'react';

/**
 * Reusable filter sidebar for product discovery. Each group is
 * single-select (matching the existing CategoryTemplate filter UX) with an
 * "All" option and a reset-all action.
 */
export default function ProductFilterPanel({ groups = [], active = {}, onChange, onReset }) {
  const hasActive = Object.values(active).some(Boolean);

  return (
    <div className="pd-filter-panel" style={{ width: 220, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', margin: 0 }}>Filter By</p>
        {hasActive && (
          <button onClick={onReset} style={{ fontSize: 11, color: '#c8102e', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
            Reset All
          </button>
        )}
      </div>
      {groups.map((group) => (
        <div key={group.id} style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', marginBottom: '0.4rem' }}>{group.label}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button
              onClick={() => onChange(group.id, null)}
              style={{ textAlign: 'left', fontSize: 13, color: !active[group.id] ? '#c8102e' : '#555', fontWeight: !active[group.id] ? 700 : 400, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}>
              All
            </button>
            {group.options.map((option) => {
              const value = typeof option === 'string' ? option : option.value;
              const label = typeof option === 'string' ? option : option.label;
              return (
                <button key={value}
                  onClick={() => onChange(group.id, value)}
                  style={{ textAlign: 'left', fontSize: 13, color: active[group.id] === value ? '#c8102e' : '#555', fontWeight: active[group.id] === value ? 700 : 400, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
