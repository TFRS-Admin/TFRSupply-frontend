/**
 * components/procurementPackages/ProcurementPackagesWorkspaceSection.jsx
 * /workspace's "Procurement Packages" card — Package Count, Ready Packages,
 * Blocked Packages, and an "Open Procurement Workspace" link into
 * /procurement. Pure, props-driven, mirroring
 * src/components/fleetQuote/ProjectQuoteWorkspaceSection.jsx's convention of
 * resolving its data in the connected WorkspaceDashboard wrapper.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Boxes, ArrowRight } from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

export default function ProcurementPackagesWorkspaceSection({ hasActiveProject, summary }) {
  return (
    <section style={{ marginBottom: 32 }} data-testid="procurement-packages-workspace-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <p style={{
          ...FS, fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
          color: '#1a2744', display: 'flex', alignItems: 'center', gap: 8, margin: 0,
        }}>
          <Boxes size={14} /> Procurement Packages
        </p>
        {hasActiveProject && (
          <Link to="/procurement" style={{ ...FS, fontSize: 12, fontWeight: 700, color: '#c8102e', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            Open Procurement Workspace <ArrowRight size={12} />
          </Link>
        )}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '18px 20px' }}>
        {!hasActiveProject ? (
          <p style={{ ...FS, fontSize: 13, color: '#888', lineHeight: 1.6, margin: 0 }}>
            Create or select a Fleet Project to build its procurement packages.
          </p>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }} data-testid="procurement-packages-workspace-stats">
              <span style={{ ...FS, fontSize: 13, color: '#444' }}>
                <strong style={{ color: '#1a2744' }}>{summary.packageCount}</strong> package{summary.packageCount === 1 ? '' : 's'}
              </span>
              <span style={{ ...FS, fontSize: 13, color: '#166534' }}>
                <strong>{summary.readyCount}</strong> ready
              </span>
              <span style={{ ...FS, fontSize: 13, color: '#b91c1c' }}>
                <strong>{summary.blockedCount}</strong> blocked
              </span>
            </div>
            <div style={{ marginTop: 12 }}>
              <Link
                to="/procurement"
                style={{
                  ...FS, fontSize: 13, fontWeight: 700, color: '#fff', background: '#1a2744', padding: '10px 16px',
                  minHeight: 40, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
              >
                Open Procurement Workspace <ArrowRight size={14} />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
