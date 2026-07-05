import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import DebugToggle from '@/components/DebugToggle';
import DebugPanel from '@/components/DebugPanel';
import NotFound from '@/components/templates/NotFound';
import NavigatorTabs from '@/components/navigator/NavigatorTabs';
import ProductTabs from '@/components/product/ProductTabs';
import ProductHero from '@/components/product/ProductHero';
import ProductCommerceSummary from '@/components/product/ProductCommerceSummary';
import StorefrontProductPanel from '@/components/product/StorefrontProductPanel';
import CommerceActionPanel from '@/components/product/CommerceActionPanel';
import FitmentSummary from '@/components/product/FitmentSummary';
import FinishYourUpfitPanel from '@/components/fleetBuilds/FinishYourUpfitPanel';
import ProductIntelligencePanel from '@/components/product/ProductIntelligencePanel';
import RelatedPackages from '@/components/product/RelatedPackages';
import RecommendedProducts from '@/components/product/RecommendedProducts';
import RecentlyViewedProducts from '@/components/product/RecentlyViewedProducts';
import SectionHeading from '@/components/product/SectionHeading';
import { useCatalogCategory, useCatalogProduct } from '@/hooks/useCatalog';
import { useConfiguratorData } from '@/hooks/useConfiguratorData';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';

import { Clock, Phone } from 'lucide-react';

import ConfiguratorExperience from '@/components/configurator/ConfiguratorExperience';
import { PageLayout, PropertyGrid, StatusBadge, CTAButton } from '@/components/design-system';

function ProductComingSoon({ product, verticalId, categoryId }) {
  return (
    <PageLayout
      background="white"
      fullBleed
      crumbs={[
        { label: 'Home', to: '/' },
        { label: verticalId?.replace(/-/g, ' '), to: `/${verticalId}` },
        { label: product.label, to: `/${verticalId}/${categoryId}` },
        { label: product.label },
      ]}
      activeVertical={verticalId}
      activeCategory={categoryId}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="product-coming-soon-grid grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {product.image && (
            <div className="border border-gray-200 flex items-center justify-center bg-white overflow-hidden h-[380px]">
              <img src={product.image} alt={product.label} className="max-h-full max-w-full object-contain" />
            </div>
          )}
          <div>
            <h1 className="text-[clamp(1.3rem,2.5vw,1.8rem)] font-bold text-gray-900 mb-3">{product.label}</h1>
            {product.tagline && <p className="text-sm text-gray-600 leading-relaxed mb-4">{product.tagline}</p>}
            {product.badges?.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mb-6">
                {product.badges.map((b) => <StatusBadge key={b} status={b} label={b} tone="info" compact />)}
              </div>
            )}
            <div className="flex items-center gap-2.5 px-4 py-3.5 bg-amber-50 border border-amber-200 mb-6 rounded-md">
              <Clock size={18} className="text-amber-500 shrink-0" />
              <p className="text-[13px] text-amber-900 m-0">Detailed product configuration is being prepared. Check back soon.</p>
            </div>
            <div className="flex flex-col gap-2.5">
              <CTAButton variant="outline" to={`/${verticalId}/${categoryId}`}>
                ← Back to {categoryId?.replace(/-/g, ' ')}
              </CTAButton>
              <CTAButton variant="primary" href="#" icon={Phone} iconPosition="leading">
                Request a Quote
              </CTAButton>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

function ConfiguratorSection({ configuratorId, verticalId, categoryId, packageId }) {
  const { data: configuratorData } = useConfiguratorData(configuratorId);
  if (!configuratorData) return null;

  return (
    <div className="border-t border-gray-100 bg-gray-50" id="build-configure">
      <div className="max-w-7xl mx-auto px-6 py-8 sm:py-10">
        <SectionHeading description="Select a base model and options below to build a fitment-checked, priced configuration for this product.">
          Build &amp; Configure
        </SectionHeading>
        <ConfiguratorExperience
          configuratorData={configuratorData}
          verticalId={verticalId}
          categoryId={categoryId}
          packageId={packageId}
        />
      </div>
    </div>
  );
}

export function ProductDetailTemplateView({
  verticalId,
  categoryId,
  productId,
  product,
  productLoading,
  productError,
  category,
  categoryLoading,
  categoryError,
}) {
  if (productLoading || (!product && categoryLoading)) return null;
  if (productError) throw productError;

  if (!product) {
    if (categoryError) throw categoryError;
    const stub = category?.products?.find(p => p.id === productId);
    if (stub) return <ProductComingSoon product={stub} verticalId={verticalId} categoryId={categoryId} />;
    return <NotFound type="product" backTo={`/${verticalId}/${categoryId}`} backLabel="Return to Category" />;
  }

  const data = product;
  const { title, breadcrumbs, media, marketing, cta } = data;
  const heroImages = media?.gallery?.length
    ? media.gallery
    : media?.hero
      ? [{ src: media.hero, alt: title || 'Product image' }]
      : [];
  const heroActions = {
    whereToBuyUrl: cta?.where_to_buy_url,
    requestInfoUrl: cta?.request_info_url,
    configuratorUrl: cta?.configurator_url,
    manualUrl: cta?.manual_url,
  };

  return (
    <PageLayout
      background="white"
      fullBleed
      activeVertical={verticalId || data.verticals?.[0]}
      activeCategory={data.category}
      crumbs={breadcrumbs || [{ label: 'Home', to: '/' }, { label: title }]}
    >
      <ProductHero
        title={title}
        subtitle={data.subtitle}
        bullets={data.summary_bullets ?? marketing?.features ?? []}
        images={heroImages}
        actions={data.actions ?? heroActions}
        tabs={data.hero_tabs ?? []}
        actionLabels={{ configurator: 'Configure This Product', manual: 'Download Manual' }}
        infoPanel={<ProductCommerceSummary product={data} />}
      />

      <CommerceActionPanel product={data} />

      <div className="max-w-7xl mx-auto px-6 pt-6">
        <StorefrontProductPanel product={data} />
      </div>

      {/* Product Tabs */}
      {data.tabs_component === 'NavigatorTabs' ? (
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-0">
            <NavigatorTabs />
          </div>
        </div>
      ) : data.tabs_component === 'ProductTabs' ? (
        <div className="border-t border-gray-200 bg-white" id="build-configure">
          <div className="max-w-7xl mx-auto px-6 py-0">
            <ProductTabs
              productData={data}
              verticalId={verticalId || data.verticals?.[0]}
              categoryId={categoryId || data.category}
            />
          </div>
        </div>
      ) : (
        <>
          {data.specifications && Object.keys(data.specifications).length > 0 && (
            <div className="border-t border-gray-200 bg-white">
              <div className="max-w-7xl mx-auto px-6 py-8 sm:py-10">
                <SectionHeading>Specifications</SectionHeading>
                <PropertyGrid
                  columns={2}
                  items={Object.entries(data.specifications).map(([k, v]) => ({
                    label: k.replace(/_/g, ' '),
                    value: Array.isArray(v) ? v.join(', ') : String(v),
                  }))}
                />
              </div>
            </div>
          )}
          {data.configuratorId && (
            <ConfiguratorSection
              configuratorId={data.configuratorId}
              verticalId={verticalId || data.verticals?.[0]}
              categoryId={categoryId || data.category}
              packageId={data.commerce?.related_packages?.[0]}
            />
          )}
        </>
      )}

      <FitmentSummary product={data} />
      <FinishYourUpfitPanel product={data} />
      <ProductIntelligencePanel
        product={data}
        verticalId={verticalId || data.verticals?.[0]}
        categoryId={categoryId || data.category}
      />
      <RelatedPackages product={data} />
      <RecommendedProducts
        product={data}
        verticalId={verticalId || data.verticals?.[0]}
        categoryId={categoryId || data.category}
      />
      <RecentlyViewedProducts excludeProductId={data.id} />

      <DebugToggle />
      <DebugPanel />
    </PageLayout>
  );
}

export default function ProductDetailTemplate() {
  const { verticalId, categoryId, productId } = useParams();
  const productState = useCatalogProduct(productId);
  const categoryState = useCatalogCategory(categoryId);
  const { trackView } = useRecentlyViewed();

  useEffect(() => {
    if (productState.data) trackView(productState.data.id);
  }, [productState.data, trackView]);

  return (
    <ProductDetailTemplateView
      verticalId={verticalId}
      categoryId={categoryId}
      productId={productId}
      product={productState.data}
      productLoading={productState.loading}
      productError={productState.error}
      category={categoryState.data}
      categoryLoading={categoryState.loading}
      categoryError={categoryState.error}
    />
  );
}
