import React from 'react';
import { Box } from 'lucide-react';
import { usePackageDefinition } from '@/hooks/packageBuilder';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

function RelatedPackageCard({ packageId }) {
  const { data: packageDefinition, loading } = usePackageDefinition(packageId);
  if (loading || !packageDefinition) return null;

  return (
    <div className="border border-gray-200 bg-white p-4" style={FS}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Box size={16} style={{ color: '#c8102e' }} />
        <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{packageDefinition.label}</p>
      </div>
      {packageDefinition.metadata?.packageType && (
        <p style={{ fontSize: 11, color: '#888', textTransform: 'capitalize', marginBottom: 6 }}>
          {packageDefinition.metadata.packageType.replace(/-/g, ' ')} package
        </p>
      )}
      <p style={{ fontSize: 12, color: '#777' }}>
        {packageDefinition.lines?.length ?? 0} component{packageDefinition.lines?.length === 1 ? '' : 's'}
      </p>
    </div>
  );
}

/**
 * Related Packages — surfaces packages compatible with this product using
 * the existing Package Builder Foundation (packageBuilderService /
 * usePackageDefinition). Renders nothing until real package data is
 * connected behind PackageBuilderAdapter, matching the foundation's
 * intentionally-unwired default.
 */
export default function RelatedPackages({ product }) {
  const packageIds = product.commerce?.related_packages ?? [];
  if (!packageIds.length) return null;

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <p style={{ ...FS, fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a2744', borderBottom: '2px solid #1a2744', paddingBottom: 6, marginBottom: 20 }}>
          Related Packages
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packageIds.map((packageId) => (
            <RelatedPackageCard key={packageId} packageId={packageId} />
          ))}
        </div>
      </div>
    </div>
  );
}
