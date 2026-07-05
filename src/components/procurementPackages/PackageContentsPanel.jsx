/**
 * components/procurementPackages/PackageContentsPanel.jsx
 * "Package Contents" — Vehicle Types, Products (grouped quantities), and
 * tiered Required/Recommended/Optional Equipment for one expanded package.
 * Pure, props-driven — reads only from the already-computed PackageContents
 * (src/domain/procurementPackages/packageContents.ts).
 */
import React from 'react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const STATUS_STYLE = {
  complete: { label: 'Complete', color: '#166534', bg: '#dcfce7' },
  partial: { label: 'Partial', color: '#92400e', bg: '#fef3c7' },
  missing: { label: 'Missing', color: '#b91c1c', bg: '#fee2e2' },
};

function CategoryTierList({ title, entries, emptyLabel, totalBuilds }) {
  return (
    <div data-testid={`package-contents-tier-${title.toLowerCase()}`} style={{ minWidth: 0 }}>
      <p style={{ ...FS, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#999', margin: '0 0 8px' }}>
        {title} ({entries.length})
      </p>
      {entries.length === 0 ? (
        <p style={{ ...FS, fontSize: 13, color: '#888', margin: 0 }}>{emptyLabel}</p>
      ) : (
        <ul style={{ ...FS, margin: 0, padding: 0, listStyle: 'none', fontSize: 13, color: '#444', lineHeight: 1.9 }}>
          {entries.map((entry) => {
            const style = STATUS_STYLE[entry.status];
            return (
              <li key={entry.categoryId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                <span>{entry.categoryLabel}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: style.bg, color: style.color, whiteSpace: 'nowrap' }}>
                  {style.label} ({entry.equippedBuildIds.length}/{totalBuilds})
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function PackageContentsPanel({ contents }) {
  return (
    <div style={{ borderTop: '1px solid #eee', paddingTop: 16 }} data-testid="package-contents-panel">
      <div style={{ marginBottom: 18 }}>
        <p style={{ ...FS, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#999', margin: '0 0 8px' }}>
          Vehicle Types ({contents.vehicleTypes.length})
        </p>
        {contents.vehicleTypes.length === 0 ? (
          <p style={{ ...FS, fontSize: 13, color: '#888', margin: 0 }}>No fleet builds in this package.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ ...FS, width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 380 }} data-testid="package-vehicle-types-table">
              <thead>
                <tr style={{ textAlign: 'left', color: '#999', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '6px 8px' }}>Vehicle</th>
                  <th style={{ padding: '6px 8px' }}>Build Style</th>
                  <th style={{ padding: '6px 8px' }}>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {contents.vehicleTypes.map((vehicle) => (
                  <tr key={vehicle.buildId} style={{ borderTop: '1px solid #f0f0f0', color: '#1a1a1a' }}>
                    <td style={{ padding: '8px' }}>{vehicle.vehicleLabel} <span style={{ color: '#999' }}>({vehicle.buildName})</span></td>
                    <td style={{ padding: '8px', color: '#666' }}>{vehicle.buildStyleLabel}</td>
                    <td style={{ padding: '8px', fontWeight: 700 }}>{vehicle.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 18 }}>
        <p style={{ ...FS, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#999', margin: '0 0 8px' }}>
          Products &amp; Grouped Quantities ({contents.products.length})
        </p>
        {contents.products.length === 0 ? (
          <p style={{ ...FS, fontSize: 13, color: '#888', margin: 0 }}>No equipment selected in this package yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ ...FS, width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 420 }} data-testid="package-products-table">
              <thead>
                <tr style={{ textAlign: 'left', color: '#999', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '6px 8px' }}>Product</th>
                  <th style={{ padding: '6px 8px' }}>Category</th>
                  <th style={{ padding: '6px 8px' }}>Quantity</th>
                  <th style={{ padding: '6px 8px' }}>Vehicle Count</th>
                </tr>
              </thead>
              <tbody>
                {contents.products.map((item) => (
                  <tr key={item.productId} style={{ borderTop: '1px solid #f0f0f0', color: '#1a1a1a' }}>
                    <td style={{ padding: '8px' }}>{item.label}</td>
                    <td style={{ padding: '8px', color: '#666' }}>{item.categoryLabel}</td>
                    <td style={{ padding: '8px', fontWeight: 700 }}>{item.quantity}</td>
                    <td style={{ padding: '8px' }}>{item.vehicleCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="package-contents-tier-grid grid grid-cols-1 md:grid-cols-3 gap-6">
        <CategoryTierList title="Required Equipment" entries={contents.requiredEquipment} totalBuilds={contents.vehicleTypes.length} emptyLabel="This package's standard has no required categories." />
        <CategoryTierList title="Recommended Equipment" entries={contents.recommendedEquipment} totalBuilds={contents.vehicleTypes.length} emptyLabel="Nothing recommended for this package." />
        <CategoryTierList title="Optional Equipment" entries={contents.optionalEquipment} totalBuilds={contents.vehicleTypes.length} emptyLabel="Nothing optional for this package." />
      </div>
    </div>
  );
}
