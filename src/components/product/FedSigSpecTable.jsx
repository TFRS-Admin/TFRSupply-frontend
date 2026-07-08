import React from 'react';

// Generic Fed Sig dense spec table — pass columns[] and rows[]
// columns: [{ key, label, mono? }]
// rows: [{ [key]: value }]

export default function FedSigSpecTable({ columns = [], rows = [], note }) {
  return (
    <div>
      <div className="overflow-x-auto rounded-md border border-gray-200">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Inter',sans-serif", fontSize: 12, minWidth: columns.length * 120 }}>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={col.key} className="font-heading" style={{
                  background: '#0f0f0f', color: '#ffffff', fontWeight: 700, fontSize: 11,
                  textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 12px',
                  textAlign: 'left', whiteSpace: 'nowrap',
                  borderRight: i < columns.length - 1 ? '1px solid #333' : 'none',
                }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}
                className="border-b border-gray-200 last:border-b-0"
                style={{ background: ri % 2 === 0 ? '#ffffff' : '#f9fafb' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fdf5f6'}
                onMouseLeave={e => e.currentTarget.style.background = ri % 2 === 0 ? '#ffffff' : '#f9fafb'}
              >
                {columns.map((col, ci) => (
                  <td key={col.key} className="border-gray-200" style={{
                    padding: '8px 12px',
                    color: col.mono || col.key === 'sku' ? '#c8102e' : '#3d3d3d',
                    fontFamily: col.mono ? "'JetBrains Mono', monospace" : "'Inter',sans-serif",
                    fontWeight: col.mono ? 600 : 400,
                    borderRight: ci < columns.length - 1 ? '1px solid #ececec' : 'none',
                    whiteSpace: ['approvals', 'opTemp', 'description'].includes(col.key) ? 'normal' : 'nowrap',
                    verticalAlign: 'top', lineHeight: 1.45,
                  }}>
                    {row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && (
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: '#888', marginTop: 10 }}>
          * {note}
        </p>
      )}
    </div>
  );
}