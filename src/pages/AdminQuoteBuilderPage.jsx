/**
 * pages/AdminQuoteBuilderPage.jsx
 * Issue 46 — Quote Builder / Live Pricing Engine integration.
 *
 * Consumes quoteBuilderWorkspaceService, which composes the existing Quote
 * Builder (quotePipelineService, quoteBuilderService, liveQuoteBuilderService)
 * with the existing Live Pricing Engine (pricingService + livePricingAdapter +
 * dealerContractResolutionService) against deterministic fixture pricing
 * records. No checkout, Shopify, payment, PDF, email, or database behavior
 * is introduced by this page.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuoteBuilderWorkspace } from '@/hooks/quoteBuilderWorkspace';
import { checkAdminAccess } from '@/services/adminAccessService';
import { AlertTriangle, Bug, CheckCircle2, RefreshCw, ShieldOff, XCircle } from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const PRICING_STATUS_BADGE = {
  valid: { bg: '#dcfce7', text: '#15803d', border: '#86efac', Icon: CheckCircle2, label: 'Valid' },
  warning: { bg: '#fef3c7', text: '#92400e', border: '#fde68a', Icon: AlertTriangle, label: 'Warning' },
  invalid: { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca', Icon: XCircle, label: 'Invalid' },
  unavailable: { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db', Icon: XCircle, label: 'Unavailable' },
};

function formatMoney(amount, currencyCode = 'USD') {
  if (typeof amount !== 'number') return '—';
  return amount.toLocaleString(undefined, { style: 'currency', currency: currencyCode });
}

function formatPercent(value) {
  return typeof value === 'number' ? `${value.toFixed(2)}%` : '—';
}

function PricingStatusBadge({ status }) {
  const c = PRICING_STATUS_BADGE[status] || PRICING_STATUS_BADGE.unavailable;
  const Icon = c.Icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
      padding: '3px 10px', borderRadius: 2,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
    }}>
      <Icon size={12} /> {c.label}
    </span>
  );
}

function QuoteTotalsRow({ pricingSummary, currencyCode }) {
  if (!pricingSummary) return null;
  const tiles = [
    { label: 'Subtotal', value: formatMoney(pricingSummary.subtotal?.amount, currencyCode) },
    { label: 'Total Cost', value: formatMoney(pricingSummary.totalCost?.amount, currencyCode) },
    { label: 'Gross Profit', value: formatMoney(pricingSummary.grossProfit?.amount, currencyCode) },
    { label: 'Gross Margin %', value: formatPercent(pricingSummary.grossMarginPercent) },
    { label: 'Total Quantity', value: pricingSummary.totalQuantity ?? '—' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginTop: 14 }}>
      {tiles.map((tile) => (
        <div key={tile.label} style={{ background: '#f7f8fa', border: '1px solid #e5e7eb', padding: '10px 12px', borderRadius: 2 }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888' }}>{tile.label}</p>
          <p style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 800, color: '#1a2744' }}>{tile.value}</p>
        </div>
      ))}
    </div>
  );
}

function ScenarioLinesTable({ lines, currencyCode }) {
  if (!lines || lines.length === 0) {
    return <p style={{ fontSize: 12, color: '#aaa', margin: '10px 0' }}>No priced lines for this scenario.</p>;
  }
  return (
    <div style={{ overflowX: 'auto', marginTop: 10 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#1a2744', color: '#fff' }}>
            {['Line', 'SKU', 'Qty', 'Qty Break', 'MSRP', 'Dealer Cost', 'Selling Price', 'Line Total', 'Margin %', 'Profit $'].map((h) => (
              <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, letterSpacing: '0.04em', fontSize: 10, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lines.map((line, i) => (
            <tr key={line.id} style={{ background: i % 2 === 0 ? '#f9fafb' : '#fff', borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '8px 10px' }}>{line.label}</td>
              <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#555' }}>{line.sku || '—'}</td>
              <td style={{ padding: '8px 10px', textAlign: 'center' }}>{line.quantity}</td>
              <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>{line.appliedQuantityBreak ? `${line.appliedQuantityBreak.minQuantity}+` : '—'}</td>
              <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>{formatMoney(line.listPrice?.amount, currencyCode)}</td>
              <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>{formatMoney(line.dealerCost?.amount, currencyCode)}</td>
              <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>{formatMoney(line.price?.amount, currencyCode)}</td>
              <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', fontWeight: 700 }}>{formatMoney(line.subtotal?.amount, currencyCode)}</td>
              <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>{formatPercent(line.margin?.grossMarginPercent)}</td>
              <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', color: (line.margin?.grossProfit?.amount ?? 0) < 0 ? '#b91c1c' : '#15803d' }}>
                {formatMoney(line.margin?.grossProfit?.amount, currencyCode)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScenarioCard({ scenario }) {
  const { result } = scenario;
  const currencyCode = result.pricingSummary?.subtotal?.currencyCode || 'USD';
  const warnings = result.reviewFlags?.filter((flag) => flag.severity !== 'info') ?? [];

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', marginBottom: 20 }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1a2744' }}>{scenario.label}</p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#888' }}>{scenario.description}</p>
        </div>
        <PricingStatusBadge status={result.pricingSummary?.status} />
      </div>

      <div style={{ padding: '14px 18px' }}>
        <ScenarioLinesTable lines={result.quote?.lines} currencyCode={currencyCode} />
        <QuoteTotalsRow pricingSummary={result.pricingSummary} currencyCode={currencyCode} />

        {warnings.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Review Flags</p>
            {warnings.map((flag, i) => (
              <div key={`${flag.code}-${i}`} style={{ fontSize: 12, color: flag.severity === 'error' ? '#b91c1c' : '#92400e', padding: '3px 0' }}>
                ⚠ {flag.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminQuoteBuilderPage() {
  const [accessStatus, setAccessStatus] = useState('checking');
  const [accessReason, setAccessReason] = useState('');

  useEffect(() => {
    checkAdminAccess().then(({ authorized, reason }) => {
      setAccessStatus(authorized ? 'authorized' : 'denied');
      if (!authorized) setAccessReason(reason || 'Access denied.');
    });
  }, []);

  const { data: scenarios, loading, error, loadScenarios } = useQuoteBuilderWorkspace();

  useEffect(() => {
    if (accessStatus === 'authorized') loadScenarios();
  }, [accessStatus, loadScenarios]);

  if (accessStatus === 'checking') {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', ...FS }}>
        <p style={{ fontSize: 14, color: '#888' }}>Verifying access…</p>
      </div>
    );
  }

  if (accessStatus === 'denied') {
    return (
      <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, ...FS }}>
        <div style={{ background: '#fff', border: '1px solid #fecaca', maxWidth: 440, width: '100%', padding: 32, textAlign: 'center' }}>
          <ShieldOff size={36} style={{ color: '#dc2626', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>Access Restricted</p>
          <p style={{ fontSize: 13, color: '#555', marginBottom: 20 }}>{accessReason}</p>
          <Link to="/" style={{ fontSize: 13, color: '#c8102e', textDecoration: 'none', fontWeight: 700 }}>← Return to Store</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', ...FS }}>
      <div style={{ background: '#1a2744', color: '#fff', padding: '0 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
          <div>
            <p style={{ margin: 0, fontWeight: 900, fontSize: 18, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              TFR Supply — Admin
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em' }}>
              QUOTE BUILDER — LIVE PRICING WORKSPACE
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={loadScenarios}
              disabled={loading}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '7px 14px', fontSize: 12, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 2 }}
            >
              <RefreshCw size={13} /> {loading ? 'Pricing…' : 'Re-run Scenarios'}
            </button>
            <Link to="/admin/debug" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
              <Bug size={13} /> Debug
            </Link>
            <Link to="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>← Store</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 20, maxWidth: 760 }}>
          Each scenario below runs the existing Quote Builder (quotePipelineService → quoteBuilderService)
          through the existing Live Pricing Engine (pricingService → livePricingAdapter → dealerContractResolutionService)
          against deterministic fixture pricing records. No calculations are performed on this page — all
          line and quote totals are surfaced directly from the pricing engine's results.
        </p>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#888', fontSize: 14 }}>Pricing scenarios…</div>
        )}
        {error && (
          <div style={{ padding: '16px 20px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: 13, marginBottom: 20 }}>
            Failed to price scenarios: {error.message || String(error)}
          </div>
        )}
        {!loading && !error && scenarios?.map((scenario) => (
          <ScenarioCard key={scenario.id} scenario={scenario} />
        ))}
      </div>
    </div>
  );
}
