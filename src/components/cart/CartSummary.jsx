import React from 'react';

function formatMoney(money) {
  if (!money || typeof money.amount !== 'number') return '—';
  return money.amount.toLocaleString(undefined, { style: 'currency', currency: money.currencyCode || 'USD' });
}

const ROW_STYLE = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: '#444' };

/**
 * Renders CartSummary contracts produced by cartWorkspaceService.buildSummary().
 * Performs no calculations of its own — subtotal/shipping/tax/grand total are
 * all read directly from the already-computed CartSummary.
 */
export default function CartSummary({ summary, onRequestQuote, onCheckout, disabled }) {
  if (!summary) return null;

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '20px 22px' }}>
      <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#1a2744' }}>
        Order Summary
      </p>

      <div style={ROW_STYLE}>
        <span>Items ({summary.itemCount})</span>
        <span>{formatMoney(summary.subtotal)}</span>
      </div>
      <div style={ROW_STYLE}>
        <span>Estimated Shipping</span>
        <span style={{ color: '#999' }}>{summary.estimatedShipping ? formatMoney(summary.estimatedShipping) : 'Calculated at checkout'}</span>
      </div>
      <div style={ROW_STYLE}>
        <span>Estimated Tax</span>
        <span style={{ color: '#999' }}>{summary.estimatedTax ? formatMoney(summary.estimatedTax) : 'Calculated at checkout'}</span>
      </div>

      <div style={{ borderTop: '1px solid #eee', margin: '10px 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#1a2744', padding: '4px 0 16px' }}>
        <span>Estimated Total</span>
        <span>{formatMoney(summary.grandTotalEstimate)}</span>
      </div>

      <button
        onClick={onCheckout}
        disabled={disabled}
        style={{
          width: '100%', background: '#c8102e', color: '#fff', border: 'none', borderRadius: 3,
          padding: '12px 16px', fontSize: 14, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1, marginBottom: 10,
        }}
      >
        Proceed to Checkout
      </button>
      <button
        onClick={onRequestQuote}
        disabled={disabled}
        style={{
          width: '100%', background: '#fff', color: '#1a2744', border: '1.5px solid #1a2744', borderRadius: 3,
          padding: '11px 16px', fontSize: 14, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        Request Quote
      </button>
      <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', marginTop: 10 }}>
        Checkout is a placeholder — no order is submitted and no Shopify API is called.
      </p>
    </div>
  );
}
