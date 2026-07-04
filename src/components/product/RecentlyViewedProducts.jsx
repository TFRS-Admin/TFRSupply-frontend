import React from 'react';
import { catalogService } from '@/services/catalog';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';
import { resolveProductDetailPath } from '@/domain/catalog';
import ProductCard from '@/components/product/ProductCard';
import SectionHeading from '@/components/product/SectionHeading';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

function toCardProps(product) {
  return {
    id: product.id,
    href: resolveProductDetailPath(product),
    label: product.title ?? product.label,
    image: product.media?.hero || product.images?.[0]?.src,
    tagline: product.subtitle,
    badges: product.marketing?.features?.slice(0, 2) ?? [],
  };
}

/**
 * Resolves tracked ids to display-ready products, dropping the current
 * product (if any) and any id that no longer resolves to a catalog record —
 * the same silent-drop behavior CompareTray/RecommendedProducts already use
 * for unresolvable ids. Exported as a pure function so it is testable
 * without a localStorage-backed context.
 */
export function resolveRecentlyViewedProducts(productIds, { excludeProductId, getProduct = catalogService.getProduct } = {}) {
  return productIds
    .filter((id) => id !== excludeProductId)
    .map((id) => getProduct(id))
    .filter(Boolean);
}

/**
 * Pure presentation, split out from the context-aware default export so it
 * can be rendered directly in tests with fixture products, matching the
 * CompareTrayView/*View convention used elsewhere.
 */
export function RecentlyViewedProductsView({ products, onClear }) {
  if (!products.length) return null;

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8 sm:py-10">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <SectionHeading>Recently Viewed</SectionHeading>
          </div>
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear recently viewed products"
            style={{ ...FS, fontSize: 12, fontWeight: 700, color: '#888', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}
          >
            Clear Recently Viewed
          </button>
        </div>
        <div className="rv-product-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} {...toCardProps(product)} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Site-wide "Recently Viewed" section, sourced from RecentlyViewedContext's
 * localStorage-persisted product id list. Composed onto Product Detail,
 * Search, and the homepage — hidden entirely (safe/empty state) once no
 * tracked id resolves to a catalog product, matching RecommendedProducts'
 * and CompareTray's empty behavior.
 */
export default function RecentlyViewedProducts({ excludeProductId }) {
  const { productIds, clearRecentlyViewed } = useRecentlyViewed();
  const products = resolveRecentlyViewedProducts(productIds, { excludeProductId });

  return <RecentlyViewedProductsView products={products} onClear={clearRecentlyViewed} />;
}
