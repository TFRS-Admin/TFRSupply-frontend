/**
 * components/procurementPackages/ProcurementExportPreviewSection.jsx
 * "Export Preview" — a read-only preview of one package's procurement
 * document (Department, Package Summary, Vehicle Summary, Equipment,
 * Missing Equipment, Recommendations, Procurement Notes). Preview only: no
 * PDF generation, no backend call. Mirrors
 * src/components/fleetQuote/ExportPreviewSection.jsx's structure/toggle
 * convention, one instance per package. Procurement Notes are session-only
 * (the caller's own component state), since no new persistence layer is
 * introduced by this feature.
 */
import React, { useState } from 'react';
import { Eye, EyeOff, FileText } from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };
const docHeadingStyle = { ...FS, fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#1a2744', margin: '22px 0 10px', borderTop: '1px solid #eee', paddingTop: 16 };

export default function ProcurementExportPreviewSection({ preview, notes, onChangeNotes }) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ marginTop: 16 }} data-testid="procurement-export-preview-section">
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        data-testid="procurement-export-preview-toggle"
        style={{
          ...FS, fontSize: 12, fontWeight: 700, color: '#1a2744', background: '#fff', border: '2px solid #1a2744',
          padding: '9px 14px', minHeight: 40, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
        }}
      >
        {visible ? <EyeOff size={14} /> : <Eye size={14} />} {visible ? 'Hide Export Preview' : 'Show Export Preview'}
      </button>
      <p style={{ ...FS, fontSize: 11, color: '#999', margin: '6px 0 0' }}>This is preview only — no PDF is generated and nothing is sent.</p>

      {visible && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '20px 22px', marginTop: 12 }} data-testid="procurement-export-preview-document">
          <p style={{ ...FS, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#999', margin: '0 0 4px' }}>{preview.departmentLabel}</p>
          <h3 style={{ ...FS, fontSize: 18, fontWeight: 900, color: '#1a2744', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={16} /> {preview.packageName} — Procurement Package
          </h3>

          <p style={docHeadingStyle}>Vehicle Summary</p>
          {preview.vehicleSummaries.length === 0 ? (
            <p style={{ ...FS, fontSize: 13, color: '#888', margin: 0 }}>No fleet builds in this package.</p>
          ) : (
            <ul style={{ ...FS, margin: 0, padding: '0 0 0 18px', fontSize: 13, color: '#444', lineHeight: 1.9 }}>
              {preview.vehicleSummaries.map((vehicle) => (
                <li key={vehicle.buildId}>
                  {vehicle.vehicleLabel} × {vehicle.quantity} — {vehicle.completionPercent}% complete
                </li>
              ))}
            </ul>
          )}

          <p style={docHeadingStyle}>Equipment</p>
          {preview.equipment.length === 0 ? (
            <p style={{ ...FS, fontSize: 13, color: '#888', margin: 0 }}>No equipment selected yet.</p>
          ) : (
            <ul style={{ ...FS, margin: 0, padding: '0 0 0 18px', fontSize: 13, color: '#444', lineHeight: 1.9 }}>
              {preview.equipment.map((item) => (
                <li key={item.productId}>{item.label} — {item.categoryLabel} — Qty {item.quantity} ({item.vehicleCount} vehicle{item.vehicleCount === 1 ? '' : 's'})</li>
              ))}
            </ul>
          )}

          <p style={docHeadingStyle}>Missing Equipment</p>
          <p style={{ ...FS, fontSize: 13, color: '#444', margin: 0, lineHeight: 1.9 }}>
            {preview.missingEquipment.critical.length} critical, {preview.missingEquipment.recommended.length} recommended, {preview.missingEquipment.optional.length} optional item(s) outstanding.
          </p>

          <p style={docHeadingStyle}>Recommendations</p>
          {preview.recommendations.length === 0 ? (
            <p style={{ ...FS, fontSize: 13, color: '#888', margin: 0 }}>No additional recommendations right now.</p>
          ) : (
            <ul style={{ ...FS, margin: 0, padding: '0 0 0 18px', fontSize: 13, color: '#444', lineHeight: 1.9 }}>
              {preview.recommendations.map(({ product }) => <li key={product.id}>{product.title ?? product.label ?? product.id}</li>)}
            </ul>
          )}

          <p style={docHeadingStyle}>Procurement Notes</p>
          <textarea
            value={notes}
            onChange={(event) => onChangeNotes(event.target.value)}
            rows={3}
            placeholder="Add any notes for this package — vendor, timing, special requests, etc."
            data-testid="procurement-export-preview-notes"
            style={{ ...FS, width: '100%', fontSize: 13, border: '1.5px solid #d0d0d0', borderRadius: 2, padding: '10px 12px', resize: 'vertical', color: '#1a1a1a' }}
          />
        </div>
      )}
    </div>
  );
}
