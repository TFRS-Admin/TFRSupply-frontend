import React from 'react';

// Generic Fed Sig dense spec table — pass columns[] and rows[]
// columns: [{ key, label, mono? }]
// rows: [{ [key]: value }]

export default function FedSigSpecTable({ columns = [], rows = [], note }) {
  return (
    <div>
      <div className="overflow-x-auto" style={{ border: '1px solid #d8d8d8' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'Roboto','Inter',sans-serif", fontSize: 12, minWidth: columns.length * 120 }}>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={col.key} style={{
                  background: '#1a1a1a', color: '#ffffff', fontWeight: 700, fontSize: 11,
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
                style={{ background: ri % 2 === 0 ? '#ffffff' : '#f7f7f7' }}
                onMouseEnter={e => e.currentTarget.style.background = '#eef3fb'}
                onMouseLeave={e => e.currentTarget.style.background = ri % 2 === 0 ? '#ffffff' : '#f7f7f7'}
              >
                {columns.map((col, ci) => (
                  <td key={col.key} style={{
                    padding: '8px 12px',
                    color: col.mono || col.key === 'sku' ? '#c8102e' : '#3d3d3d',
                    fontFamily: col.mono ? "'JetBrains Mono', monospace" : "'Roboto','Inter',sans-serif",
                    fontWeight: col.mono ? 600 : 400,
                    borderBottom: '1px solid #e8e8e8',
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
        <p style={{ fontFamily: "'Roboto','Inter',sans-serif", fontSize: 11, color: '#888', marginTop: 10 }}>
          * {note}
        </p>
      )}
    </div>
  );
}