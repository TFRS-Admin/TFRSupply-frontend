import React from 'react';
import { Heart } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { useSavedProducts } from '@/context/SavedProductsContext';
import { resolveSavedProducts } from '@/components/product/SavedProductsSection';
import { toProductCardViewModel } from '@/pages/ProductSearchPage';
import { PageLayout, PageHeader, EmptyState, CTAButton } from '@/components/design-system';

export function SavedProductsPageView({ products, onClear }) {
  return (
    <PageLayout background="white" crumbs={[{ label: 'Home', to: '/' }, { label: 'Saved Products' }]}>
      {products.length === 0 ? (
        <EmptyState
          headingLevel="h1"
          icon={Heart}
          title="You haven't saved any products yet"
          description="Browse the catalog and tap the heart icon on any product to save it here for later."
          primaryAction={{ label: 'Browse Products', to: '/search' }}
        />
      ) : (
        <>
          <PageHeader
            title="Saved Products"
            description={`${products.length} product${products.length !== 1 ? 's' : ''} saved`}
            actions={<CTAButton variant="outline" onClick={onClear}>Clear All</CTAButton>}
          />

          <div className="pd-product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem' }}>
            {products.map((product) => (
              <ProductCard key={product.id} {...toProductCardViewModel(product)} />
            ))}
          </div>
        </>
      )}
    </PageLayout>
  );
}

export default function SavedProductsPage() {
  const { productIds, clearSavedProducts } = useSavedProducts();
  const products = resolveSavedProducts(productIds);

  return <SavedProductsPageView products={products} onClear={clearSavedProducts} />;
}
