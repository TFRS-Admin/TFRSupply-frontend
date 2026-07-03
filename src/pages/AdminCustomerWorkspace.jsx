/**
 * pages/AdminCustomerWorkspace.jsx
 * Customer Workspace Foundation — /admin/customers.
 *
 * Consumes useCustomerWorkspace and useCustomerSearch, which call
 * customerWorkspaceService against the deterministic mock Customer Workspace
 * adapter. No editing, CRM, database, or Shopify API calls happen here —
 * this page only lists, searches, filters, and displays customer summaries
 * already produced by the service layer.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomerWorkspace, useCustomerSearch } from '@/hooks/customerWorkspace';
import { Bug, Building2, ClipboardList, Mail, Phone, RefreshCw, Search, ShoppingBag, X } from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const STATUS_OPTIONS = ['all', 'active', 'prospect', 'inactive', 'archived'];
const STATUS_LABELS = { all: 'All', active: 'Active', prospect: 'Prospect', inactive: 'Inactive', archived: 'Archived' };

const STATUS_STYLE = {
  active: { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
  prospect: { bg: '#eef2ff', text: '#3730a3', border: '#c7d2fe' },
  inactive: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
  archived: { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' },
};

const SYNC_STYLE = {
  succeeded: { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
  'dry-run': { bg: '#eef2ff', text: '#3730a3', border: '#c7d2fe' },
  pending: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
  failed: { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' },
  'not-started': { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' },
  'adapter-unavailable': { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' },
};

function Badge({ value, styleMap }) {
  const style = styleMap[value] ?? { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' };
  return (
    <span style={{
      display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
      padding: '2px 8px', borderRadius: 2, background: style.bg, color: style.text, border: `1px solid ${style.border}`,
      whiteSpace: 'nowrap',
    }}>
      {value}
    </span>
  );
}

function CustomerDetailModal({ detail, loading, onClose }) {
  const summary = detail?.summary ?? null;
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#fff', maxWidth: 640, width: '100%', maxHeight: '90vh', overflowY: 'auto', ...FS }}>
        <div style={{ background: '#1a2744', color: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0 }}>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{summary?.record.customer.agencyName ?? 'Customer'}</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{summary?.customerId}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {loading && <p style={{ fontSize: 13, color: '#888' }}>Loading customer…</p>}
          {!loading && !summary && <p style={{ fontSize: 13, color: '#888' }}>Customer not found.</p>}
          {!loading && summary && (
            <>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <Badge value={summary.record.status} styleMap={STATUS_STYLE} />
                <Badge value={summary.record.shopifySyncStatus} styleMap={SYNC_STYLE} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 20 }}>
                <div style={{ background: '#f7f8fa', border: '1px solid #e5e7eb', padding: '12px 14px', borderRadius: 2 }}>
                  <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888' }}>Quote Count</p>
                  <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 800, color: '#1a2744' }}>{summary.quoteCount}</p>
                </div>
                <div style={{ background: '#f7f8fa', border: '1px solid #e5e7eb', padding: '12px 14px', borderRadius: 2 }}>
                  <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888' }}>Last Quote</p>
                  <p style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 600, color: '#1a2744' }}>{summary.lastQuoteAt ? new Date(summary.lastQuoteAt).toLocaleDateString() : '—'}</p>
                </div>
                <div style={{ background: '#f7f8fa', border: '1px solid #e5e7eb', padding: '12px 14px', borderRadius: 2 }}>
                  <p style={{ margin: 0, fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888' }}>Last Activity</p>
                  <p style={{ margin: '4px 0 0', fontSize: 13, fontWeight: 600, color: '#1a2744' }}>{summary.lastActivityAt ? new Date(summary.lastActivityAt).toLocaleDateString() : '—'}</p>
                </div>
              </div>

              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a2744', borderBottom: '2px solid #1a2744', paddingBottom: 4, marginBottom: 10 }}>Contact</p>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, marginBottom: 20, fontSize: 12 }}>
                <span style={{ fontWeight: 600, color: '#888' }}>Contact Name</span>
                <span style={{ color: '#1a1a1a' }}>{summary.record.customer.contactName || '—'}</span>
                <span style={{ fontWeight: 600, color: '#888' }}>Email</span>
                <span style={{ color: '#1a1a1a' }}>{summary.record.customer.contactEmail || '—'}</span>
                <span style={{ fontWeight: 600, color: '#888' }}>Phone</span>
                <span style={{ color: '#1a1a1a' }}>{summary.record.customer.contactPhone || '—'}</span>
                <span style={{ fontWeight: 600, color: '#888' }}>Account #</span>
                <span style={{ color: '#1a1a1a' }}>{summary.record.customer.accountNumber || '—'}</span>
                <span style={{ fontWeight: 600, color: '#888' }}>Vertical</span>
                <span style={{ color: '#1a1a1a' }}>{summary.record.verticalId || '—'}</span>
                <span style={{ fontWeight: 600, color: '#888' }}>Shopify Customer ID</span>
                <span style={{ color: '#1a1a1a' }}>{summary.record.shopifyCustomerId || '—'}</span>
              </div>

              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a2744', borderBottom: '2px solid #1a2744', paddingBottom: 4, marginBottom: 10 }}>Recent Activity</p>
              {summary.recentActivity.length === 0 && <p style={{ fontSize: 12, color: '#aaa' }}>No activity recorded.</p>}
              {summary.recentActivity.map((entry) => (
                <div key={entry.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: '#1a2744' }}>{entry.label}</p>
                    <span style={{ fontSize: 11, color: '#aaa', whiteSpace: 'nowrap' }}>{new Date(entry.occurredAt).toLocaleString()}</span>
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#666' }}>{entry.detail}</p>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminCustomerWorkspace() {
  const { loadCustomers, detail, detailLoading, loadCustomerDetail } = useCustomerWorkspace();
  const { data, loading, error, search } = useCustomerSearch();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const runSearch = useCallback((nextQuery, nextStatus) => {
    const filter = nextStatus === 'all' ? undefined : { status: [nextStatus] };
    search({ query: nextQuery || undefined, filter }).catch(() => {});
  }, [search]);

  useEffect(() => {
    loadCustomers().catch(() => {});
    runSearch('', 'all');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleQueryChange = (value) => {
    setQuery(value);
    runSearch(value, statusFilter);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    runSearch(query, value);
  };

  const handleOpenDetail = (customerId) => {
    setSelectedCustomerId(customerId);
    loadCustomerDetail(customerId).catch(() => {});
  };

  const summaries = data?.summaries ?? [];

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', ...FS }}>
      <div style={{ background: '#1a2744', color: '#fff', padding: '0 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
          <div>
            <p style={{ margin: 0, fontWeight: 900, fontSize: 18, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              TFR Supply — Admin
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em' }}>
              CUSTOMER WORKSPACE
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={() => runSearch(query, statusFilter)}
              disabled={loading}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '7px 14px', fontSize: 12, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 2 }}
            >
              <RefreshCw size={13} /> {loading ? 'Loading…' : 'Refresh'}
            </button>
            <Link to="/admin/debug" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
              <Bug size={13} /> Debug
            </Link>
            <Link to="/admin" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>← Dashboard</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>
        <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', color: '#3730a3', fontSize: 12, padding: '10px 14px', borderRadius: 2, marginBottom: 24 }}>
          Demo data only — customer records, quote counts, and activity are deterministic fixtures served by customerWorkspaceService and the mock Customer Workspace adapter. No live database, CRM, or Shopify API calls are made. Editing is not yet implemented.
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 360 }}>
            <Search size={14} style={{ position: 'absolute', top: 10, left: 10, color: '#aaa' }} />
            <input
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search agency, contact, or email…"
              style={{ width: '100%', padding: '8px 10px 8px 30px', fontSize: 13, border: '1px solid #d1d5db', borderRadius: 2, boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {STATUS_OPTIONS.map((option) => {
              const isActive = statusFilter === option;
              return (
                <button
                  key={option}
                  onClick={() => handleStatusChange(option)}
                  style={{
                    padding: '7px 14px', fontSize: 12, fontWeight: isActive ? 700 : 400,
                    cursor: 'pointer', border: '1.5px solid',
                    borderColor: isActive ? '#1a2744' : '#d1d5db',
                    background: isActive ? '#1a2744' : '#fff',
                    color: isActive ? '#fff' : '#555',
                    borderRadius: 2,
                  }}
                >
                  {STATUS_LABELS[option]}
                </button>
              );
            })}
          </div>
        </div>

        {loading && summaries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#888', fontSize: 14 }}>Loading customers…</div>
        )}
        {error && (
          <div style={{ padding: '16px 20px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: 13, marginBottom: 20 }}>
            Failed to load customers: {error instanceof Error ? error.message : String(error)}
          </div>
        )}
        {!loading && !error && summaries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa', fontSize: 14 }}>No customers match this search.</div>
        )}

        {summaries.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#1a2744', color: '#fff' }}>
                  {['Agency', 'Contact', 'Vertical', 'Status', 'Shopify Sync', 'Quotes', 'Last Activity', ''].map((h) => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, letterSpacing: '0.05em', fontSize: 11, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summaries.map((summary, i) => (
                  <tr key={summary.customerId} style={{ background: i % 2 === 0 ? '#f9fafb' : '#fff', borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Building2 size={13} style={{ color: '#888' }} />
                        <span style={{ fontWeight: 700, color: '#1a2744' }}>{summary.record.customer.agencyName || summary.customerId}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div>{summary.record.customer.contactName || '—'}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#888', fontSize: 11 }}>
                        <Mail size={11} /> {summary.record.customer.contactEmail || '—'}
                      </div>
                      {summary.record.customer.contactPhone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#888', fontSize: 11 }}>
                          <Phone size={11} /> {summary.record.customer.contactPhone}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{summary.record.verticalId || '—'}</td>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}><Badge value={summary.record.status} styleMap={STATUS_STYLE} /></td>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}><Badge value={summary.record.shopifySyncStatus} styleMap={SYNC_STYLE} /></td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <ShoppingBag size={12} style={{ color: '#888' }} /> {summary.quoteCount}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#888' }}>
                      {summary.lastActivityAt ? new Date(summary.lastActivityAt).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => handleOpenDetail(summary.customerId)}
                        style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', border: '1px solid #1a2744', background: '#fff', color: '#1a2744', cursor: 'pointer', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <ClipboardList size={11} /> Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {summaries.length > 0 && (
          <p style={{ fontSize: 11, color: '#aaa', marginTop: 12, textAlign: 'right' }}>
            Showing {summaries.length} of {data?.total ?? summaries.length} customer{(data?.total ?? summaries.length) !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {selectedCustomerId && (
        <CustomerDetailModal detail={detail} loading={detailLoading} onClose={() => setSelectedCustomerId(null)} />
      )}
    </div>
  );
}
