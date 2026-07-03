/**
 * components/configurator/ConfiguratorPricingSummary.jsx
 *
 * Pricing Summary panel for the Configurator Experience. Composes the
 * existing Pricing Engine (pricingService / useListPrice / useDealerCost /
 * useBundlePricing) against the configurator's selected SKUs. No pricing
 * calculation is duplicated here — every figure either comes from the
 * Pricing Engine or, when its adapter is unavailable, falls back to the
 * configurator's own catalog-sourced price the same way the existing
 * Package Quote panel already does.
 */

import React, { useMemo } from 'react';
import { DollarSign } from 'lucide-react';
import { useBundlePricing, useDealerCost, useListPrice } from '@/hooks/pricing';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

function formatUsd(amount) {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return null;
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function PriceRow({ label, value, testId }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f0f0f0', fontSize: 12 }} data-testid={testId}>
      <span style={{ color: '#666' }}>{label}</span>
      <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{value}</span>
    </div>
  );
}

function buildPricingContext() {
  return { pricingDate: new Date().toISOString().slice(0, 10), currencyCode: 'USD' };
}

export default function ConfiguratorPricingSummary({ configState }) {
  const context = useMemo(() => buildPricingContext(), []);

  const baseSubject = useMemo(
    () => (configState?.selectedBaseSku ? { sku: configState.selectedBaseSku, productId: configState.configuratorId } : null),
    [configState],
  );

  const { result: listPriceResult, data: listPrice, loading: listPriceLoading } = useListPrice(baseSubject, context);
  const { result: dealerCostResult, data: dealerCost } = useDealerCost(baseSubject, context);

  const bundleInput = useMemo(() => {
    const lines = configState?.commerceLines ?? [];
    if (!lines.length) return null;
    return {
      context,
      items: lines.map((line) => ({ sku: line.sku, productId: configState.configuratorId, quantity: 1 })),
    };
  }, [configState, context]);
  const { result: bundleResult, data: bundlePricing } = useBundlePricing(bundleInput);

  if (!configState) {
    return (
      <div style={{ ...FS, border: '1px solid #e8e8e8', background: '#fff', padding: '16px' }} data-testid="configurator-pricing-summary">
        <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Select a SKU above to see pricing.</p>
      </div>
    );
  }

  // MSRP — prefer the live Pricing Engine, fall back to the configurator's
  // own catalog-sourced base price (same fallback already used in the
  // existing Package Quote panel).
  const msrpFromEngine = listPriceResult?.status === 'priced' ? listPrice?.price?.amount : null;
  const msrp = msrpFromEngine ?? configState.basePrice;
  const msrpDisplay = formatUsd(msrp) ?? (listPriceLoading ? 'Loading…' : 'Contact for pricing');

  const dealerAvailable = dealerCostResult?.status === 'priced' && dealerCost?.cost;
  const bundleAvailable = bundleResult?.status === 'priced' && bundlePricing;

  const quantityBreakLines = (bundlePricing?.items ?? []).filter((item) => item.appliedQuantityBreak);

  // Estimated total — prefer the Pricing Engine's bundle selling price,
  // otherwise sum whatever known SKU prices the configurator already has.
  const knownLineTotal = [configState.basePrice, ...((configState.commerceLines ?? []).slice(1).map((l) => l.price))]
    .reduce((sum, p) => (p != null && sum != null ? sum + p : null), 0);
  const estimatedTotal = bundleAvailable ? bundlePricing.sellingPrice?.amount : knownLineTotal;
  const estimatedTotalDisplay = formatUsd(estimatedTotal) ?? 'Contact for pricing';

  return (
    <div style={{ ...FS, border: '1px solid #e8e8e8', background: '#fff' }} data-testid="configurator-pricing-summary">
      <div style={{ background: '#1a2744', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <DollarSign size={14} style={{ color: '#fff' }} />
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff' }}>Pricing Summary</span>
      </div>

      <div style={{ padding: '14px 16px' }}>
        <PriceRow label="MSRP" value={msrpDisplay} testId="pricing-msrp" />

        {dealerAvailable && (
          <PriceRow label="Dealer Pricing" value={formatUsd(dealerCost.cost.amount) ?? 'Contact for pricing'} testId="pricing-dealer" />
        )}

        <PriceRow
          label="Quantity Pricing"
          value={quantityBreakLines.length > 0 ? `${quantityBreakLines.length} quantity break${quantityBreakLines.length === 1 ? '' : 's'} applied` : 'No quantity breaks applied'}
          testId="pricing-quantity"
        />

        <PriceRow
          label="Bundle Pricing"
          value={bundleAvailable ? (formatUsd(bundlePricing.sellingPrice?.amount) ?? 'Contact for pricing') : 'Contact for pricing'}
          testId="pricing-bundle"
        />

        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '2px solid #1a2744', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1a2744' }}>Estimated Total</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1a2744' }} data-testid="pricing-estimated-total">{estimatedTotalDisplay}</span>
        </div>
      </div>
    </div>
  );
}
