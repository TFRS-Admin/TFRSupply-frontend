import React from 'react';
import { Box } from 'lucide-react';
import { usePackageDefinition } from '@/hooks/packageBuilder';
import SectionHeading from '@/components/product/SectionHeading';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

function RelatedPackageCardSkeleton() {
  return (
    <div className="border border-gray-200 bg-white p-4 animate-pulse" style={FS}>
      <div style={{ height: 14, width: '60%', background: '#eee', marginBottom: 10 }} />
      <div style={{ height: 10, width: '40%', background: '#f2f2f2', marginBottom: 8 }} />
      <div style={{ height: 10, width: '30%', background: '#f2f2f2' }} />
    </div>
  );
}

function RelatedPackageCard({ packageId }) {
  const { data: packageDefinition, loading } = usePackageDefinition(packageId);
  if (loading) return <RelatedPackageCardSkeleton />;
  if (!packageDefinition) return null;

  return (
    <div className="border border-gray-200 bg-white p-4 transition-colors" style={FS}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c8102e'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}>
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
      <div className="max-w-7xl mx-auto px-6 py-8 sm:py-10">
        <SectionHeading>Related Packages</SectionHeading>
        <div className="pd-package-grid grid grid-cols-1 md:grid-cols-3 gap-6">
          {packageIds.map((packageId) => (
            <RelatedPackageCard key={packageId} packageId={packageId} />
          ))}
        </div>
      </div>
    </div>
  );
}
