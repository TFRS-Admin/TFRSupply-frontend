/**
 * components/procurementPackages/PackageComparisonSection.jsx
 * "Package Comparison" — side-by-side comparison of the packages checked
 * "Compare" on their summary card above (Vehicles, Equipment, Completion,
 * Recommendations, Missing Equipment). Pure, props-driven; selection state
 * (which package ids are checked) lives on the connected page, mirroring
 * every other Fleet feature's "state on the page, presentation in the
 * component" split.
 */
import React from 'react';
import { Columns3 } from 'lucide-react';
import SectionHeading from '@/components/product/SectionHeading';
import PackageReadinessBadge from './PackageReadinessBadge';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

export default function PackageComparisonSection({ packages, maxComparisonPackages }) {
  return (
    <section style={{ marginBottom: 32 }} data-testid="package-comparison-section">
      <SectionHeading icon={Columns3} description={`Check "Compare" on up to ${maxComparisonPackages} packages above to see them side by side.`}>
        Package Comparison
      </SectionHeading>

      {packages.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '24px 20px' }}>
          <p style={{ ...FS, fontSize: 13, color: '#888', margin: 0 }}>Select two or more packages above to compare them.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '18px 20px', overflowX: 'auto' }} data-testid="package-comparison-table">
          <table style={{ ...FS, width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#999', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '6px 10px' }}>Package</th>
                {packages.map((pkg) => (
                  <th key={pkg.id} style={{ padding: '6px 10px' }}>{pkg.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px', color: '#666' }}>Vehicles</td>
                {packages.map((pkg) => <td key={pkg.id} style={{ padding: '10px', fontWeight: 700, color: '#1a1a1a' }}>{pkg.vehicleCount}</td>)}
              </tr>
              <tr style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px', color: '#666' }}>Equipment</td>
                {packages.map((pkg) => <td key={pkg.id} style={{ padding: '10px', fontWeight: 700, color: '#1a1a1a' }}>{pkg.equipmentCount}</td>)}
              </tr>
              <tr style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px', color: '#666' }}>Completion</td>
                {packages.map((pkg) => <td key={pkg.id} style={{ padding: '10px', fontWeight: 700, color: '#1a1a1a' }}>{pkg.completionPercent}%</td>)}
              </tr>
              <tr style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px', color: '#666' }}>Readiness</td>
                {packages.map((pkg) => (
                  <td key={pkg.id} style={{ padding: '10px' }}>
                    <PackageReadinessBadge readiness={pkg.readiness} compact showReasons={false} />
                  </td>
                ))}
              </tr>
              <tr style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px', color: '#666' }}>Recommendations</td>
                {packages.map((pkg) => <td key={pkg.id} style={{ padding: '10px', fontWeight: 700, color: '#1a1a1a' }}>{pkg.recommendedAdditions.length}</td>)}
              </tr>
              <tr style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px', color: '#666' }}>Missing Equipment</td>
                {packages.map((pkg) => (
                  <td key={pkg.id} style={{ padding: '10px', color: '#1a1a1a' }}>
                    {pkg.missingEquipment.critical.length + pkg.missingEquipment.recommended.length + pkg.missingEquipment.optional.length} item(s)
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
