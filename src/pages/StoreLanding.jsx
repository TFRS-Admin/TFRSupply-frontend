import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Phone, ShieldCheck, Award, Settings2, Headphones } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import RecentlyViewedProducts from '@/components/product/RecentlyViewedProducts';
import SavedProductsSection from '@/components/product/SavedProductsSection';
import { toProductCardViewModel } from '@/pages/ProductSearchPage';
import { useCatalogLists } from '@/hooks/useCatalog';
import { NAV_VERTICALS } from '@/config/navigationVerticals';
import { PageLayout, ActionCard, InfoCard } from '@/components/design-system';

const HERO_IMAGES = NAV_VERTICALS.filter((v) => v.path).map((v) => v.image);

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

  return (
    <PageLayout background="white" fullBleed activeVertical={null}>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: '#0d1b2e' }}>
        <div className="absolute inset-0 grid grid-cols-3 opacity-20">
          {HERO_IMAGES.map((img) => (
            <img key={img} src={img} alt="" className="w-full h-full object-cover" />
          ))}
        </div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, #0d1b2e 40%, rgba(13,27,46,0.75) 100%)' }} />
        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">
          <p className="text-xs font-bold tracking-widest uppercase text-red-400 mb-3">TFR Supply — Pro Shop</p>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight max-w-2xl mb-5">
            Emergency Lighting &amp; Warning Equipment Built for the Job
          </h1>
          <p className="text-gray-300 text-base md:text-lg max-w-xl leading-relaxed mb-8">
            Shop light bars, sirens, and warning systems for Police, Fire/EMS, and Work Truck fleets — then configure the exact build your vehicle needs.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 bg-[#c8102e] hover:bg-[#a50d25] text-white font-bold px-6 py-3 text-sm transition-colors"
            >
              Shop All Products <ArrowRight size={16} />
            </Link>
            <Link
              to="/fire/light-bars/navigator"
              className="inline-flex items-center gap-2 border border-white/30 hover:bg-white/10 text-white font-bold px-6 py-3 text-sm transition-colors"
            >
              Configure Your Equipment
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: '#c8102e' }} />
      </div>

      <SavedProductsSection />
      <RecentlyViewedProducts />

      {/* Vertical navigation cards */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Shop by Vertical</p>
        <div className="w-10 mb-4" style={{ height: 3, background: '#c8102e' }} />
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8">Find Warning Equipment for Your Fleet</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {NAV_VERTICALS.map((vertical) => (
            <ActionCard
              key={vertical.id}
              to={vertical.path}
              disabled={!vertical.path}
              image={vertical.image}
              imageAlt={vertical.imageAlt}
              title={vertical.label}
              description={vertical.tagline}
            />
          ))}
        </div>
      </div>

      {/* Featured categories */}
      {featuredCategories.length > 0 && (
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Shop by Category</p>
            <div className="w-10 mb-4" style={{ height: 3, background: '#c8102e' }} />
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8">Featured Categories</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredCategories.map((category) => (
                <ActionCard
                  key={category.id}
                  to={`/${category.verticalId}/${category.id}`}
                  image={category.image?.src}
                  imageAlt={category.image?.alt || category.label}
                  title={category.label}
                  description={category.description}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Featured products */}
      {featuredProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 py-16">
          <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">New &amp; Featured</p>
          <div className="w-10 mb-4" style={{ height: 3, background: '#c8102e' }} />
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8">Featured Products</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...toProductCardViewModel(product)} />
            ))}
          </div>
        </div>
      )}

      {/* Trust / why-buy */}
      <div className="py-16" style={{ background: '#0d1b2e' }}>
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs font-bold tracking-widest uppercase text-red-400 mb-2">Why TFR Supply</p>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-10">Built for Fleets That Can&apos;t Afford to Fail</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_POINTS.map((point) => (
              <InfoCard key={point.label} tone="dark" icon={point.icon} title={point.label} description={point.desc} />
            ))}
          </div>
        </div>
      </div>

      {/* CTA band */}
      <div className="py-14" style={{ background: '#c8102e' }}>
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs font-bold tracking-widest uppercase text-white/80 mb-3">Need Assistance?</p>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Talk to a Fleet Equipment Specialist</h2>
          <p className="text-white/90 text-sm mb-8 max-w-xl">
            Questions about a build, a part, or which configuration fits your vehicle? Call our team — support, replacement parts, and expert guidance are one call away.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <a
              href="tel:800-621-9959"
              className="inline-flex items-center gap-2 bg-white text-[#c8102e] font-bold px-6 py-2.5 text-sm hover:bg-red-50 transition-colors"
            >
              <Phone size={14} /> Call 800-621-9959
            </a>
            <Link
              to="/resources"
              className="inline-flex items-center gap-2 border border-white/40 text-white font-bold px-6 py-2.5 text-sm hover:bg-white/10 transition-colors"
            >
              Browse Resources <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default function StoreLanding() {
  const { products, categories } = useCatalogLists();
  return <StoreLandingView products={products} categories={categories} />;
}
