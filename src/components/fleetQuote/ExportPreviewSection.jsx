/**
 * components/fleetQuote/ExportPreviewSection.jsx
 * "Export Preview" — a professional, read-only preview of the project quote
 * package (Department, Project, Vehicle Summary, Equipment Summary, Missing
 * Equipment, Recommendations, Quote Notes). Preview only: no PDF generation,
 * no backend. Quote Notes are session-only (component state), since no new
 * persistence layer is introduced by this feature.
 */
import React, { useState } from 'react';
import { Eye, EyeOff, FileText } from 'lucide-react';
import SectionHeading from '@/components/product/SectionHeading';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };
const docHeadingStyle = { ...FS, fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#1a2744', margin: '22px 0 10px', borderTop: '1px solid #eee', paddingTop: 16 };

export default function ExportPreviewSection({ preview, quoteNotes, onChangeQuoteNotes }) {
  const [visible, setVisible] = useState(false);

  return (
    <section style={{ marginBottom: 32 }} data-testid="export-preview-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <SectionHeading icon={FileText} description="This is preview only — no PDF is generated and nothing is sent.">
          Export Preview
        </SectionHeading>
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          data-testid="export-preview-toggle"
          style={{
            ...FS, fontSize: 12, fontWeight: 700, color: '#1a2744', background: '#fff', border: '2px solid #1a2744',
            padding: '9px 14px', minHeight: 40, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: -12,
          }}
        >
          {visible ? <EyeOff size={14} /> : <Eye size={14} />} {visible ? 'Hide Export Preview' : 'Show Export Preview'}
        </button>
      </div>

      {visible && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '24px 26px' }} data-testid="export-preview-document">
          <p style={{ ...FS, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#999', margin: '0 0 4px' }}>{preview.departmentLabel}</p>
          <h2 style={{ ...FS, fontSize: 20, fontWeight: 900, color: '#1a2744', margin: 0 }}>{preview.projectName} — Project Quote</h2>

          <p style={docHeadingStyle}>Vehicle Summary</p>
          {preview.vehicleSummaries.length === 0 ? (
            <p style={{ ...FS, fontSize: 13, color: '#888', margin: 0 }}>No fleet builds in this project.</p>
          ) : (
            <ul style={{ ...FS, margin: 0, padding: '0 0 0 18px', fontSize: 13, color: '#444', lineHeight: 1.9 }}>
              {preview.vehicleSummaries.map((vehicle) => (
                <li key={vehicle.buildId}>
                  {vehicle.vehicleLabel} × {vehicle.quantity} — {vehicle.completionPercent}% complete
                  {vehicle.departmentStandardName ? ` (${vehicle.departmentStandardName})` : ''}
                </li>
              ))}
            </ul>
          )}

          <p style={docHeadingStyle}>Equipment Summary</p>
          {preview.equipmentSummary.length === 0 ? (
            <p style={{ ...FS, fontSize: 13, color: '#888', margin: 0 }}>No equipment selected yet.</p>
          ) : (
            <ul style={{ ...FS, margin: 0, padding: '0 0 0 18px', fontSize: 13, color: '#444', lineHeight: 1.9 }}>
              {preview.equipmentSummary.map((item) => (
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

          <p style={docHeadingStyle}>Quote Notes</p>
          <textarea
            value={quoteNotes}
            onChange={(event) => onChangeQuoteNotes(event.target.value)}
            rows={4}
            placeholder="Add any notes for this quote — installation timing, special requests, etc."
            data-testid="export-preview-notes"
            style={{ ...FS, width: '100%', fontSize: 13, border: '1.5px solid #d0d0d0', borderRadius: 2, padding: '10px 12px', resize: 'vertical', color: '#1a1a1a' }}
          />
        </div>
      )}
    </section>
  );
}
