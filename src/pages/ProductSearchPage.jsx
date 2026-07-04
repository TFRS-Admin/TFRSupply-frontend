import React, { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCatalogLists, useProductSearch } from '@/hooks/useCatalog';
import { resolveProductDetailPath } from '@/domain/catalog';
import SiteHeader from '@/components/navigator/SiteHeader';
import PrototypeBanner from '@/components/PrototypeBanner';
import PrototypeFooter from '@/components/PrototypeFooter';
import ProductCard from '@/components/product/ProductCard';
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb';
import ProductSearchBar from '@/components/product/ProductSearchBar';
import ProductFilterPanel from '@/components/product/ProductFilterPanel';
import RecentlyViewedProducts from '@/components/product/RecentlyViewedProducts';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

export function toProductCardViewModel(product) {
  const href = resolveProductDetailPath(product);
  const image = product.media?.hero || product.images?.[0]?.src;

  return {
    id: product.id,
    href,
    label: product.label,
    image,
    imageAlt: product.label,
    tagline: product.subtitle,
    specs: product.marketing?.features?.slice(0, 3) ?? [],
    badges: product.verticalIds ?? [],
    product,
  };
}

export default function ProductSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const verticalParam = searchParams.get('vertical') || null;
  const categoryParam = searchParams.get('category') || null;

  const { data, loading, error, search } = useProductSearch();
  const { verticals, categories } = useCatalogLists();

  useEffect(() => {
    search({
      query: queryParam || undefined,
      filter: {
        verticalId: verticalParam || undefined,
        categoryId: categoryParam || undefined,
      },
    });
    // search() is a stable useCallback — only the URL-derived filters should retrigger it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParam, verticalParam, categoryParam]);

  if (error) throw error;

  function updateParams(next) {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    setSearchParams(params);
  }

  const filterGroups = useMemo(() => ([
    {
      id: 'vertical',
      label: 'Vertical',
      options: verticals.map((vertical) => ({ value: vertical.id, label: vertical.label })),
    },
    {
      id: 'category',
      label: 'Category',
      options: categories.map((category) => ({ value: category.id, label: category.label })),
    },
  ]), [verticals, categories]);

  const products = data?.products ?? [];
  const showEmptyState = !loading && data && products.length === 0;

  return (
    <div className="min-h-screen bg-white" style={FS}>
      <PrototypeBanner />
      <SiteHeader />
      <ProductBreadcrumb crumbs={[
        { label: 'Home', to: '/' },
        { label: queryParam ? `Search: "${queryParam}"` : 'Browse Products' },
      ]} />

      <div className="relative overflow-hidden" style={{ background: '#1a2744', minHeight: 160 }}>
        <div className="relative max-w-7xl mx-auto px-6 py-10">
          <h1 style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
            {queryParam ? `Results for "${queryParam}"` : 'Browse All Products'}
          </h1>
          <div style={{ maxWidth: 480 }}>
            <ProductSearchBar value={queryParam} onSearch={(value) => updateParams({ q: value || null })} />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: '#c8102e' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="pd-filter-layout" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          <ProductFilterPanel
            groups={filterGroups}
            active={{ vertical: verticalParam, category: categoryParam }}
            onChange={(groupId, value) => updateParams({ [groupId]: value })}
            onReset={() => updateParams({ vertical: null, category: null })}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, color: '#999', marginBottom: '1.25rem' }}>
              {loading ? 'Searching…' : `${products.length} product${products.length !== 1 ? 's' : ''}`}
            </p>

            <div className="pd-product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem' }}>
              {products.map((product) => (
                <ProductCard key={product.id} {...toProductCardViewModel(product)} />
              ))}
            </div>

            {showEmptyState && (
              <div className="text-center py-16">
                <p style={{ fontSize: 14, color: '#999' }}>No products match your search. Try a different term or clear your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <RecentlyViewedProducts />

      <PrototypeFooter />
    </div>
  );
}
