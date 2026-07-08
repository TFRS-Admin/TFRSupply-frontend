import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Phone, ShieldCheck, Award, Settings2, Headphones } from 'lucide-react';
import SiteHeader from '@/components/navigator/SiteHeader';
import PrototypeBanner from '@/components/PrototypeBanner';
import ProductCard from '@/components/product/ProductCard';
import RecentlyViewedProducts from '@/components/product/RecentlyViewedProducts';
import SavedProductsSection from '@/components/product/SavedProductsSection';
import HomeHero from '@/components/templates/HomeHero';
import VerticalRoutingGrid from '@/components/templates/VerticalRoutingGrid';
import { toProductCardViewModel } from '@/pages/ProductSearchPage';
import { useCatalogLists } from '@/hooks/useCatalog';
import { NAV_VERTICALS } from '@/config/navigationVerticals';
import { loadVendor } from '@/lib/dataLoader';

const HERO_IMAGES = NAV_VERTICALS.filter((v) => v.path).map((v) => v.image);

const HERO_COPY = {
  eyebrow: 'TFR Supply — Pro Shop',
  title: 'Emergency Lighting & Warning Equipment Built for the Job',
  subtitle:
    'Shop light bars, sirens, and warning systems for Police, Fire/EMS, and Work Truck fleets — then configure the exact build your vehicle needs.',
  primaryCta: { label: 'Shop All Products', to: '/search' },
  secondaryCta: { label: 'Configure Your Equipment', to: '/fire/light-bars/navigator' },
};

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    label: 'Built for First Responders',
    desc: 'Warning lights, sirens, and controls engineered for the demands of police, fire, and EMS duty.',
  },
  {
    icon: Award,
    label: 'NFPA & DOT Compliant',
    desc: 'Products built to meet the compliance standards your agency or fleet is required to hold.',
  },
  {
    icon: Settings2,
    label: 'Configure Exactly What You Need',
    desc: 'Use our vehicle configurator to build a lighting and siren package matched to your exact vehicle.',
  },
  {
    icon: Headphones,
    label: 'Dedicated Fleet Support',
    desc: 'Call 800-621-9959 for help choosing products, replacement parts, or order support.',
  },
];

/**
 * Pure view for the homepage — data-fetching is kept in the default export
 * so this can be rendered directly in tests with fixture props, matching the
 * VerticalLandingTemplateView split used elsewhere in src/pages.
 */
export function StoreLandingView({ products = [], categories = [] }) {
  const featuredProducts = products.slice(0, 4);
  const featuredCategories = categories.filter((category) => category.verticalId);
  const primaryVendor = loadVendor('federal-signal');

  return (
    <div className="min-h-screen bg-white font-body text-[#0f0f0f]">
      <PrototypeBanner />
      <SiteHeader activeVertical={null} />

      <HomeHero {...HERO_COPY} images={HERO_IMAGES} />

      <SavedProductsSection />
      <RecentlyViewedProducts />

      {/* Vertical routing */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <p className="font-heading mb-2 text-xs font-bold uppercase tracking-[0.14em] text-gray-500">Shop by Vertical</p>
        <div className="mb-4 h-[3px] w-10 bg-[#c8102e]" />
        <h2 className="font-heading mb-8 text-2xl font-bold uppercase tracking-tight text-[#0f0f0f] md:text-3xl">
          Find Warning Equipment for Your Fleet
        </h2>
        <VerticalRoutingGrid verticals={NAV_VERTICALS} />
      </div>

      {/* Featured categories */}
      {featuredCategories.length > 0 && (
        <div className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-6">
            <p className="font-heading mb-2 text-xs font-bold uppercase tracking-[0.14em] text-gray-500">Shop by Category</p>
            <div className="mb-4 h-[3px] w-10 bg-[#c8102e]" />
            <h2 className="font-heading mb-8 text-2xl font-bold uppercase tracking-tight text-[#0f0f0f] md:text-3xl">
              Featured Categories
            </h2>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/${category.verticalId}/${category.id}`}
                  className="group block overflow-hidden rounded-md border border-gray-200 bg-white transition-all duration-200 hover:border-[#c8102e] hover:shadow-lg"
                >
                  {category.image?.src && (
                    <div className="h-36 overflow-hidden">
                      <img
                        src={category.image.src}
                        alt={category.image.alt || category.label}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="font-heading mb-1 text-sm font-bold uppercase tracking-tight text-[#0f0f0f]">{category.label}</p>
                    {category.description && (
                      <p className="font-body line-clamp-2 text-xs leading-relaxed text-gray-500">{category.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Featured products */}
      {featuredProducts.length > 0 && (
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="font-heading mb-2 text-xs font-bold uppercase tracking-[0.14em] text-gray-500">New &amp; Featured</p>
          <div className="mb-4 h-[3px] w-10 bg-[#c8102e]" />
          <h2 className="font-heading mb-8 text-2xl font-bold uppercase tracking-tight text-[#0f0f0f] md:text-3xl">
            Featured Products
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...toProductCardViewModel(product)} />
            ))}
          </div>
        </div>
      )}

      {/* Trusted brands & partners */}
      <div className="border-y border-gray-100 bg-gray-50 py-14">
        <div className="mx-auto max-w-7xl px-6">
          <p className="font-heading mb-2 text-xs font-bold uppercase tracking-[0.14em] text-gray-500">Authorized Partners</p>
          <div className="mb-8 h-[3px] w-10 bg-[#c8102e]" />
          <div className="flex flex-wrap items-center gap-6">
            {primaryVendor && (
              <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-white px-6 py-4">
                <span className="inline-block h-8 w-1.5 bg-[#d97706]" />
                <div>
                  <p className="font-heading text-lg font-bold uppercase tracking-tight text-[#0f0f0f]">{primaryVendor.name}</p>
                  <p className="font-body text-xs font-semibold uppercase tracking-wide text-gray-400">Authorized Dealer</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trust / why-buy */}
      <div className="bg-[#0f0f0f] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <p className="font-heading mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#d97706]">Why TFR Supply</p>
          <h2 className="font-heading mb-10 text-2xl font-bold uppercase tracking-tight text-white md:text-3xl">
            Built for Fleets That Can&apos;t Afford to Fail
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST_POINTS.map((point) => {
              const Icon = point.icon;
              return (
                <div key={point.label} className="rounded-md border border-white/10 p-5">
                  <Icon size={28} className="mb-3 text-[#c8102e]" />
                  <p className="font-heading mb-2 text-sm font-bold uppercase tracking-tight text-white">{point.label}</p>
                  <p className="font-body text-xs leading-relaxed text-gray-400">{point.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA band */}
      <div className="bg-[#c8102e] py-14">
        <div className="mx-auto max-w-4xl px-6">
          <p className="font-heading mb-3 text-xs font-bold uppercase tracking-[0.14em] text-white/80">Need Assistance?</p>
          <h2 className="font-heading mb-3 text-2xl font-bold uppercase tracking-tight text-white md:text-3xl">
            Talk to a Fleet Equipment Specialist
          </h2>
          <p className="font-body mb-8 max-w-xl text-sm text-white/90">
            Questions about a build, a part, or which configuration fits your vehicle? Call our team — support, replacement parts, and expert guidance are one call away.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="tel:800-621-9959"
              className="font-heading inline-flex items-center gap-2 rounded-sm bg-white px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-[#c8102e] transition-colors hover:bg-red-50"
            >
              <Phone size={14} /> Call 800-621-9959
            </a>
            <Link
              to="/resources"
              className="font-heading inline-flex items-center gap-2 rounded-sm border border-white/40 px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-white/10"
            >
              Browse Resources <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StoreLanding() {
  const { products, categories } = useCatalogLists();
  return <StoreLandingView products={products} categories={categories} />;
}
