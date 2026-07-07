import React from 'react';
import { useParams } from 'react-router-dom';
import { useCatalogVertical } from '@/hooks/useCatalog';
import SiteHeader from '@/components/navigator/SiteHeader';
import PrototypeBanner from '@/components/PrototypeBanner';
import DebugPanel from '@/components/DebugPanel';
import VerticalHero from '@/components/templates/VerticalHero';
import SectionLabel from '@/components/templates/SectionLabel';
import RedLink from '@/components/templates/RedLink';
import CategoryIconGrid from '@/components/templates/CategoryIconGrid';
import ProductCardGrid from '@/components/templates/ProductCardGrid';
import NotFound from '@/components/templates/NotFound';
import { Phone, FileDown, Settings, Shield } from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const ICON_MAP = { Phone, FileDown, Settings, Shield };

export function VerticalLandingTemplateView({ verticalId, data, loading, error }) {
  if (error) throw error;
  if (loading) return null;
  if (!data) return <NotFound type="vertical" backTo="/" backLabel="Return Home" />;

  const {
    hero,
    featured_article,
    featured_products_section: featured,
    categories_section: cats,
    configurators_section: configs,
    contracts_section: contracts,
    resources_section: resources,
  } = data;

  const featuredCols = featured?.items?.length <= 3 ? featured.items.length : 4;

  return (
    <div className="min-h-screen bg-white" style={FS}>
      <PrototypeBanner />
      <SiteHeader activeVertical={verticalId} />

      <VerticalHero hero={hero} />

      {/* Featured Article */}
      {featured_article && (
        <div className="max-w-7xl mx-auto px-6 py-14 md:py-20">
          <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '0 0 40%', minWidth: 280 }}>
              <SectionLabel text={featured_article.eyebrow} />
              <h2 style={{ fontSize: 'clamp(1.4rem,2.5vw,1.9rem)', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.25, marginBottom: '1rem' }}>
                {featured_article.title}
              </h2>
              <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                {featured_article.body}
              </p>
              {featured_article.cta && <RedLink href={featured_article.cta.href}>{featured_article.cta.label}</RedLink>}
            </div>
            {featured_article.image && (
              <div style={{ flex: 1, minWidth: 240 }}>
                <div className="overflow-hidden" style={{ height: 260 }}>
                  <img src={featured_article.image} alt={featured_article.imageAlt || ''} className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Featured Products */}
      {featured && (
        <div className="bg-gray-50 border-t border-b border-gray-100 py-14 md:py-20">
          <div className="max-w-7xl mx-auto px-6">
            <SectionLabel text={featured.eyebrow} />
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.4rem' }}>{featured.title}</h2>
            {featured.subtitle && <p style={{ fontSize: 14, color: '#777', marginBottom: '2rem' }}>{featured.subtitle}</p>}
            <ProductCardGrid items={featured.items} columns={featuredCols} />
          </div>
        </div>
      )}

      {/* Category Grid */}
      {cats && (
        <div className="max-w-7xl mx-auto px-6 py-14 md:py-20">
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.4rem' }}>{cats.title}</h2>
          {cats.subtitle && <p style={{ fontSize: 14, color: '#777', marginBottom: '2rem' }}>{cats.subtitle}</p>}
          <CategoryIconGrid items={cats.items} columns={cats.items.length > 6 ? 4 : 3} />
          {cats.cta && (
            <div style={{ marginTop: '2rem' }}>
              <RedLink href={cats.cta.href}>{cats.cta.label}</RedLink>
            </div>
          )}
        </div>
      )}

      {/* Configurators */}
      {configs && (
        <div className="bg-gray-50 border-t border-b border-gray-100 py-14 md:py-20">
          <div className="max-w-7xl mx-auto px-6">
            <SectionLabel text={configs.eyebrow} />
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '2rem' }}>{configs.title}</h2>
            <div className="landing-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {configs.items.map(c => {
                const Icon = ICON_MAP[c.icon] || Settings;
                return (
                  <a key={c.label} href={c.href} target={c.external ? '_blank' : undefined} rel={c.external ? 'noopener noreferrer' : undefined}
                    className="bg-white border border-gray-200 p-6 flex gap-4 items-start"
                    style={{ textDecoration: 'none', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#c8102e'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
                    <Icon size={28} color="#c8102e" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: '0.35rem' }}>{c.label}</p>
                      <p style={{ fontSize: 13, color: '#666', lineHeight: 1.55 }}>{c.desc}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Contracts / Where to Buy */}
      {contracts && (
        <div className="max-w-7xl mx-auto px-6 py-14 md:py-20">
          <SectionLabel text={contracts.eyebrow} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '2rem' }}>{contracts.title}</h2>
          <div className="pd-product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {contracts.items.map(c => (
              <div key={c.label} className="border border-gray-200 p-5">
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: '0.4rem' }}>{c.label}</p>
                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{c.desc}</p>
              </div>
            ))}
          </div>
          {contracts.cta && <RedLink href={contracts.cta.href}>{contracts.cta.label}</RedLink>}
        </div>
      )}

      {/* Resources */}
      {resources && (
        <div className="bg-gray-50 border-t border-gray-100 py-14 md:py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="landing-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
              <div>
                <SectionLabel text={resources.eyebrow} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.75rem' }}>{resources.title}</h2>
                {resources.body && <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, marginBottom: '1.25rem' }}>{resources.body}</p>}
                {resources.cta && <RedLink href={resources.cta.href}>{resources.cta.label}</RedLink>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {resources.items.map(r => {
                  const Icon = ICON_MAP[r.icon] || FileDown;
                  return (
                    <a key={r.label} href="#"
                      className="bg-white border border-gray-200 p-4 flex gap-3 items-start"
                      style={{ textDecoration: 'none', transition: 'border-color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#c8102e'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
                      <Icon size={18} color="#c8102e" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: '0.2rem' }}>{r.label}</p>
                        <p style={{ fontSize: 12, color: '#777', lineHeight: 1.55 }}>{r.desc}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <DebugPanel />
    </div>
  );
}
export default function VerticalLandingTemplate() {
  const { verticalId } = useParams();
  const { data, loading, error } = useCatalogVertical(verticalId);

  return (
    <VerticalLandingTemplateView
      verticalId={verticalId}
      data={data}
      loading={loading}
      error={error}
    />
  );
}
