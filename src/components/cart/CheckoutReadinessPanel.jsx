import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

function formatMoney(money) {
  if (!money || typeof money.amount !== 'number') return '—';
  return money.amount.toLocaleString(undefined, { style: 'currency', currency: money.currencyCode || 'USD' });
}

const CATEGORY_LABEL = {
  cart: 'Cart',
  configuration: 'Configuration',
  package: 'Package',
  pricing: 'Pricing',
  commerce: 'Commerce',
};

function ReadinessRow({ label, ready }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: 13, color: ready ? '#15803d' : '#b91c1c' }}>
      {ready ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
      <span>{label}</span>
    </div>
  );
}

/**
 * Renders CheckoutPreparationResult contracts produced by
 * checkoutPreparationService.prepareCheckout(). Performs no validation or
 * calculation of its own — every readiness flag, blocker, warning, and
 * payload preview line is read directly from the already-computed result.
 * This panel never calls Shopify and never redirects to checkout.
 *
 * storefrontAvailability is an optional ShopifyStorefrontAvailability
 * contract from useStorefrontAvailability() (Shopify Storefront API
 * Foundation). It is display-only — it never changes checkout readiness,
 * blockers, or the payload preview above.
 *
 * storefrontCartPreview is an optional ShopifyStorefrontCartResult contract
 * from useShopifyStorefrontCartPreview() (Shopify Storefront Cart Adapter
 * Foundation). It is also display-only — it never changes checkout
 * readiness, blockers, or the payload preview above, and its
 * checkoutUrlPreview is never a real Shopify checkout URL; this panel never
 * redirects to it.
 */
export default function CheckoutReadinessPanel({ result, loading, storefrontAvailability, storefrontCartPreview }) {
  if (loading && !result) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '20px 22px', marginTop: 16 }}>
        <p style={{ fontSize: 13, color: '#888', margin: 0 }}>Checking checkout readiness…</p>
      </div>
    );
  }

  if (!result) return null;

  const cartReady = result.blockers.every((blocker) => blocker.category !== 'cart');
  const configurationReady = result.blockers.every((blocker) => blocker.category !== 'configuration');
  const packageReady = result.blockers.every((blocker) => blocker.category !== 'package');
  const pricingReady = result.blockers.every((blocker) => blocker.category !== 'pricing');
  const commerceReady = result.blockers.every((blocker) => blocker.category !== 'commerce');

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '20px 22px', marginTop: 16 }}>
      <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#1a2744' }}>
        Checkout Readiness
      </p>

      <ReadinessRow label={`${CATEGORY_LABEL.cart} Validation`} ready={cartReady} />
      <ReadinessRow label={`${CATEGORY_LABEL.configuration} Validation`} ready={configurationReady} />
      <ReadinessRow label={`${CATEGORY_LABEL.package} Validation`} ready={packageReady} />
      <ReadinessRow label={`${CATEGORY_LABEL.pricing} Validation`} ready={pricingReady} />
      <ReadinessRow label={`${CATEGORY_LABEL.commerce} Validation`} ready={commerceReady} />

      <div style={{ borderTop: '1px solid #eee', margin: '12px 0' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 800, color: result.status === 'ready' ? '#15803d' : '#b91c1c' }}>
        {result.status === 'ready' ? <CheckCircle2 size={17} /> : <XCircle size={17} />}
        <span>{result.status === 'ready' ? 'Ready for Shopify Checkout' : 'Not Ready for Shopify Checkout'}</span>
      </div>

      {result.status !== 'ready' && result.blockers.length > 0 && (
        <div style={{ marginTop: 12, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 3, padding: '10px 14px' }}>
          <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Blockers</p>
          {result.blockers.map((blocker, index) => (
            <p key={`${blocker.code}-${blocker.lineId ?? index}`} style={{ margin: '2px 0', fontSize: 12, color: '#991b1b' }}>
              {blocker.message}
            </p>
          ))}
        </div>
      )}

      {result.warnings.length > 0 && (
        <div style={{ marginTop: 10, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 3, padding: '10px 14px' }}>
          <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Warnings</p>
          {result.warnings.map((warning, index) => (
            <p key={`${warning.code}-${warning.lineId ?? index}`} style={{ margin: '2px 0', fontSize: 12, color: '#92400e' }}>
              {warning.message}
            </p>
          ))}
        </div>
      )}

      {result.status === 'ready' && result.payloadPreview && (
        <div style={{ marginTop: 12, background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 3, padding: '10px 14px' }}>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#3730a3', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Checkout Payload Preview
          </p>
          {result.payloadPreview.lines.map((line) => (
            <div key={line.sku} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#3730a3', padding: '2px 0' }}>
              <span>{line.sku} × {line.quantity}</span>
              <span>{line.variantMapping.shopifyVariantGid || line.variantMapping.shopifyVariantId || 'unmapped variant'}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: '#3730a3', marginTop: 8, borderTop: '1px solid #c7d2fe', paddingTop: 8 }}>
            <span>Estimated Payload Total</span>
            <span>{formatMoney(result.payloadPreview.estimatedTotal)}</span>
          </div>
          <p style={{ fontSize: 11, color: '#6366f1', marginTop: 8 }}>
            This is a preview only — no Shopify checkout session has been created and no redirect will occur.
          </p>
        </div>
      )}

      {storefrontAvailability && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid #eee', fontSize: 11, color: '#6b7280' }}>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '1px 6px', borderRadius: 2,
            background: storefrontAvailability.available ? '#dcfce7' : '#f3f4f6',
            color: storefrontAvailability.available ? '#15803d' : '#6b7280',
            border: `1px solid ${storefrontAvailability.available ? '#86efac' : '#e5e7eb'}`,
          }}>
            {storefrontAvailability.available ? 'Storefront API Connected' : 'Storefront API Not Connected'}
          </span>
          <span>{storefrontAvailability.reason || 'No live Shopify Storefront API call is made by this panel.'}</span>
        </div>
      )}

      {storefrontCartPreview && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #eee' }}>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Storefront Cart Preview
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#374151', padding: '2px 0' }}>
            <span>Storefront Cart Status</span>
            <span style={{ fontWeight: 700 }}>{storefrontCartPreview.status}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#374151', padding: '2px 0' }}>
            <span>Storefront Cart Lines</span>
            <span style={{ fontWeight: 700 }}>{storefrontCartPreview.lineCount}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#374151', padding: '2px 0' }}>
            <span>Checkout URL Preview</span>
            <span style={{ fontWeight: 700 }}>{storefrontCartPreview.checkoutPreview?.checkoutUrlPreview || 'Not available'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#374151', padding: '2px 0' }}>
            <span>Mutation Preview</span>
            <span style={{ fontWeight: 700 }}>{storefrontCartPreview.mutationPreview?.operationName || '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#374151', padding: '2px 0' }}>
            <span>Adapter Mode</span>
            <span style={{ fontWeight: 700 }}>{storefrontCartPreview.metadata?.attributes?.adapterMode || 'unavailable'}</span>
          </div>
          <p style={{ fontSize: 11, color: '#6b7280', marginTop: 6 }}>
            This is a preview only — no Shopify Storefront cart mutation has been executed and this URL is not a real checkout link.
          </p>
        </div>
      )}
    </div>
  );
}
