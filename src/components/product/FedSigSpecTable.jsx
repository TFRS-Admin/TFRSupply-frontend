import React from 'react';

// Generic Fed Sig dense spec table — pass columns[] and rows[]
// columns: [{ key, label, mono? }]
// rows: [{ [key]: value }]

export default function FedSigSpecTable({ columns = [], rows = [], note }) {
  return (
    <div>
      <div className="overflow-x-auto rounded-md border border-gray-200 overflow-hidden">
        <table className="w-full border-collapse font-body text-sm" style={{ minWidth: columns.length * 120 }}>
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              {columns.map(col => (
                <th
                  key={col.key}
                  className="font-heading uppercase font-bold text-xs text-gray-700 tracking-wide px-4 py-3 text-left whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={`${ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/30 transition-colors`}>
                {columns.map(col => (
                  <td
                    key={col.key}
                    className={`font-body text-sm px-4 py-3 border-b border-gray-100 align-top leading-relaxed ${
                      col.mono || col.key === 'sku' ? 'text-[#C8102E] font-semibold' : 'text-gray-600'
                    } ${col.mono ? 'font-mono' : ''} ${['approvals', 'opTemp', 'description'].includes(col.key) ? 'whitespace-normal' : 'whitespace-nowrap'}`}
                  >
                    {row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && (
        <p className="font-body text-xs text-gray-400 mt-2.5">* {note}</p>
      )}
    </div>
  );
}
