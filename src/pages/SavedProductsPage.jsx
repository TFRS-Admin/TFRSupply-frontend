import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import SiteHeader from '@/components/navigator/SiteHeader';
import PrototypeBanner from '@/components/PrototypeBanner';
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb';
import ProductCard from '@/components/product/ProductCard';
import { useSavedProducts } from '@/context/SavedProductsContext';
import { resolveSavedProducts } from '@/components/product/SavedProductsSection';
import { toProductCardViewModel } from '@/pages/ProductSearchPage';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

function EmptySavedState() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 text-center">
      <Heart size={40} style={{ color: '#c8102e', margin: '0 auto 1rem' }} />
      <h1 style={{ ...FS, fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.75rem' }}>
        You haven&apos;t saved any products yet
      </h1>
      <p style={{ ...FS, fontSize: 14, color: '#666', maxWidth: 480, margin: '0 auto 1.5rem', lineHeight: 1.65 }}>
        Browse the catalog and tap the heart icon on any product to save it here for later.
      </p>
      <Link to="/search"
        style={{ ...FS, fontSize: 14, fontWeight: 700, color: '#fff', background: '#c8102e', padding: '11px 22px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        Browse Products
      </Link>
    </div>
  );
}

export function SavedProductsPageView({ products, onClear }) {
  return (
    <div className="min-h-screen bg-white" style={FS}>
      <PrototypeBanner />
      <SiteHeader />
      <ProductBreadcrumb crumbs={[{ label: 'Home', to: '/' }, { label: 'Saved Products' }]} />

      {products.length === 0 ? (
        <EmptySavedState />
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="sp-page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 'clamp(1.4rem,2.5vw,1.9rem)', fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>Saved Products</h1>
              <p style={{ fontSize: 13, color: '#888' }}>{`${products.length} product${products.length !== 1 ? 's' : ''} saved`}</p>
            </div>
            <button type="button" onClick={onClear}
              style={{ ...FS, fontSize: 13, fontWeight: 700, color: '#c8102e', background: 'none', border: '2px solid #c8102e', padding: '9px 16px', cursor: 'pointer' }}>
              Clear All
            </button>
          </div>

          <div className="pd-product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem' }}>
            {products.map((product) => (
              <ProductCard key={product.id} {...toProductCardViewModel(product)} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default function SavedProductsPage() {
  const { productIds, clearSavedProducts } = useSavedProducts();
  const products = resolveSavedProducts(productIds);

  return <SavedProductsPageView products={products} onClear={clearSavedProducts} />;
}
