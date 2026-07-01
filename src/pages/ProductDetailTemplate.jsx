import React from 'react';
import { useParams, Link } from 'react-router-dom';
import SiteHeader from '@/components/navigator/SiteHeader';
import PrototypeBanner from '@/components/PrototypeBanner';
import PrototypeFooter from '@/components/PrototypeFooter';
import DebugToggle from '@/components/DebugToggle';
import DebugPanel from '@/components/DebugPanel';
import NotFound from '@/components/templates/NotFound';
import NavigatorTabs from '@/components/navigator/NavigatorTabs';
import ProductTabs from '@/components/product/ProductTabs';
import ProductHero from '@/components/product/ProductHero';
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb';
import { useCatalogCategory, useCatalogProduct } from '@/hooks/useCatalog';
import { configuratorService } from '@/services/configurator';

import { Clock, Phone } from 'lucide-react';

import ConfiguratorModule from '@/components/configurator/ConfiguratorModule';


const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

function ProductComingSoon({ product, verticalId, categoryId }) {
  return (
    <div className="min-h-screen bg-white" style={FS}>
      <PrototypeBanner />
      <SiteHeader activeVertical={verticalId} activeCategory={categoryId} />
      <ProductBreadcrumb crumbs={[
        { label: 'Home', to: '/' },
        { label: verticalId?.replace(/-/g, ' '), to: `/${verticalId}` },
        { label: product.label, to: `/${verticalId}/${categoryId}` },
        { label: product.label }
      ]} />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'flex-start' }}>
          {product.image && (
            <div className="border border-gray-200 flex items-center justify-center bg-white overflow-hidden" style={{ height: 380 }}>
              <img src={product.image} alt={product.label} className="max-h-full max-w-full object-contain" />
            </div>
          )}
          <div>
            <h1 style={{ fontSize: 'clamp(1.3rem,2.5vw,1.8rem)', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.75rem' }}>{product.label}</h1>
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
      <PrototypeFooter />
    </div>
  );
}

function ConfiguratorSection({ configuratorId, verticalId, categoryId }) {
  const configuratorData = configuratorService.getConfigurator(configuratorId);
  if (!configuratorData) return null;

  return (
    <div className="border-t border-gray-100 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a2744', borderBottom: '2px solid #1a2744', paddingBottom: 6, marginBottom: 20 }}>
          Build &amp; Configure
        </p>
        <ConfiguratorModule
          configuratorData={configuratorData}
          verticalId={verticalId}
          categoryId={categoryId}
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
    <div className="min-h-screen bg-white text-gray-900" style={FS}>
      <PrototypeBanner />
      <SiteHeader activeVertical={verticalId || data.verticals?.[0]} activeCategory={data.category} />
      <ProductBreadcrumb crumbs={breadcrumbs || [{ label: 'Home', to: '/' }, { label: title }]} />

      <ProductHero
        title={title}
        subtitle={data.subtitle}
        bullets={data.summary_bullets ?? marketing?.features ?? []}
        images={heroImages}
        actions={data.actions ?? heroActions}
        tabs={data.hero_tabs ?? []}
        actionLabels={{ configurator: 'Configure This Product', manual: 'Download Manual' }}
      />

      {/* Product Tabs */}
      {data.tabs_component === 'NavigatorTabs' ? (
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-0">
            <NavigatorTabs />
          </div>
        </div>
      ) : data.tabs_component === 'ProductTabs' ? (
        <div className="border-t border-gray-200 bg-white">
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
              <div className="max-w-7xl mx-auto px-6 py-10">
                <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a2744', borderBottom: '2px solid #1a2744', paddingBottom: 6, marginBottom: 12 }}>Specifications</p>
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <tbody>
                    {Object.entries(data.specifications).map(([k, v], i) => (
                      <tr key={k} style={{ background: i % 2 === 0 ? '#f7f8fa' : '#fff' }}>
                        <td style={{ padding: '7px 12px', fontWeight: 600, color: '#1a1a1a', width: '35%', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</td>
                        <td style={{ padding: '7px 12px', color: '#444' }}>{Array.isArray(v) ? v.join(', ') : String(v)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {data.configuratorId && (
            <ConfiguratorSection
              configuratorId={data.configuratorId}
              verticalId={verticalId || data.verticals?.[0]}
              categoryId={categoryId || data.category}
            />
          )}
        </>
      )}

      <PrototypeFooter />
      <DebugToggle />
      <DebugPanel />
    </div>
  );
}

export default function ProductDetailTemplate() {
  const { verticalId, categoryId, productId } = useParams();
  const productState = useCatalogProduct(productId);
  const categoryState = useCatalogCategory(categoryId);

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
