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

      {/* Federal Signal two-column category hero */}
      <div style={{ borderRadius: '20px 5px 20px 5px', overflow: 'hidden', display: 'flex', flexDirection: 'row' }}>
        {/* Left col — breadcrumb + eyebrow */}
        <div style={{ background: '#213a47', padding: '50px', flexBasis: '30%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-block h-[3px] w-8" style={{ background: '#e21938' }} />
            <span className="font-heading text-xs font-bold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>
              {verticalLabel}
            </span>
          </div>
          {/* Breadcrumb */}
          <p className="font-body text-sm" style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
            {verticalLabel} / {hero?.title || data.label}
          </p>
        </div>
        {/* Right col — H1 + subtitle */}
        <div style={{ background: '#1c2f38', padding: '80px 50px', flexBasis: '70%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 className="font-heading mb-3 max-w-3xl font-bold uppercase leading-tight tracking-tight text-white"
            style={{ fontSize: 'clamp(1.9rem, 3.6vw, 2.8rem)' }}>
            {hero?.title || data.label}
          </h1>
          {hero?.subtitle && (
            <p className="font-body max-w-xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {hero.subtitle}
            </p>
          )}
          <div style={{ background: '#47595f', height: 1, marginTop: '1.125rem', marginBottom: '1.125rem' }} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4 items-start">

          {/* Sidebar Filters */}
          {filters.length > 0 && (
            <div className="md:col-span-1">
              <ProductFilterPanel
                groups={filters}
                active={activeFilter}
                onChange={(groupId, value) => setActiveFilter(prev => ({ ...prev, [groupId]: value }))}
                onReset={() => setActiveFilter({})}
              />
            </div>
          )}

          {/* Product Grid */}
          <div className={filters.length > 0 ? 'md:col-span-2 lg:col-span-3' : 'md:col-span-3 lg:col-span-4'}>
            {description && <p className="font-body mb-6 text-sm leading-relaxed text-gray-600">{description}</p>}
            <div className="mb-5 max-w-[360px]">
              <ProductSearchBar value={keyword} onSearch={setKeyword} placeholder="Search this category…" />
            </div>
            <p className="font-heading mb-5 border-b border-gray-200 pb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
              {filtered.length} PRODUCT{filtered.length !== 1 ? 'S' : ''} FOUND
            </p>
            <div className="pd-product-grid grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
