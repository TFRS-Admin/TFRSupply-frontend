/**
 * pages/WorkspaceDashboard.jsx — Project Workspace at /workspace.
 *
 * A client-side dashboard that lets a customer see everything they've
 * gathered while planning a vehicle build — saved products, recently
 * viewed items, the compare queue, cart summary, selected vehicle, and an
 * in-progress configuration — in one place. This is composition only: every
 * section reads from the existing SavedProducts/RecentlyViewed/Compare/
 * Vehicle/Configurator contexts, the Cart Workspace's useMiniCart(), and
 * catalogService.getProduct() — the same read paths SavedProductsPage,
 * ComparePage, and the homepage sections already use. No new persistence,
 * pricing, commerce, or configurator logic is introduced, and no
 * authentication or account system backs this page — it is not a CRM.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock, GitCompare, ShoppingCart, Truck, Settings2, FileText, ArrowRight, X } from 'lucide-react';
import SiteHeader from '@/components/navigator/SiteHeader';
import PrototypeBanner from '@/components/PrototypeBanner';
import PrototypeFooter from '@/components/PrototypeFooter';
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb';
import ProductCard from '@/components/product/ProductCard';
import VehicleSelectorModal from '@/components/navigator/VehicleSelectorModal';
import { useSavedProducts } from '@/context/SavedProductsContext';
import { useRecentlyViewed } from '@/context/RecentlyViewedContext';
import { useCompare, MAX_COMPARE_PRODUCTS } from '@/context/CompareContext';
import { useVehicle } from '@/context/VehicleContext';
import { useConfigurator } from '@/context/ConfiguratorContext';
import { useFleetBuilds } from '@/context/FleetBuildsContext';
import { useFleetTemplates } from '@/context/FleetTemplatesContext';
import { useMiniCart } from '@/hooks/cartWorkspace';
import { catalogService } from '@/services/catalog';
import { resolveProductDetailPath } from '@/domain/catalog';
import { resolveSavedProducts } from '@/components/product/SavedProductsSection';
import { resolveRecentlyViewedProducts } from '@/components/product/RecentlyViewedProducts';
import FleetBuildsWorkspaceSection from '@/components/fleetBuilds/FleetBuildsWorkspaceSection';
import FleetTemplatesWorkspaceSection from '@/components/fleetBuilds/FleetTemplatesWorkspaceSection';
import appConfig from '@/config/appConfig';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

function toCardProps(product) {
  return {
    id: product.id,
    href: resolveProductDetailPath(product),
    label: product.title ?? product.label,
    image: product.media?.hero || product.images?.[0]?.src,
    tagline: product.subtitle,
    badges: product.marketing?.features?.slice(0, 2) ?? [],
    product,
  };
}

function formatMoney(money) {
  if (!money || typeof money.amount !== 'number') return '—';
  return money.amount.toLocaleString(undefined, { style: 'currency', currency: money.currencyCode || 'USD' });
}

/**
 * Resolves the compare queue's product ids to catalog products, dropping any
 * id that no longer resolves — the same silent-drop behavior CompareTray and
 * ComparePage already use. Exported so it is unit-testable without a
 * localStorage-backed context.
 */
export function resolveCompareQueueProducts(productIds, { getProduct = catalogService.getProduct } = {}) {
  return productIds.map((id) => getProduct(id)).filter(Boolean);
}

function SectionLabel({ icon: Icon, children }) {
  return (
    <p style={{
      ...FS, fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
      color: '#1a2744', display: 'flex', alignItems: 'center', gap: 8, margin: 0,
    }}>
      {Icon && <Icon size={14} />} {children}
    </p>
  );
}

function EmptyNote({ children }) {
  return <p style={{ ...FS, fontSize: 13, color: '#888', lineHeight: 1.6, margin: 0 }}>{children}</p>;
}

function CardLink({ to, children }) {
  return (
    <Link to={to} style={{ ...FS, fontSize: 12, fontWeight: 700, color: '#c8102e', textDecoration: 'none', whiteSpace: 'nowrap' }}>
      {children}
    </Link>
  );
}

function TextButton({ onClick, children, ariaLabel }) {
  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel}
      style={{ ...FS, fontSize: 12, fontWeight: 700, color: '#888', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
      {children}
    </button>
  );
}

function WorkspaceSectionCard({ icon, title, action, children }) {
  return (
    <div className="workspace-card" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '18px 20px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <SectionLabel icon={icon}>{title}</SectionLabel>
        {action}
      </div>
      {children}
    </div>
  );
}

export function WorkspaceDashboardView({
  savedProducts,
  recentlyViewedProducts,
  compareProducts,
  fleetBuilds = [],
  fleetTemplates = [],
  cartSummary,
  cartLoading,
  selectedVehicle,
  configuratorState,
  onClearSaved,
  onClearRecentlyViewed,
  onRemoveFromCompare,
  onClearCompare,
  onOpenVehicleModal,
  onOpenFleetBuilds,
}) {
  const cartHasItems = (cartSummary?.itemCount ?? 0) > 0;
  const hasInProgressConfiguration = Boolean(configuratorState?.selectedFamily);
  const accessoryCount = configuratorState?.accessories?.length ?? 0;

  return (
    <div className="min-h-screen" style={{ ...FS, background: '#f4f5f7' }}>
      <PrototypeBanner />
      <SiteHeader />
      <ProductBreadcrumb crumbs={[{ label: 'Home', to: '/' }, { label: 'My Workspace' }]} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 900, color: '#1a2744', marginBottom: 6 }}>My Workspace</h1>
          <p style={{ fontSize: 14, color: '#666', maxWidth: 640, lineHeight: 1.6 }}>
            Everything you&apos;ve saved, compared, and configured while planning your build — all in one place.
          </p>
        </div>

        <div className="workspace-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ marginBottom: 32 }}>

          {/* Selected Vehicle */}
          <WorkspaceSectionCard icon={Truck} title="Selected Vehicle">
            {selectedVehicle ? (
              <>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>
                  {`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}${selectedVehicle.trim ? ` ${selectedVehicle.trim}` : ''}`}
                </p>
                <button type="button" onClick={onOpenVehicleModal}
                  style={{ ...FS, alignSelf: 'flex-start', minHeight: 40, fontSize: 12, fontWeight: 700, color: '#1a2744', background: 'none', border: '2px solid #1a2744', padding: '8px 14px', cursor: 'pointer' }}>
                  Change Vehicle
                </button>
              </>
            ) : (
              <>
                <EmptyNote>No vehicle selected yet. Choose your vehicle to see compatible products and fitment.</EmptyNote>
                <button type="button" onClick={onOpenVehicleModal}
                  style={{ ...FS, alignSelf: 'flex-start', minHeight: 40, marginTop: 12, fontSize: 12, fontWeight: 700, color: '#fff', background: '#c8102e', border: 'none', padding: '9px 16px', cursor: 'pointer' }}>
                  Select Your Vehicle
                </button>
              </>
            )}
          </WorkspaceSectionCard>

          {/* Cart Summary */}
          <WorkspaceSectionCard icon={ShoppingCart} title="Cart Summary" action={cartHasItems && <CardLink to="/cart">View Cart</CardLink>}>
            {cartLoading ? (
              <EmptyNote>Loading cart…</EmptyNote>
            ) : cartHasItems ? (
              <>
                <p style={{ fontSize: 13, color: '#444', marginBottom: 6 }}>
                  {`${cartSummary.lineCount} line item${cartSummary.lineCount === 1 ? '' : 's'}, ${cartSummary.itemCount} unit${cartSummary.itemCount === 1 ? '' : 's'}`}
                </p>
                <p style={{ fontSize: 20, fontWeight: 800, color: '#1a2744', marginBottom: 4 }}>{formatMoney(cartSummary.subtotal)}</p>
              </>
            ) : (
              <>
                <EmptyNote>Your cart is empty.</EmptyNote>
                <div style={{ marginTop: 12 }}><CardLink to="/search">Browse Products</CardLink></div>
              </>
            )}
          </WorkspaceSectionCard>

          {/* Compare Queue */}
          <WorkspaceSectionCard
            icon={GitCompare}
            title={`Compare Queue (${compareProducts.length}/${MAX_COMPARE_PRODUCTS})`}
            action={compareProducts.length > 0 && <TextButton onClick={onClearCompare}>Clear</TextButton>}
          >
            {compareProducts.length > 0 ? (
              <>
                <div className="workspace-compare-chips" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 12, WebkitOverflowScrolling: 'touch' }}>
                  {compareProducts.map((product) => (
                    <div key={product.id} style={{ position: 'relative', flexShrink: 0 }}>
                      {(product.media?.hero || product.images?.[0]?.src) ? (
                        <img
                          src={product.media?.hero || product.images?.[0]?.src}
                          alt={product.title ?? product.label}
                          style={{ width: 44, height: 44, objectFit: 'cover', border: '1px solid #e5e7eb' }}
                        />
                      ) : (
                        <div style={{ width: 44, height: 44, background: '#f2f2f2', border: '1px solid #e5e7eb' }} />
                      )}
                      <button type="button" onClick={() => onRemoveFromCompare(product.id)}
                        aria-label={`Remove ${product.title ?? product.label} from comparison`}
                        style={{
                          position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%',
                          background: '#1a2744', color: '#fff', border: 'none', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', cursor: 'pointer', padding: 0,
                        }}>
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
                <CardLink to="/compare">Compare Now →</CardLink>
              </>
            ) : (
              <>
                <EmptyNote>{`Select up to ${MAX_COMPARE_PRODUCTS} products while browsing to compare them side by side.`}</EmptyNote>
                <div style={{ marginTop: 12 }}><CardLink to="/search">Browse Products</CardLink></div>
              </>
            )}
          </WorkspaceSectionCard>

          {/* Recent Configurations — placeholder using existing ConfiguratorContext state */}
          <WorkspaceSectionCard icon={Settings2} title="Recent Configurations">
            {hasInProgressConfiguration ? (
              <>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>
                  {`In progress: ${configuratorState.selectedFamily}`}
                </p>
                <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
                  {`${accessoryCount} accessor${accessoryCount === 1 ? 'y' : 'ies'} selected`}
                </p>
              </>
            ) : (
              <EmptyNote>No recent configurations yet. Start configuring a product to see it here.</EmptyNote>
            )}
          </WorkspaceSectionCard>

          {/* Quote Builder shortcut */}
          <WorkspaceSectionCard icon={FileText} title="Quote Builder">
            <EmptyNote>Request a formal quote for the products in your cart, or start from any product page.</EmptyNote>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
              <a
                href={`mailto:${appConfig.quoteRecipientEmail}?subject=${encodeURIComponent('Quote Request')}`}
                style={{ ...FS, minHeight: 40, display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 700, color: '#fff', background: '#c8102e', padding: '9px 16px', textDecoration: 'none' }}
              >
                Request a Quote
              </a>
              <CardLink to="/cart">Review Cart &amp; Request Quote →</CardLink>
            </div>
          </WorkspaceSectionCard>

          {/* Continue Shopping CTA */}
          <WorkspaceSectionCard title="Keep Building">
            <EmptyNote>Head back to the catalog to add more products to your build.</EmptyNote>
            <Link to="/search"
              style={{ ...FS, marginTop: 12, minHeight: 40, fontSize: 13, fontWeight: 700, color: '#fff', background: '#1a2744', padding: '10px 18px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}>
              Continue Shopping <ArrowRight size={14} />
            </Link>
          </WorkspaceSectionCard>
        </div>

        <FleetBuildsWorkspaceSection builds={fleetBuilds} onOpenFleetBuilds={onOpenFleetBuilds} />

        <FleetTemplatesWorkspaceSection templates={fleetTemplates} builds={fleetBuilds} onOpenFleetBuilds={onOpenFleetBuilds} />

        {/* Saved Products */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <SectionLabel icon={Heart}>Saved Products</SectionLabel>
            {savedProducts.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <CardLink to="/saved-products">View All Saved</CardLink>
                <TextButton onClick={onClearSaved}>Clear</TextButton>
              </div>
            )}
          </div>
          {savedProducts.length > 0 ? (
            <div className="workspace-saved-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {savedProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} {...toCardProps(product)} />
              ))}
            </div>
          ) : (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '24px 20px' }}>
              <EmptyNote>You haven&apos;t saved any products yet. Tap the heart icon on any product to save it here.</EmptyNote>
              <div style={{ marginTop: 12 }}><CardLink to="/search">Browse Products</CardLink></div>
            </div>
          )}
        </section>

        {/* Recently Viewed */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <SectionLabel icon={Clock}>Recently Viewed</SectionLabel>
            {recentlyViewedProducts.length > 0 && (
              <TextButton onClick={onClearRecentlyViewed}>Clear Recently Viewed</TextButton>
            )}
          </div>
          {recentlyViewedProducts.length > 0 ? (
            <div className="workspace-recent-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {recentlyViewedProducts.map((product) => (
                <ProductCard key={product.id} {...toCardProps(product)} />
              ))}
            </div>
          ) : (
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '24px 20px' }}>
              <EmptyNote>Products you view will show up here so you can pick up where you left off.</EmptyNote>
            </div>
          )}
        </section>
      </div>

      <PrototypeFooter />
    </div>
  );
}

export default function WorkspaceDashboard() {
  const { productIds: savedIds, clearSavedProducts } = useSavedProducts();
  const { productIds: recentIds, clearRecentlyViewed } = useRecentlyViewed();
  const { productIds: compareIds, removeFromCompare, clearCompare } = useCompare();
  const { selectedVehicle } = useVehicle();
  const { state: configuratorState } = useConfigurator();
  const { builds: fleetBuilds } = useFleetBuilds();
  const { templates: fleetTemplates } = useFleetTemplates();
  const { summary: cartSummary, loading: cartLoading } = useMiniCart();
  // null = closed; 'shop' | 'fleet' selects which VehicleSelectorModal tab
  // opens — the Selected Vehicle card and the Fleet Builds section share one
  // modal instance instead of each managing its own.
  const [vehicleModalTab, setVehicleModalTab] = useState(null);

  const savedProducts = resolveSavedProducts(savedIds);
  const recentlyViewedProducts = resolveRecentlyViewedProducts(recentIds);
  const compareProducts = resolveCompareQueueProducts(compareIds);

  return (
    <>
      <WorkspaceDashboardView
        savedProducts={savedProducts}
        recentlyViewedProducts={recentlyViewedProducts}
        compareProducts={compareProducts}
        fleetBuilds={fleetBuilds}
        fleetTemplates={fleetTemplates}
        cartSummary={cartSummary}
        cartLoading={cartLoading}
        selectedVehicle={selectedVehicle}
        configuratorState={configuratorState}
        onClearSaved={clearSavedProducts}
        onClearRecentlyViewed={clearRecentlyViewed}
        onRemoveFromCompare={removeFromCompare}
        onClearCompare={clearCompare}
        onOpenVehicleModal={() => setVehicleModalTab('shop')}
        onOpenFleetBuilds={() => setVehicleModalTab('fleet')}
      />
      {vehicleModalTab && <VehicleSelectorModal initialTab={vehicleModalTab} onClose={() => setVehicleModalTab(null)} />}
    </>
  );
}
