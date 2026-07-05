/**
 * components/product/ProductIntelligencePanel.jsx
 * Product Intelligence (Feature 5) — how this product fits into Department
 * Standards: which standards recommend it, which require it, the full
 * standard-by-standard tier breakdown, and which other products are
 * commonly installed with it. Composed onto Product Detail alongside
 * FinishYourUpfitPanel/RelatedPackages/RecommendedProducts. No AI, no
 * network calls: standards come from DepartmentStandardsContext (defaults +
 * saved company standards) and "Commonly Installed With" reuses the same
 * resolveRelatedProducts relationship data RecommendedProducts already reads
 * (product.commerce.related_products, then same-category catalog products)
 * — not a new recommendation engine.
 */
import React, { useMemo } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useDepartmentStandards } from '@/context/DepartmentStandardsContext';
import { getStandardsForProduct, getRequiredByStandards, getRecommendedForStandards } from '@/domain/departmentStandards';
import { resolveRelatedProducts } from '@/domain/catalog';
import { catalogService } from '@/services/catalog';
import SectionHeading from './SectionHeading';
import ProductCard from './ProductCard';
import { StandardTierChip } from '@/components/departmentStandards/DepartmentStandardBadge';

const MAX_COMMONLY_INSTALLED = 3;

function toCardProps(candidate, verticalId, categoryId) {
  return {
    id: candidate.id,
    href: `/${candidate.verticals?.[0] ?? verticalId}/${candidate.category ?? categoryId}/${candidate.id}`,
    label: candidate.title ?? candidate.label,
    image: candidate.media?.hero,
    tagline: candidate.subtitle,
    badges: candidate.marketing?.features?.slice(0, 2) ?? [],
    product: candidate,
  };
}

function StandardNameList({ standards, emptyLabel }) {
  if (standards.length === 0) return <p style={{ fontSize: 13, color: '#888', margin: 0 }}>{emptyLabel}</p>;
  return (
    <ul style={{ fontSize: 13, color: '#444', lineHeight: 1.8, paddingLeft: '1.1rem', margin: 0 }}>
      {standards.map((standard) => <li key={standard.id}>{standard.name}</li>)}
    </ul>
  );
}

export function ProductIntelligencePanelView({ product, matches, commonlyInstalledWith, verticalId, categoryId }) {
  if (matches.length === 0 && commonlyInstalledWith.length === 0) return null;

  const requiredBy = getRequiredByStandards(matches);
  const recommendedFor = getRecommendedForStandards(matches);

  return (
    <div className="border-t border-gray-200 bg-white" data-testid="product-intelligence-panel">
      <div className="max-w-7xl mx-auto px-6 py-8 sm:py-10">
        <SectionHeading icon={ShieldCheck} description="How this product fits into department equipment standards.">
          Product Intelligence
        </SectionHeading>

        {matches.length > 0 && (
          <div className="pi-standards-grid grid grid-cols-1 md:grid-cols-3 gap-8" style={{ marginBottom: commonlyInstalledWith.length > 0 ? 32 : 0 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 10 }}>Recommended For</h3>
              <StandardNameList standards={recommendedFor} emptyLabel="No standards recommend this product yet." />
            </div>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 10 }}>Required By</h3>
              <StandardNameList standards={requiredBy} emptyLabel="Not required by any standard." />
            </div>
            <div data-testid="product-intelligence-department-standards">
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 10 }}>Department Standards</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {matches.map(({ standard, tier }) => (
                  <li key={standard.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <StandardTierChip tier={tier} compact /> <span style={{ fontSize: 13, color: '#444' }}>{standard.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {commonlyInstalledWith.length > 0 && (
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 14 }}>Commonly Installed With</h3>
            <div className="pi-commonly-installed-grid grid grid-cols-1 md:grid-cols-3 gap-6">
              {commonlyInstalledWith.map((candidate) => (
                <ProductCard key={candidate.id} {...toCardProps(candidate, verticalId, categoryId)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductIntelligencePanel({ product, verticalId, categoryId }) {
  const { allStandards } = useDepartmentStandards();

  const matches = useMemo(() => getStandardsForProduct(product, allStandards), [product, allStandards]);
  const commonlyInstalledWith = useMemo(() => resolveRelatedProducts(
    product,
    {
      getProduct: (id) => catalogService.getProduct(id),
      searchByCategory: (catId) => catalogService.searchProducts({ filter: { categoryId: catId } }).products,
    },
    MAX_COMMONLY_INSTALLED,
  ), [product]);

  return (
    <ProductIntelligencePanelView
      product={product}
      matches={matches}
      commonlyInstalledWith={commonlyInstalledWith}
      verticalId={verticalId}
      categoryId={categoryId}
    />
  );
}
