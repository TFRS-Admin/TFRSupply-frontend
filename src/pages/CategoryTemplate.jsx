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
      <div className="relative overflow-hidden" style={{ background: '#0f0f0f', minHeight: 240 }}>
        {hero?.image && <img src={hero.image} alt={hero.imageAlt || ''} className="absolute inset-0 w-full h-full object-cover opacity-25" />}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(15,15,15,0.65) 0%, rgba(15,15,15,0.92) 100%)' }} />
        <div className="relative max-w-7xl mx-auto px-6 py-14">
          <p className="font-heading mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#d97706]">{verticalLabel}</p>
          <h1 className="font-heading mb-3 max-w-3xl text-[clamp(1.9rem,3.6vw,2.8rem)] font-bold uppercase leading-tight tracking-tight text-white">
            {hero?.title || data.label}
          </h1>
          {hero?.subtitle && (
            <p className="font-body max-w-xl text-[15px] leading-relaxed text-white/80">{hero.subtitle}</p>
          )}
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
            {description && <p className="font-body mb-6 text-sm leading-relaxed text-gray-600">{description}</p>}
            <div style={{ maxWidth: 360, marginBottom: '1.25rem' }}>
              <ProductSearchBar value={keyword} onSearch={setKeyword} placeholder="Search this category…" />
            </div>
            <p className="font-heading mb-5 border-b border-gray-200 pb-3 text-xs font-bold uppercase tracking-[0.06em] text-gray-500">
              {filtered.length} PRODUCT{filtered.length !== 1 ? 'S' : ''} FOUND
            </p>
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
                <p className="font-body text-sm text-gray-400">
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
