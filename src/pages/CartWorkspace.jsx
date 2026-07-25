/**
 * pages/CartWorkspace.jsx — Cart Workspace Experience at /cart.
 *
 * Bridges product browsing, configurators, package building, and quote
 * requests through the existing Commerce Foundation. Consumes
 * useCartWorkspace(), which is backed by cartWorkspaceService's deterministic
 * in-memory adapter. "Proceed to Checkout" creates a real Shopify cart via
 * useShopifyStorefrontCartCreate() (Storefront API cartCreate) and redirects
 * to the real checkoutUrl Shopify returns; see
 * shopifyStorefrontCartCreateService for credential/failure handling.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import SiteHeader from '@/components/navigator/SiteHeader';
import PrototypeBanner from '@/components/PrototypeBanner';
import CartLineRow from '@/components/cart/CartLineRow';
import CartSummary from '@/components/cart/CartSummary';
import CheckoutReadinessPanel from '@/components/cart/CheckoutReadinessPanel';
import { useCartAdapterStatus } from '@/hooks/cartAdapter';
import { useCartWorkspace } from '@/hooks/cartWorkspace';
import { useCheckoutPreparation } from '@/hooks/checkoutPreparation';
import { useStorefrontAvailability } from '@/hooks/shopifyStorefront';
import { resolveShopifyCheckoutOutcome } from '@/services/shopifyStorefrontCart';
import { useShopifyStorefrontCartCreate, useShopifyStorefrontCartPreview } from '@/hooks/shopifyStorefrontCart';
import { useShopifyCheckoutPreview } from '@/hooks/shopifyCheckoutPreview';
import { useShopifyStorefrontCapabilities } from '@/hooks/shopifyStorefrontConfig';
import QuoteContactModal from '@/components/quoteDelivery/QuoteContactModal';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

/**
 * Converts the current cart lines into the QuotePayload the quote delivery
 * adapter (PR-12) expects. A cart quote covers every line in one submission
 * (there is one "Request Quote" action for the whole cart, not per-line) —
 * pure and side-effect free so it can be unit tested independently of the page.
 */
export function buildCartQuoteRequestPayload(lines, contact, submissionId) {
  if (!lines || lines.length === 0) return null;
  return {
    productId: 'cart',
    configuratorId: 'cart',
    productTitle: `Cart Quote Request (${lines.length} item${lines.length === 1 ? '' : 's'})`,
    selectedOptions: [],
    accessories: [],
    selectedSku: null,
    matchingSkus: [],
    skuStatus: 'cart',
    skuPreview: null,
    dependencyNotes: [],
    warningNotes: [],
    lines: lines.map((line) => ({
      sku: line.sku,
      label: line.label,
      quantity: line.quantity,
      unitPrice: typeof line.unitPrice?.amount === 'number' ? line.unitPrice.amount : undefined,
    })),
    contact,
    submissionId,
    timestamp: new Date().toISOString(),
    source: 'cart',
  };
}

export default function CartWorkspace() {
  const { data, loading, error, refresh, updateQuantity, removeLine, clearCart } = useCartWorkspace();
  const { data: readiness, loading: readinessLoading, refresh: refreshReadiness } = useCheckoutPreparation();
  const { availability: storefrontAvailability } = useStorefrontAvailability();
  const { result: storefrontCartPreview } = useShopifyStorefrontCartPreview();
  const { result: checkoutUrlPreview } = useShopifyCheckoutPreview();
  const { summary: storefrontCapabilitySummary } = useShopifyStorefrontCapabilities();
  const { status: cartAdapterStatus } = useCartAdapterStatus();
  const { createCart, loading: creatingCart } = useShopifyStorefrontCartCreate();
  const [notice, setNotice] = useState(null);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);

  useEffect(() => {
    refresh();
    refreshReadiness();
  }, [refresh, refreshReadiness]);

  async function handleCheckout() {
    setNotice(null);
    try {
      const result = await createCart();
      const outcome = resolveShopifyCheckoutOutcome(result);
      if (outcome.type === 'redirect') {
        if (outcome.warning) setNotice(outcome.warning);
        window.location.href = outcome.checkoutUrl;
        return;
      }
      setNotice(outcome.message);
    } catch (checkoutError) {
      setNotice(`Checkout failed unexpectedly: ${checkoutError.message || checkoutError}`);
    }
  }

  function handleRequestQuote() {
    setQuoteModalOpen(true);
  }

  function handleConfigure(line) {
    setNotice(`Configure "${line.label}" is a placeholder — it will route to the existing configurator for this product.`);
  }

  const lines = data?.lines ?? [];

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', ...FS }}>
      <PrototypeBanner />
      <SiteHeader />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#1a2744' }}>Your Cart</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#888' }}>
              {lines.length === 0 ? 'Your cart is empty.' : `${data.summary.lineCount} line item${data.summary.lineCount === 1 ? '' : 's'}, ${data.summary.itemCount} unit${data.summary.itemCount === 1 ? '' : 's'}`}
            </p>
          </div>
          <Link to="/search" style={{ fontSize: 13, color: '#1a2744', fontWeight: 700, textDecoration: 'none' }}>← Continue Shopping</Link>
        </div>

        {notice && (
          <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', color: '#3730a3', fontSize: 13, padding: '12px 16px', borderRadius: 4, marginBottom: 18 }}>
            {notice}
          </div>
        )}

        {error && (
          <div style={{ padding: '16px 20px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: 13, marginBottom: 20 }}>
            Failed to load cart: {error.message || String(error)}
          </div>
        )}

        {loading && !data && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#888', fontSize: 14 }}>Loading cart…</div>
        )}

        {!loading && data && lines.length === 0 && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '60px 24px', textAlign: 'center' }}>
            <ShoppingCart size={32} style={{ color: '#ccc', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>You haven't added anything to your cart yet.</p>
            <Link to="/search" style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: '#c8102e', padding: '10px 20px', borderRadius: 3, textDecoration: 'none' }}>
              Browse Products
            </Link>
          </div>
        )}

        {data && lines.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'flex-start', minWidth: 0 }} className="cart-workspace-grid">
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '4px 22px', minWidth: 0 }}>
              {lines.map((line) => (
                <CartLineRow
                  key={line.id}
                  line={line}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeLine}
                  onConfigure={handleConfigure}
                />
              ))}
              <div style={{ padding: '16px 0' }}>
                <button
                  onClick={() => clearCart()}
                  style={{ fontSize: 12, color: '#b91c1c', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                >
                  Clear Cart
                </button>
              </div>
            </div>

            <div style={{ minWidth: 0 }}>
              <CartSummary summary={data.summary} onCheckout={handleCheckout} onRequestQuote={handleRequestQuote} disabled={loading || creatingCart} checkoutLabel={creatingCart ? 'Creating your Shopify cart…' : 'Proceed to Checkout'} />
              <CheckoutReadinessPanel result={readiness} loading={readinessLoading} storefrontAvailability={storefrontAvailability} storefrontCartPreview={storefrontCartPreview} checkoutUrlPreview={checkoutUrlPreview} storefrontCapabilitySummary={storefrontCapabilitySummary} cartAdapterStatus={cartAdapterStatus} />
            </div>
          </div>
        )}
      </div>

      {quoteModalOpen && (
        <QuoteContactModal
          onClose={() => setQuoteModalOpen(false)}
          title="Request a Quote"
          description={`${lines.length} item${lines.length === 1 ? '' : 's'} in your cart`}
          buildPayload={(contact, submissionId) => {
            const payload = buildCartQuoteRequestPayload(lines, contact, submissionId);
            if (!payload) throw new Error('Your cart is empty.');
            return payload;
          }}
        />
      )}
    </div>
  );
}
