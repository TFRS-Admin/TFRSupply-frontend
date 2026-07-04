import React from 'react';
import { Link } from 'react-router-dom';
import { catalogService } from '@/services/catalog';
import { useSavedProducts } from '@/context/SavedProductsContext';
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
 * Resolves saved ids to display-ready products, dropping any id that no
 * longer resolves to a catalog record — the same silent-drop behavior
 * resolveRecentlyViewedProducts uses. Exported as a pure function so it is
 * testable without a localStorage-backed context.
 */
export function resolveSavedProducts(productIds, { getProduct = catalogService.getProduct } = {}) {
  return productIds
    .map((id) => getProduct(id))
    .filter(Boolean);
}

/**
 * Pure presentation, split out from the context-aware default export so it
 * can be rendered directly in tests with fixture products, matching the
 * RecentlyViewedProductsView convention.
 */
export function SavedProductsSectionView({ products, onClear }) {
  if (!products.length) return null;

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8 sm:py-10">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <SectionHeading>Saved for Later</SectionHeading>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link
              to="/saved-products"
              style={{ ...FS, fontSize: 12, fontWeight: 700, color: '#c8102e', letterSpacing: '0.03em', whiteSpace: 'nowrap', textDecoration: 'none' }}
            >
              View All Saved
            </Link>
            <button
              type="button"
              onClick={onClear}
              aria-label="Clear saved products"
              style={{ ...FS, fontSize: 12, fontWeight: 700, color: '#888', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}
            >
              Clear Saved
            </button>
          </div>
        </div>
        <div className="sp-product-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} {...toCardProps(product)} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Site-wide "Saved for Later" section, sourced from SavedProductsContext's
 * localStorage-persisted product id list. Composed onto the homepage —
 * hidden entirely (safe/empty state) once no saved id resolves to a catalog
 * product, matching RecentlyViewedProducts' empty behavior.
 */
export default function SavedProductsSection() {
  const { productIds, clearSavedProducts } = useSavedProducts();
  const products = resolveSavedProducts(productIds);

  return <SavedProductsSectionView products={products} onClear={clearSavedProducts} />;
}
