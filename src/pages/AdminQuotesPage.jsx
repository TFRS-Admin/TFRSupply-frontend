/**
 * pages/AdminQuotesPage.jsx
 * Sprint 8 — Internal quote queue for reviewing configurator submissions.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  loadQuotes, advanceQuoteStatus,
  STATUS_ORDER, STATUS_LABELS, STATUS_COLORS, deriveReferenceId, nextStatus,
} from '@/services/adminQuoteService';
import { checkAdminAccess } from '@/services/adminAccessService';
import { ChevronDown, ChevronRight, RefreshCw, X, ArrowRight, Bug, ShieldOff } from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

// ── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.new;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
      padding: '2px 8px', borderRadius: 2,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
    }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────

function QuoteDetailModal({ quote, onClose }) {
  if (!quote) return null;
  const ref = deriveReferenceId(quote);

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a2744', borderBottom: '2px solid #1a2744', paddingBottom: 4, marginBottom: 10 }}>
        {title}
      </p>
      {children}
    </div>
  );

  const Row = ({ label, value }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#888' }}>{label}</span>
      <span style={{ fontSize: 12, color: '#1a1a1a', wordBreak: 'break-word' }}>{value || '—'}</span>
    </div>
  );

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#fff', maxWidth: 680, width: '100%', maxHeight: '90vh', overflowY: 'auto', ...FS }}>
        {/* Modal header */}
        <div style={{ background: '#1a2744', color: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0 }}>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{quote.productTitle}</p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>
              {ref} · <StatusBadge status={quote.status} />
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          <Section title="Configuration">
            <Row label="SKU Preview" value={quote.skuPreview} />
            {quote.selectedOptions?.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 6 }}>Selected Options</p>
                <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                  <tbody>
                    {quote.selectedOptions.map((o, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#f7f8fa' : '#fff' }}>
                        <td style={{ padding: '5px 10px', fontWeight: 600, color: '#444', width: '40%' }}>{o.stepLabel}</td>
                        <td style={{ padding: '5px 10px', color: '#1a1a1a' }}>{Array.isArray(o.selected) ? o.selected.join(', ') : o.selected}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {quote.accessories?.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 6 }}>Accessories</p>
                {quote.accessories.map((a, i) => (
                  <div key={i} style={{ fontSize: 12, color: '#1a1a1a', padding: '3px 0' }}>
                    • {a.optionLabel}{a.priceModifier > 0 ? ` (+$${a.priceModifier})` : ''}
                  </div>
                ))}
              </div>
            )}
          </Section>

          {(quote.dependencyNotes?.length > 0 || quote.warningNotes?.length > 0) && (
            <Section title="Notes & Advisories">
              {quote.dependencyNotes?.map((n, i) => (
                <div key={i} style={{ fontSize: 12, color: '#1e40af', padding: '3px 0' }}>• {n}</div>
              ))}
              {quote.warningNotes?.map((n, i) => (
                <div key={i} style={{ fontSize: 12, color: '#92400e', padding: '3px 0' }}>⚠ {n}</div>
              ))}
            </Section>
          )}

          <Section title="Contact">
            <Row label="Name" value={quote.contactName} />
            <Row label="Agency" value={quote.agency} />
            <Row label="Email" value={quote.email} />
            <Row label="Phone" value={quote.phone} />
            <Row label="Vehicle Count" value={quote.vehicleCount} />
            {quote.notes && <Row label="Notes" value={quote.notes} />}
          </Section>

          <Section title="Metadata">
            <Row label="Reference #" value={ref} />
            <Row label="Submission ID" value={quote.submissionId} />
            <Row label="Submitted" value={quote.submittedAt ? new Date(quote.submittedAt).toLocaleString() : '—'} />
            <Row label="Source" value={quote.source} />
            <Row label="Record ID" value={quote.id} />
          </Section>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminQuotesPage() {
  // ── Access guard — checked before any data is loaded ──────────────────────
  const [accessStatus, setAccessStatus] = useState('checking'); // checking | authorized | denied
  const [accessReason, setAccessReason] = useState('');

  useEffect(() => {
    checkAdminAccess().then(({ authorized, reason }) => {
      setAccessStatus(authorized ? 'authorized' : 'denied');
      if (!authorized) setAccessReason(reason || 'Access denied.');
    });
  }, []);

  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [detailQuote, setDetailQuote] = useState(null);
  const [advancing, setAdvancing] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadQuotes();
      setQuotes(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Only load records once access is confirmed
  useEffect(() => {
    if (accessStatus === 'authorized') load();
  }, [accessStatus, load]);

  const handleAdvance = async (quote) => {
    setAdvancing(a => ({ ...a, [quote.id]: true }));
    try {
      const updated = await advanceQuoteStatus(quote.id, quote.status);
      setQuotes(qs => qs.map(q => q.id === quote.id ? { ...q, status: updated.status } : q));
    } catch (e) {
      alert(e.message);
    } finally {
      setAdvancing(a => ({ ...a, [quote.id]: false }));
    }
  };

  const filtered = activeFilter === 'all' ? quotes : quotes.filter(q => q.status === activeFilter);

  const counts = { all: quotes.length };
  STATUS_ORDER.forEach(s => { counts[s] = quotes.filter(q => q.status === s).length; });

  // ── Access checking / denied states ────────────────────────────────────────
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
          <p style={{ marginTop: 20, fontSize: 10, color: '#bbb', fontStyle: 'italic' }}>
            Prototype guard — see appConfig.adminEmails to update the allowlist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', ...FS }}>
      {/* Header */}
      <div style={{ background: '#1a2744', color: '#fff', padding: '0 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
          <div>
            <p style={{ margin: 0, fontWeight: 900, fontSize: 18, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              TFR Supply — Admin
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em' }}>
              QUOTE REQUEST QUEUE
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={load}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '7px 14px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 2 }}
            >
              <RefreshCw size={13} /> Refresh
            </button>
            <Link to="/admin/debug" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
              <Bug size={13} /> Debug
            </Link>
            <Link to="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>← Store</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>

        {/* Status filter tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
          {['all', ...STATUS_ORDER].map(s => {
            const isActive = activeFilter === s;
            return (
              <button
                key={s}
                onClick={() => setActiveFilter(s)}
                style={{
                  padding: '7px 16px', fontSize: 12, fontWeight: isActive ? 700 : 400,
                  cursor: 'pointer', border: '1.5px solid',
                  borderColor: isActive ? '#1a2744' : '#d1d5db',
                  background: isActive ? '#1a2744' : '#fff',
                  color: isActive ? '#fff' : '#555',
                  borderRadius: 2,
                }}
              >
                {s === 'all' ? 'All' : STATUS_LABELS[s]} ({counts[s] ?? 0})
              </button>
            );
          })}
        </div>

        {/* States */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#888', fontSize: 14 }}>Loading quote requests…</div>
        )}
        {error && (
          <div style={{ padding: '16px 20px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: 13, marginBottom: 20 }}>
            Failed to load quotes: {error}
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa', fontSize: 14 }}>
            {activeFilter === 'all' ? 'No quote requests yet.' : `No quotes with status "${STATUS_LABELS[activeFilter]}".`}
          </div>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#1a2744', color: '#fff' }}>
                  {['Ref #', 'Status', 'Contact', 'Agency', 'Email', 'Product', 'SKU Preview', 'Vehicles', 'Submitted', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, letterSpacing: '0.05em', fontSize: 11, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((q, i) => {
                  const ref = deriveReferenceId(q);
                  const next = nextStatus(q.status);
                  const isAdvancing = !!advancing[q.id];
                  return (
                    <tr key={q.id} style={{ background: i % 2 === 0 ? '#f9fafb' : '#fff', borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#1a2744', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{ref}</td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}><StatusBadge status={q.status} /></td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{q.contactName}</td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{q.agency}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <a href={`mailto:${q.email}`} style={{ color: '#1a2744', textDecoration: 'none' }}>{q.email}</a>
                      </td>
                      <td style={{ padding: '10px 12px', maxWidth: 180 }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.productTitle}</span>
                      </td>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', whiteSpace: 'nowrap', color: '#555' }}>{q.skuPreview || '—'}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>{q.vehicleCount || '—'}</td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#888' }}>
                        {q.submittedAt ? new Date(q.submittedAt).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          {/* Detail button */}
                          <button
                            onClick={() => setDetailQuote(q)}
                            style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', border: '1px solid #1a2744', background: '#fff', color: '#1a2744', cursor: 'pointer', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <ChevronDown size={11} /> Detail
                          </button>
                          {/* Advance button */}
                          {next && (
                            <button
                              onClick={() => handleAdvance(q)}
                              disabled={isAdvancing}
                              style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', border: 'none', background: isAdvancing ? '#ccc' : '#c8102e', color: '#fff', cursor: isAdvancing ? 'not-allowed' : 'pointer', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <ArrowRight size={11} /> {STATUS_LABELS[next]}
                            </button>
                          )}
                          {!next && <span style={{ fontSize: 11, color: '#aaa' }}>Closed</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary line */}
        {!loading && quotes.length > 0 && (
          <p style={{ fontSize: 11, color: '#aaa', marginTop: 12, textAlign: 'right' }}>
            Showing {filtered.length} of {quotes.length} quote{quotes.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Detail modal */}
      {detailQuote && (
        <QuoteDetailModal
          quote={detailQuote}
          onClose={() => setDetailQuote(null)}
        />
      )}
    </div>
  );
}