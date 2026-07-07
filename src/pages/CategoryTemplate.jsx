import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCatalogCategory } from '@/hooks/useCatalog';
import { catalogService } from '@/services/catalog';
import { filterCategoryProducts } from '@/domain/catalog';
import SiteHeader from '@/components/navigator/SiteHeader';
import PrototypeBanner from '@/components/PrototypeBanner';
import NotFound from '@/components/templates/NotFound';
import ProductCard from '@/components/product/ProductCard';
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb';
import ProductFilterPanel from '@/components/product/ProductFilterPanel';
import ProductSearchBar from '@/components/product/ProductSearchBar';
import StorefrontCollectionPanel from '@/components/product/StorefrontCollectionPanel';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

/**
 * Pure view for the category page — data-fetching is kept in the default
 * export so this can be rendered directly in tests with fixture props,
 * matching the StoreLandingView/VerticalLandingTemplateView split used
 * elsewhere in src/pages.
 */
export function CategoryTemplateView({ verticalId, categoryId, data, loading, error }) {
  const [activeFilter, setActiveFilter] = useState({});
  const [keyword, setKeyword] = useState('');

  if (error) throw error;
  if (loading) return null;
  if (!data) return <NotFound type="category" backTo={`/${verticalId}`} backLabel="Return to Vertical" />;

  const { hero, description, filters = [], products = [] } = data;
  const verticalLabel = catalogService.getVertical(verticalId)?.label
    ?? (verticalId.charAt(0).toUpperCase() + verticalId.slice(1).replace(/-/g, ' '));

  const filtered = filterCategoryProducts(products, activeFilter, keyword);

  const hasActiveSearch = Boolean(keyword.trim()) || Object.values(activeFilter).some(Boolean);

  return (
    <div className="min-h-screen bg-white" style={FS}>
      <PrototypeBanner />
      <SiteHeader activeVertical={verticalId} />
      <ProductBreadcrumb crumbs={[
        { label: 'Home', to: '/' },
        { label: verticalLabel, to: `/${verticalId}` },
        { label: data.label }
      ]} />

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: '#1a2744', minHeight: 220 }}>
        {hero?.image && <img src={hero.image} alt={hero.imageAlt || ''} className="absolute inset-0 w-full h-full object-cover opacity-25" />}
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>{hero?.title || data.label}</h1>
          {hero?.subtitle && <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', maxWidth: 540, lineHeight: 1.65 }}>{hero.subtitle}</p>}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: '#c8102e' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="pd-filter-layout" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

          {/* Sidebar Filters */}
          {filters.length > 0 && (
            <ProductFilterPanel
              groups={filters}
              active={activeFilter}
              onChange={(groupId, value) => setActiveFilter(prev => ({ ...prev, [groupId]: value }))}
              onReset={() => setActiveFilter({})}
            />
          )}

          {/* Product Grid */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {description && <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: '1.5rem' }}>{description}</p>}
            <StorefrontCollectionPanel categoryId={data.id} />
            <div style={{ maxWidth: 360, marginBottom: '1.25rem' }}>
              <ProductSearchBar value={keyword} onSearch={setKeyword} placeholder="Search this category…" />
            </div>
            <p style={{ fontSize: 12, color: '#999', marginBottom: '1.25rem' }}>{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
            <div className="pd-product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem' }}>
              {filtered.map(p => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  href={`/${verticalId}/${categoryId}/${p.id}`}
                  label={p.label}
                  image={p.image}
                  tagline={p.tagline}
                  specs={p.specs}
                  badges={p.badges}
                />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p style={{ fontSize: 14, color: '#999' }}>
                  {hasActiveSearch ? 'No products match your search or filters.' : 'No products are available in this category yet.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

export default function CategoryTemplate() {
  const { verticalId, categoryId } = useParams();
  const { data, loading, error } = useCatalogCategory(categoryId);

  return (
    <CategoryTemplateView
      verticalId={verticalId}
      categoryId={categoryId}
      data={data}
      loading={loading}
      error={error}
    />
  );
}
