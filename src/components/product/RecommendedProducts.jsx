import React, { useMemo } from 'react';
import { catalogService } from '@/services/catalog';
import { resolveRelatedProducts } from '@/domain/catalog';
import ProductCard from '@/components/product/ProductCard';
import SectionHeading from '@/components/product/SectionHeading';

const MAX_RECOMMENDATIONS = 3;

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

/**
 * Deterministic recommendations sourced from catalogService relationships:
 * explicit product.commerce.related_products first, then other products in
 * the same category. No AI ranking and no external services are involved.
 */
export default function RecommendedProducts({ product, verticalId, categoryId }) {
  const recommendations = useMemo(() => resolveRelatedProducts(
    product,
    {
      getProduct: (id) => catalogService.getProduct(id),
      searchByCategory: (catId) => catalogService.searchProducts({ filter: { categoryId: catId } }).products,
    },
    MAX_RECOMMENDATIONS,
  ), [product]);

  if (!recommendations.length) return null;

  return (
    <div className="border-t border-gray-200 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 sm:py-10">
        <SectionHeading>Recommended Products</SectionHeading>
        <div className="pd-recommend-grid grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((candidate) => (
            <ProductCard key={candidate.id} {...toCardProps(candidate, verticalId, categoryId)} />
          ))}
        </div>
      </div>
    </div>
  );
}
