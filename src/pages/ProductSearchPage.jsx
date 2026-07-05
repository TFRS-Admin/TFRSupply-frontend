import React, { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ListChecks } from 'lucide-react';
import { useCatalogLists, useProductSearch } from '@/hooks/useCatalog';
import { resolveProductDetailPath } from '@/domain/catalog';
import { getUpfitCategoryLabel } from '@/domain/fleetBuilds';
import { useFleetBuilds } from '@/context/FleetBuildsContext';
import { useFleetProject } from '@/context/FleetProjectContext';
import { useDepartmentStandards } from '@/context/DepartmentStandardsContext';
import { useUpfitBuilder } from '@/context/UpfitBuilderContext';
import { resolveEffectiveStandard } from '@/domain/departmentStandards';
import { isCategoryStep } from '@/domain/upfitBuilder';
import { generateRecommendations, resolveRecommendationProducts, resolveRelatedProductIdsForBuild } from '@/domain/recommendations';
import { catalogService } from '@/services/catalog';
import SiteHeader from '@/components/navigator/SiteHeader';
import PrototypeBanner from '@/components/PrototypeBanner';
import PrototypeFooter from '@/components/PrototypeFooter';
import ProductCard from '@/components/product/ProductCard';
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb';
import ProductSearchBar from '@/components/product/ProductSearchBar';
import ProductFilterPanel from '@/components/product/ProductFilterPanel';
import RecentlyViewedProducts from '@/components/product/RecentlyViewedProducts';
import RecommendationCard, { RecommendationCardGrid } from '@/components/recommendations/RecommendationCard';

const MAX_RECOMMENDED_FOR_SEARCH = 4;

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
  // Guided Vehicle Upfit Builder — additive context carried by a step's
  // "Browse" CTA (src/domain/upfitBuilder/browseRouting.ts). Never filters
  // results on its own; it only powers the "Recommended for this build"
  // banner and the way back into /upfit-builder.
  const upfitCategoryParam = searchParams.get('upfitCategory') || null;
  const isGuidedBuildContext = searchParams.get('guidedBuild') === '1';

  const { data, loading, error, search } = useProductSearch();
  const { verticals, categories } = useCatalogLists();

  // Vehicle Build Recommendations Engine — "Recommended for Your Build," an
  // additive section shown above regular results when a fleet build is
  // active. Never reorders or filters `products` below; see
  // docs/architecture/VEHICLE_BUILD_RECOMMENDATIONS.md.
  const { activeBuild, addProductToActiveBuild } = useFleetBuilds();
  const { activeProject } = useFleetProject();
  const { companyStandards } = useDepartmentStandards();
  const { getCurrentStepId } = useUpfitBuilder();
  const effectiveStandard = activeBuild ? resolveEffectiveStandard(activeBuild, activeProject, companyStandards) : null;
  const currentGuidedStepId = activeBuild ? getCurrentStepId(activeBuild.id) : null;
  const currentStepCategoryId = upfitCategoryParam
    ?? (isCategoryStep(currentGuidedStepId) ? currentGuidedStepId : null);

  const recommendedForBuild = activeBuild
    ? resolveRecommendationProducts(
      generateRecommendations(catalogService.listProducts(), {
        build: activeBuild,
        standard: effectiveStandard,
        currentStepCategoryId,
        relatedProductIds: resolveRelatedProductIdsForBuild(activeBuild, { getProduct: catalogService.getProduct }),
      }, { limit: MAX_RECOMMENDED_FOR_SEARCH }),
      catalogService.getProduct,
    )
    : [];

  function handleAddRecommendedProduct(recommendedProduct, recommendation) {
    if (!activeBuild || !recommendation.matchingCategoryId) return;
    addProductToActiveBuild(recommendation.matchingCategoryId, recommendedProduct);
  }

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

      {isGuidedBuildContext && (
        <div style={{ background: '#eef1f8', borderBottom: '1px solid #dbe1f0' }} data-testid="guided-build-browse-banner">
          <div className="max-w-7xl mx-auto px-6 py-3" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <ListChecks size={15} color="#1a2744" />
            <p style={{ fontSize: 13, color: '#1a2744', margin: 0, flex: 1 }}>
              {upfitCategoryParam
                ? <>Recommended for this build's <strong>{getUpfitCategoryLabel(upfitCategoryParam)}</strong> step.</>
                : 'Recommended for this build.'}
            </p>
            <Link to="/upfit-builder" style={{ fontSize: 12, fontWeight: 700, color: '#1a2744', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <ArrowLeft size={12} /> Back to Guided Build
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-10">
        {recommendedForBuild.length > 0 && (
          <div style={{ marginBottom: '2rem' }} data-testid="recommended-for-your-build-section">
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#1a2744', margin: '0 0 12px' }}>
              Recommended for Your Build
            </p>
            <RecommendationCardGrid>
              {recommendedForBuild.map(({ recommendation, product }) => (
                <RecommendationCard
                  key={product.id}
                  recommendation={recommendation}
                  product={product}
                  onAddToBuild={recommendation.matchingCategoryId ? handleAddRecommendedProduct : undefined}
                  addLabel="Add to Active Build"
                />
              ))}
            </RecommendationCardGrid>
          </div>
        )}
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
