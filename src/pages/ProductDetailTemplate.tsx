import React, { useEffect } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import SiteHeader from '@/components/navigator/SiteHeader';
import DebugPanel from '@/components/DebugPanel';
import NotFound from '@/components/templates/NotFound';
import NavigatorTabsUntyped from '@/components/navigator/NavigatorTabs';
import ProductTabs from '@/components/product/ProductTabs';
import ProductHero from '@/components/product/ProductHero';
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb';
import ProductCommerceSummary from '@/components/product/ProductCommerceSummary';
import StorefrontProductPanel from '@/components/product/StorefrontProductPanel';
import CommerceActionPanel from '@/components/product/CommerceActionPanel';
import FitmentSummary from '@/components/product/FitmentSummary';
import FinishYourUpfitPanel from '@/components/fleetBuilds/FinishYourUpfitPanel';
import ProductIntelligencePanel from '@/components/product/ProductIntelligencePanel';
import RelatedPackages from '@/components/product/RelatedPackages';
import RecommendedProducts from '@/components/product/RecommendedProducts';
import RecentlyViewedProducts from '@/components/product/RecentlyViewedProducts';
import SectionHeadingUntyped from '@/components/product/SectionHeading';
import { useCatalogCategory, useCatalogProduct } from '@/hooks/useCatalog';
import { useConfiguratorData } from '@/hooks/useConfiguratorData';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';

import { Clock, Phone } from 'lucide-react';

import ConfiguratorExperience from '@/components/configurator/ConfiguratorExperience';
import type { Category, CategoryProductCard, Product } from '@/types';

const FS = { fontFamily: "'Inter',sans-serif" };

// NavigatorTabs and SectionHeading are shared, still-JS components outside
// this conversion's scope. Both destructure their props with no defaults, so
// an untyped import would infer every prop as required — cast to the actual
// (optional) contract each is used with here, without touching either file.
const NavigatorTabs = NavigatorTabsUntyped as ComponentType<{ defaultTab?: string; productData?: Product }>;
const SectionHeading = SectionHeadingUntyped as ComponentType<{
  icon?: ComponentType<{ size?: number }>;
  children?: ReactNode;
  description?: string;
}>;

interface ProductComingSoonProps {
  product: CategoryProductCard;
  verticalId: string | undefined;
  categoryId: string | undefined;
}

function ProductComingSoon({ product, verticalId, categoryId }: ProductComingSoonProps) {
  return (
    <div className="min-h-screen bg-white" style={FS}>
      <SiteHeader activeVertical={verticalId} activeCategory={categoryId} />
      <ProductBreadcrumb crumbs={[
        { label: 'Home', to: '/' },
        { label: verticalId?.replace(/-/g, ' '), to: `/${verticalId}` },
        { label: product.label, to: `/${verticalId}/${categoryId}` },
        { label: product.label }
      ]} />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="product-coming-soon-grid grid grid-cols-2 gap-12 items-start">
          {product.image && (
            <div className="border border-gray-200 flex items-center justify-center bg-white overflow-hidden" style={{ height: 380 }}>
              <img src={product.image} alt={product.label} className="max-h-full max-w-full object-contain" />
            </div>
          )}
          <div>
            <h1 className="font-heading uppercase font-bold text-[#0f0f0f] mb-3" style={{ fontSize: 'clamp(1.3rem,2.5vw,1.8rem)' }}>{product.label}</h1>
            {product.tagline && <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, marginBottom: '1rem' }}>{product.tagline}</p>}
            {product.badges?.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {product.badges.map(b => (
                  <span key={b} style={{ fontSize: 11, fontWeight: 700, background: '#f0f4ff', color: '#1a2744', padding: '3px 8px', letterSpacing: '0.05em' }}>{b}</span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: '#fff8e1', border: '1px solid #ffe082', marginBottom: '1.5rem' }}>
              <Clock size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: '#78350f', margin: 0 }}>Detailed product configuration is being prepared. Check back soon.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to={`/${verticalId}/${categoryId}`}
                style={{ fontSize: 14, fontWeight: 700, color: '#1a2744', border: '2px solid #1a2744', padding: '10px 20px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                ← Back to {categoryId?.replace(/-/g, ' ')}
              </Link>
              <a href="#"
                style={{ fontSize: 14, fontWeight: 700, color: '#fff', background: '#c8102e', padding: '11px 20px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <Phone size={16} /> Request a Quote
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ConfiguratorSectionProps {
  configuratorId: string;
  verticalId: string | undefined;
  categoryId: string | undefined;
  packageId: string | undefined;
}

function ConfiguratorSection({ configuratorId, verticalId, categoryId, packageId }: ConfiguratorSectionProps) {
  const { data: configuratorData } = useConfiguratorData(configuratorId);
  if (!configuratorData) return null;

  return (
    <div className="border-t border-gray-200 bg-gray-50" id="build-configure">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12">
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

interface ProductDetailTemplateViewProps {
  verticalId: string | undefined;
  categoryId: string | undefined;
  productId: string | undefined;
  product: Product | null;
  productLoading: boolean;
  productError: unknown;
  category: Category | null;
  categoryLoading: boolean;
  categoryError: unknown;
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
}: ProductDetailTemplateViewProps) {
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
    <div className="min-h-screen bg-white text-gray-900" style={FS}>
      <SiteHeader activeVertical={verticalId || data.verticals?.[0]} activeCategory={data.category} />
      <ProductBreadcrumb crumbs={breadcrumbs || [{ label: 'Home', to: '/' }, { label: title }]} />

      <ProductHero
        title={title}
        subtitle={data.subtitle}
        description={data.description}
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
              <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12">
                <SectionHeading>Specifications</SectionHeading>
                <div className="overflow-hidden rounded-md border border-gray-200">
                  <table className="w-full text-[13px]" style={{ borderCollapse: 'collapse' }}>
                    <tbody>
                      {Object.entries(data.specifications).map(([k, v], i) => (
                        <tr key={k} className={`border-b border-gray-200 last:border-b-0 ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                          <td className="w-[35%] px-4 py-2.5 font-semibold capitalize text-[#0f0f0f]">{k.replace(/_/g, ' ')}</td>
                          <td className="px-4 py-2.5 text-gray-600">{Array.isArray(v) ? v.join(', ') : String(v)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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

      <DebugPanel />
    </div>
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
