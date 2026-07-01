/**
 * pages/AdminPricingImportDashboard.jsx
 * Issue 28 — Admin Pricing Import Dashboard.
 *
 * Consumes pricingImportDashboardService, which orchestrates the existing
 * pricingImportService (pipeline: parser -> normalizer -> Zod validation) against
 * mock adapters only. No live file uploads, storage, or persistence happen here.
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePricingImportDashboard } from '@/hooks/pricingImportDashboard';
import { checkAdminAccess } from '@/services/adminAccessService';
import {
  AlertTriangle, Bug, CheckCircle2, Clock, Copy, FileText, Info, RefreshCw, ShieldOff, XCircle,
} from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const TABS = ['summary', 'upload-status', 'history', 'validation', 'failed', 'duplicates', 'statistics'];
const TAB_LABELS = {
  summary: 'Import Summary',
  'upload-status': 'Upload Status',
  history: 'Import History',
  validation: 'Validation Results',
  failed: 'Failed Records',
  duplicates: 'Duplicate Detection',
  statistics: 'Import Statistics',
};

const STATUS_BADGE = {
  pending: { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db', Icon: Clock },
  parsed: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd', Icon: FileText },
  normalized: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd', Icon: FileText },
  validated: { bg: '#dcfce7', text: '#15803d', border: '#86efac', Icon: CheckCircle2 },
  invalid: { bg: '#fef3c7', text: '#92400e', border: '#fde68a', Icon: AlertTriangle },
  failed: { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca', Icon: XCircle },
};

const UPLOAD_STATUS_BADGE = {
  queued: { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db', Icon: Clock },
  processing: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd', Icon: RefreshCw },
  completed: { bg: '#dcfce7', text: '#15803d', border: '#86efac', Icon: CheckCircle2 },
  failed: { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca', Icon: XCircle },
};

const SEVERITY_BADGE = {
  info: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd', Icon: Info },
  warning: { bg: '#fef3c7', text: '#92400e', border: '#fde68a', Icon: AlertTriangle },
  error: { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca', Icon: XCircle },
};

// ── Shared bits ──────────────────────────────────────────────────────────────

function Badge({ map, value }) {
  const c = map[value] || Object.values(map)[0];
  const Icon = c.Icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
      padding: '2px 8px', borderRadius: 2,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
    }}>
      <Icon size={11} /> {value}
    </span>
  );
}

function StatTile({ label, value, sublabel, tone = 'neutral' }) {
  const toneColors = { neutral: '#1a2744', good: '#15803d', warning: '#92400e', critical: '#b91c1c' };
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '16px 18px', borderRadius: 2 }}>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888' }}>{label}</p>
      <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 800, color: toneColors[tone] || toneColors.neutral }}>{value}</p>
      {sublabel && <p style={{ margin: '4px 0 0', fontSize: 11, color: '#aaa' }}>{sublabel}</p>}
    </div>
  );
}

function CountPillRow({ counts, labelFor }) {
  const entries = Object.entries(counts);
  if (entries.length === 0) return <p style={{ fontSize: 12, color: '#aaa' }}>No records.</p>;
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {entries.map(([key, count]) => (
        <span key={key} style={{ fontSize: 12, padding: '5px 12px', background: '#f4f5f7', border: '1px solid #e5e7eb', borderRadius: 2, color: '#1a2744' }}>
          <strong>{count}</strong> {labelFor ? labelFor(key) : key}
        </span>
      ))}
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#1a2744', marginBottom: description ? 2 : 10 }}>{title}</p>
      {description && <p style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>{description}</p>}
      {children}
    </div>
  );
}

function formatMoney(amount) {
  return typeof amount === 'number' ? `$${amount.toLocaleString()}` : '—';
}

function formatDateTime(iso) {
  return iso ? new Date(iso).toLocaleString() : '—';
}

function describeRecord(record) {
  switch (record.kind) {
    case 'list-price': return `List price ${formatMoney(record.record.price?.amount)}`;
    case 'dealer-cost': return `Dealer cost ${formatMoney(record.record.cost?.amount)}`;
    case 'contract-price': return `Contract price ${formatMoney(record.record.sellingPrice?.amount)}`;
    case 'bundle-pricing': return `Bundle ${record.record.id}`;
    default: return record.kind;
  }
}

// ── Panels ────────────────────────────────────────────────────────────────────

function SummaryPanel({ data }) {
  const { summary } = data;
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatTile label="Import Runs" value={summary.totalRuns} />
        <StatTile label="Parsed Rows" value={summary.totalParsedRows} />
        <StatTile label="Valid Records" value={summary.totalValidRecords} tone="good" />
        <StatTile label="Invalid Records" value={summary.totalInvalidRecords} tone={summary.totalInvalidRecords > 0 ? 'warning' : 'neutral'} />
        <StatTile label="Validation Issues" value={summary.totalIssues} tone={summary.totalIssues > 0 ? 'warning' : 'neutral'} />
      </div>
      <Section title="Runs by Status">
        <CountPillRow counts={summary.runsByStatus} />
      </Section>
      <Section title="Records by Kind" description="Valid, normalized records accepted into the pricing domain, grouped by record kind.">
        <CountPillRow counts={summary.recordsByKind} />
      </Section>
    </>
  );
}

function UploadStatusPanel({ data }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
      {data.runs.map((run) => (
        <div key={run.id} style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 16, borderRadius: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1a2744' }}>{run.label}</p>
            <Badge map={UPLOAD_STATUS_BADGE} value={run.uploadStatus} />
          </div>
          <p style={{ fontSize: 11, color: '#888', margin: '0 0 6px' }}>
            {run.source.kind} {run.source.filename ? `· ${run.source.filename}` : ''}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa' }}>
            <span>Started {formatDateTime(run.startedAt)}</span>
            <Badge map={STATUS_BADGE} value={run.result.status} />
          </div>
        </div>
      ))}
    </div>
  );
}

function HistoryPanel({ data }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#1a2744', color: '#fff' }}>
            {['Run', 'Source Kind', 'Status', 'Started', 'Parsed', 'Valid', 'Invalid'].map((h) => (
              <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.history.map((entry, i) => (
            <tr key={entry.runId} style={{ background: i % 2 === 0 ? '#f9fafb' : '#fff', borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1a2744' }}>{entry.label}</td>
              <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#1a1a1a' }}>{entry.sourceKind}</td>
              <td style={{ padding: '10px 12px' }}><Badge map={STATUS_BADGE} value={entry.status} /></td>
              <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#888' }}>{formatDateTime(entry.startedAt)}</td>
              <td style={{ padding: '10px 12px', textAlign: 'center', color: '#1a1a1a' }}>{entry.parsedRowCount}</td>
              <td style={{ padding: '10px 12px', textAlign: 'center', color: '#15803d' }}>{entry.validRecordCount}</td>
              <td style={{ padding: '10px 12px', textAlign: 'center', color: entry.invalidRecordCount > 0 ? '#b91c1c' : '#aaa' }}>{entry.invalidRecordCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IssuesTable({ issues, emptyLabel }) {
  if (issues.length === 0) {
    return <p style={{ fontSize: 12, color: '#aaa', padding: '24px 0', textAlign: 'center' }}>{emptyLabel}</p>;
  }
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#1a2744', color: '#fff' }}>
            {['Severity', 'Message', 'SKU', 'Row', 'Field Path'].map((h) => (
              <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {issues.map((issue, i) => (
            <tr key={`${issue.code}-${issue.rowNumber ?? 'n'}-${i}`} style={{ background: i % 2 === 0 ? '#f9fafb' : '#fff', borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '10px 12px' }}><Badge map={SEVERITY_BADGE} value={issue.severity} /></td>
              <td style={{ padding: '10px 12px', color: '#1a1a1a' }}>{issue.message}</td>
              <td style={{ padding: '10px 12px', fontFamily: 'monospace', whiteSpace: 'nowrap', color: '#1a1a1a' }}>{issue.sku || '—'}</td>
              <td style={{ padding: '10px 12px', textAlign: 'center', color: '#1a1a1a' }}>{issue.rowNumber ?? '—'}</td>
              <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: '#888' }}>{issue.fieldPath || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ValidationPanel({ data }) {
  return <IssuesTable issues={data.issues} emptyLabel="No validation issues across any import run." />;
}

function FailedRecordsPanel({ data }) {
  const failed = data.issues.filter((issue) => issue.severity === 'error');
  return <IssuesTable issues={failed} emptyLabel="No failed records — every normalized record passed validation." />;
}

function DuplicatesPanel({ data }) {
  if (data.duplicates.length === 0) {
    return <p style={{ fontSize: 12, color: '#aaa', padding: '24px 0', textAlign: 'center' }}>No duplicate SKUs detected across import runs.</p>;
  }
  const runLabelById = Object.fromEntries(data.runs.map((run) => [run.id, run.label]));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {data.duplicates.map((group) => (
        <div key={`${group.kind}-${group.sku}`} style={{ background: '#fff', border: '1px solid #fde68a', borderLeft: '4px solid #f59e0b', padding: 16, borderRadius: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Copy size={14} color="#92400e" />
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1a2744' }}>{group.sku}</p>
            <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>{group.kind}</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#92400e' }}>{group.count}× occurrences</span>
          </div>
          <p style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>
            Found in: {group.runIds.map((id) => runLabelById[id] || id).join(', ')}
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#555' }}>
            {group.records.map((record, i) => (
              <li key={i}>{describeRecord(record)}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function StatisticsPanel({ data }) {
  const { statistics } = data;
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatTile label="Success Rate" value={`${Math.round(statistics.successRate * 100)}%`} tone="good" />
        <StatTile label="Error Rate" value={`${Math.round(statistics.errorRate * 100)}%`} tone={statistics.errorRate > 0 ? 'warning' : 'neutral'} />
        <StatTile label="Avg Records / Run" value={statistics.averageRecordsPerRun.toFixed(1)} />
        <StatTile label="Duplicate Records" value={statistics.duplicateRecordCount} tone={statistics.duplicateRecordCount > 0 ? 'warning' : 'neutral'} />
      </div>
      <Section title="Issues by Severity">
        <CountPillRow counts={statistics.issuesBySeverity} />
      </Section>
    </>
  );
}

const PANELS = {
  summary: SummaryPanel,
  'upload-status': UploadStatusPanel,
  history: HistoryPanel,
  validation: ValidationPanel,
  failed: FailedRecordsPanel,
  duplicates: DuplicatesPanel,
  statistics: StatisticsPanel,
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminPricingImportDashboard() {
  const [accessStatus, setAccessStatus] = useState('checking');
  const [accessReason, setAccessReason] = useState('');
  const [activeTab, setActiveTab] = useState('summary');
  const { data, loading, error, loadDashboard } = usePricingImportDashboard();

  useEffect(() => {
    checkAdminAccess().then(({ authorized, reason }) => {
      setAccessStatus(authorized ? 'authorized' : 'denied');
      if (!authorized) setAccessReason(reason || 'Access denied.');
    });
  }, []);

  useEffect(() => {
    if (accessStatus === 'authorized') loadDashboard().catch(() => {});
  }, [accessStatus, loadDashboard]);

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

  const Panel = PANELS[activeTab];

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', ...FS }}>
      <div style={{ background: '#1a2744', color: '#fff', padding: '0 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
          <div>
            <p style={{ margin: 0, fontWeight: 900, fontSize: 18, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              TFR Supply — Admin
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em' }}>
              PRICING IMPORT DASHBOARD
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button
              onClick={() => loadDashboard().catch(() => {})}
              disabled={loading}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '7px 14px', fontSize: 12, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 2 }}
            >
              <RefreshCw size={13} /> {loading ? 'Loading…' : 'Refresh'}
            </button>
            <Link to="/admin/debug" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
              <Bug size={13} /> Debug
            </Link>
            <Link to="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>← Store</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>
        <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', color: '#3730a3', fontSize: 12, padding: '10px 14px', borderRadius: 2, marginBottom: 20 }}>
          Demo data only — every run on this dashboard is produced by mock parser/normalizer adapters through <code>pricingImportService</code>. No files are uploaded, stored, or persisted.
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '7px 16px', fontSize: 12, fontWeight: isActive ? 700 : 400,
                  cursor: 'pointer', border: '1.5px solid',
                  borderColor: isActive ? '#1a2744' : '#d1d5db',
                  background: isActive ? '#1a2744' : '#fff',
                  color: isActive ? '#fff' : '#555',
                  borderRadius: 2,
                }}
              >
                {TAB_LABELS[tab]}
              </button>
            );
          })}
        </div>

        {loading && !data && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#888', fontSize: 14 }}>Loading pricing import dashboard…</div>
        )}
        {error && (
          <div style={{ padding: '16px 20px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: 13, marginBottom: 20 }}>
            Failed to load pricing import dashboard: {error instanceof Error ? error.message : String(error)}
          </div>
        )}
        {data && <Panel data={data} />}
      </div>
    </div>
  );
}
