/**
 * pages/AdminSalesDashboard.jsx
 * Issue 50 — Admin Sales Dashboard.
 *
 * The authenticated /admin landing page. Consumes adminSalesDashboardService,
 * which composes the existing admin authentication, Shopify sync dashboard,
 * pricing import dashboard, quote builder workspace, and quote persistence
 * services. No new sync, pricing, or quote logic lives on this page — every
 * status, metric, and count is read from an existing service's own result.
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminSalesDashboard } from '@/hooks/adminSalesDashboard';
import { useAdminAuthentication } from '@/hooks/adminAuth';
import {
  AlertTriangle, Bug, CheckCircle2, ClipboardList, Clock, FileEdit, Hammer, LogOut,
  RefreshCw, ShieldCheck, Upload, Users, Wrench, XCircle,
} from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const QUICK_ACTION_ICONS = { FileEdit, ClipboardList, RefreshCw, Upload, Users };
const ACTIVITY_ICONS = { 'quote-edit': FileEdit, 'pricing-import': Upload, 'sync-job': RefreshCw };

const STATUS_STYLE = {
  operational: { bg: '#dcfce7', text: '#15803d', border: '#86efac', Icon: CheckCircle2 },
  degraded: { bg: '#fef3c7', text: '#92400e', border: '#fde68a', Icon: AlertTriangle },
  unavailable: { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca', Icon: XCircle },
  passing: { bg: '#dcfce7', text: '#15803d', border: '#86efac', Icon: CheckCircle2 },
  failing: { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca', Icon: XCircle },
  ready: { bg: '#dcfce7', text: '#15803d', border: '#86efac', Icon: CheckCircle2 },
};

function StatusBadge({ value }) {
  const style = STATUS_STYLE[value] ?? STATUS_STYLE.unavailable;
  const Icon = style.Icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
      padding: '2px 8px', borderRadius: 2,
      background: style.bg, color: style.text, border: `1px solid ${style.border}`,
    }}>
      <Icon size={11} /> {value}
    </span>
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

function StatTile({ label, value, sublabel }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '16px 18px', borderRadius: 2 }}>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888' }}>{label}</p>
      <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 800, color: '#1a2744' }}>{value}</p>
      {sublabel && <p style={{ margin: '4px 0 0', fontSize: 11, color: '#aaa' }}>{sublabel}</p>}
    </div>
  );
}

function QuickActionCard({ action }) {
  const Icon = QUICK_ACTION_ICONS[action.icon] ?? ClipboardList;
  const content = (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 2, padding: 18, height: '100%',
      opacity: action.available ? 1 : 0.55, cursor: action.available ? 'pointer' : 'default',
      transition: 'border-color 0.15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ background: '#eef2ff', color: '#1a2744', width: 34, height: 34, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={17} />
        </div>
        {!action.available && (
          <span style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Coming Soon</span>
        )}
      </div>
      <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#1a2744' }}>{action.label}</p>
      <p style={{ margin: 0, fontSize: 12, color: '#888', lineHeight: 1.4 }}>{action.description}</p>
    </div>
  );

  if (!action.available) return content;
  return <Link to={action.href} style={{ textDecoration: 'none', display: 'block' }}>{content}</Link>;
}

const PLATFORM_STATUS_LABELS = {
  authentication: 'Authentication',
  sync: 'Shopify Sync',
  pricingEngine: 'Pricing Engine',
  quoteEngine: 'Quote Engine',
  imports: 'Pricing Imports',
};
const PLATFORM_STATUS_ORDER = ['authentication', 'sync', 'pricingEngine', 'quoteEngine', 'imports'];

function PlatformStatusGrid({ platformStatus }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
      {PLATFORM_STATUS_ORDER.map((key) => (
        <div key={key} style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '10px 12px', borderRadius: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: '#888' }}>
            <ShieldCheck size={13} />
            <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{PLATFORM_STATUS_LABELS[key]}</span>
          </div>
          <StatusBadge value={platformStatus[key]} />
        </div>
      ))}
    </div>
  );
}

function RecentActivityList({ entries }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 2 }}>
      {entries.map((entry, i) => {
        const Icon = ACTIVITY_ICONS[entry.kind] ?? Clock;
        return (
          <div key={entry.id} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderBottom: i === entries.length - 1 ? 'none' : '1px solid #f0f0f0' }}>
            <div style={{ background: '#f4f5f7', color: '#1a2744', width: 28, height: 28, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={14} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: '#1a2744' }}>{entry.label}</p>
                <span style={{ fontSize: 11, color: '#aaa', whiteSpace: 'nowrap' }}>{new Date(entry.occurredAt).toLocaleString()}</span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: '#666' }}>{entry.detail}</p>
              <p style={{ margin: '3px 0 0', fontSize: 11, color: '#aaa' }}>{entry.actor}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SystemHealthGrid({ systemHealth }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '10px 12px', borderRadius: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: '#888' }}>
          <Hammer size={13} />
          <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Build Status</span>
        </div>
        <StatusBadge value={systemHealth.buildStatus} />
      </div>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '10px 12px', borderRadius: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: '#888' }}>
          <ShieldCheck size={13} />
          <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Validation</span>
        </div>
        <StatusBadge value={systemHealth.validationStatus} />
      </div>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '10px 12px', borderRadius: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: '#888' }}>
          <Wrench size={13} />
          <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mock Services</span>
        </div>
        <StatusBadge value={systemHealth.mockServicesAvailable ? 'operational' : 'unavailable'} />
      </div>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '10px 12px', borderRadius: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: '#888' }}>
          <Wrench size={13} />
          <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Adapters</span>
        </div>
        <StatusBadge value={systemHealth.adaptersAvailable ? 'operational' : 'unavailable'} />
      </div>
    </div>
  );
}

export default function AdminSalesDashboard() {
  const { data, loading, error, loadDashboard } = useAdminSalesDashboard();
  const { session, signOut } = useAdminAuthentication();

  useEffect(() => {
    loadDashboard().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', ...FS }}>
      <div style={{ background: '#1a2744', color: '#fff', padding: '0 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
          <div>
            <p style={{ margin: 0, fontWeight: 900, fontSize: 18, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              TFR Supply — Admin
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em' }}>
              SALES DASHBOARD{session ? ` · ${session.user.label.toUpperCase()}` : ''}
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
            {session && (
              <button
                onClick={() => signOut()}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
              >
                <LogOut size={13} /> Sign Out
              </button>
            )}
            <Link to="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>← Store</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>
        <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', color: '#3730a3', fontSize: 12, padding: '10px 14px', borderRadius: 2, marginBottom: 24 }}>
          Demo data only — platform status and metrics below are produced by the real admin authentication, Shopify sync, pricing import, quote builder, and quote persistence services running against their existing mock adapters. No live Shopify, database, or email calls are made.
        </div>

        {loading && !data && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#888', fontSize: 14 }}>Loading admin sales dashboard…</div>
        )}
        {error && (
          <div style={{ padding: '16px 20px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: 13, marginBottom: 20 }}>
            Failed to load admin sales dashboard: {error instanceof Error ? error.message : String(error)}
          </div>
        )}

        {data && (
          <>
            <Section title="Quick Actions">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                {data.quickActions.map((action) => <QuickActionCard key={action.id} action={action} />)}
              </div>
            </Section>

            <Section title="Platform Status" description="Live status of each foundation this dashboard composes.">
              <PlatformStatusGrid platformStatus={data.platformStatus} />
            </Section>

            <Section title="Recent Activity" description="Deterministic demo activity feed — no persistence backs this list.">
              <RecentActivityList entries={data.recentActivity} />
            </Section>

            <Section title="Platform Metrics">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
                <StatTile label="Quotes Created" value={data.metrics.quotesCreated} sublabel="Demo quote builder scenarios" />
                <StatTile label="Imports Processed" value={data.metrics.importsProcessed} sublabel="Pricing import runs" />
                <StatTile label="Sync Jobs" value={data.metrics.syncJobsRun} sublabel="Shopify job queue" />
                <StatTile label="Validation" value={<StatusBadge value={data.metrics.validationStatus} />} />
                <StatTile label="Test Environment" value={<StatusBadge value={data.metrics.testEnvironmentStatus} />} />
              </div>
            </Section>

            <Section title="System Health">
              <SystemHealthGrid systemHealth={data.systemHealth} />
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
