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
    <div className="min-h-screen bg-white">
      <PrototypeBanner />
      <SiteHeader activeVertical={verticalId} />

      <VerticalHero hero={hero} />

      {/* Featured Article */}
      {featured_article && (
        <div className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <SectionLabel text={featured_article.eyebrow} />
                <h2 className="font-heading mb-4 text-3xl font-bold uppercase leading-tight text-[#0F0F0F]">
                  {featured_article.title}
                </h2>
                <p className="font-body mb-5 leading-relaxed text-gray-600">
                  {featured_article.body}
                </p>
                {featured_article.cta && <RedLink href={featured_article.cta.href}>{featured_article.cta.label}</RedLink>}
              </div>
              {featured_article.image && (
                <div className="overflow-hidden rounded-md" style={{ height: 260 }}>
                  <img src={featured_article.image} alt={featured_article.imageAlt || ''} className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Featured Products */}
      {featured && (
        <div className="border-t border-b border-gray-100 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <SectionLabel text={featured.eyebrow} />
            <h2 className="font-heading mb-2 text-3xl font-bold uppercase text-[#0F0F0F]">{featured.title}</h2>
            {featured.subtitle && <p className="font-body mb-8 text-sm leading-relaxed text-gray-500">{featured.subtitle}</p>}
            <ProductCardGrid items={featured.items} columns={featuredCols} />
          </div>
        </div>
      )}

      {/* Category Grid */}
      {cats && (
        <div className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <h2 className="font-heading mb-2 text-3xl font-bold uppercase text-[#0F0F0F]">{cats.title}</h2>
            {cats.subtitle && <p className="font-body mb-8 text-sm leading-relaxed text-gray-500">{cats.subtitle}</p>}
            <CategoryIconGrid items={cats.items} columns={cats.items.length > 6 ? 4 : 3} />
            {cats.cta && (
              <div className="mt-8">
                <RedLink href={cats.cta.href}>{cats.cta.label}</RedLink>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Configurators */}
      {configs && (
        <div className="border-t border-b border-gray-100 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <SectionLabel text={configs.eyebrow} />
            <h2 className="font-heading mb-8 text-3xl font-bold uppercase text-[#0F0F0F]">{configs.title}</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {configs.items.map(c => {
                const Icon = ICON_MAP[c.icon] || Settings;
                return (
                  <a
                    key={c.label}
                    href={c.href}
                    target={c.external ? '_blank' : undefined}
                    rel={c.external ? 'noopener noreferrer' : undefined}
                    className="flex items-start gap-4 rounded-md border border-gray-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#C8102E] hover:shadow-md"
                  >
                    <Icon size={28} className="mt-0.5 flex-shrink-0 text-[#C8102E]" />
                    <div>
                      <p className="font-heading mb-1.5 font-bold uppercase text-[#0F0F0F]">{c.label}</p>
                      <p className="font-body text-sm leading-relaxed text-gray-500">{c.desc}</p>
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
        <div className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <SectionLabel text={contracts.eyebrow} />
            <h2 className="font-heading mb-8 text-3xl font-bold uppercase text-[#0F0F0F]">{contracts.title}</h2>
            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              {contracts.items.map(c => (
                <div key={c.label} className="rounded-md border border-gray-200 p-5">
                  <p className="font-heading mb-1.5 font-bold uppercase text-[#0F0F0F]">{c.label}</p>
                  <p className="font-body text-sm leading-relaxed text-gray-500">{c.desc}</p>
                </div>
              ))}
            </div>
            {contracts.cta && <RedLink href={contracts.cta.href}>{contracts.cta.label}</RedLink>}
          </div>
        </div>
      )}

      {/* Resources */}
      {resources && (
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <SectionLabel text={resources.eyebrow} />
                <h2 className="font-heading mb-3 text-3xl font-bold uppercase text-[#0F0F0F]">{resources.title}</h2>
                {resources.body && <p className="font-body mb-5 leading-relaxed text-gray-600">{resources.body}</p>}
                {resources.cta && <RedLink href={resources.cta.href}>{resources.cta.label}</RedLink>}
              </div>
              <div className="flex flex-col gap-4">
                {resources.items.map(r => {
                  const Icon = ICON_MAP[r.icon] || FileDown;
                  return (
                    <a
                      key={r.label}
                      href="#"
                      className="flex items-start gap-3 rounded-md border border-gray-200 bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:border-[#C8102E] hover:shadow-md"
                    >
                      <Icon size={18} className="mt-0.5 flex-shrink-0 text-[#C8102E]" />
                      <div>
                        <p className="font-heading mb-1 font-bold uppercase text-sm text-[#0F0F0F]">{r.label}</p>
                        <p className="font-body text-xs leading-relaxed text-gray-500">{r.desc}</p>
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
