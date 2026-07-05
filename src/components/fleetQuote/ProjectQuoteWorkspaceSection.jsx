/**
 * components/fleetQuote/ProjectQuoteWorkspaceSection.jsx
 * /workspace's "Project Quote" card — quote readiness for the active Fleet
 * Project, a missing-equipment count, and an "Open Project Quote" link into
 * /project-quote. Pure, props-driven, matching
 * GuidedUpfitBuilderWorkspaceSection's convention of resolving its data in
 * the connected WorkspaceDashboard wrapper.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { FileSpreadsheet, ArrowRight } from 'lucide-react';
import QuoteReadinessBadge from './QuoteReadinessBadge';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

export default function ProjectQuoteWorkspaceSection({ hasActiveProject, projectName, quoteStatus, requiredEquipmentRemaining = 0, recommendedEquipmentRemaining = 0 }) {
  return (
    <section style={{ marginBottom: 32 }} data-testid="project-quote-workspace-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <p style={{
          ...FS, fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
          color: '#1a2744', display: 'flex', alignItems: 'center', gap: 8, margin: 0,
        }}>
          <FileSpreadsheet size={14} /> Project Quote
        </p>
        {hasActiveProject && (
          <Link to="/project-quote" style={{ ...FS, fontSize: 12, fontWeight: 700, color: '#c8102e', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            Open Project Quote <ArrowRight size={12} />
          </Link>
        )}
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '18px 20px' }}>
        {!hasActiveProject ? (
          <p style={{ ...FS, fontSize: 13, color: '#888', lineHeight: 1.6, margin: 0 }}>
            Create or select a Fleet Project to generate its project quote.
          </p>
        ) : (
          <>
            <p style={{ ...FS, fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: '0 0 10px' }}>{projectName}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <QuoteReadinessBadge readiness={quoteStatus} compact showReasons={false} />
              <span style={{ ...FS, fontSize: 12, color: '#666' }}>
                {requiredEquipmentRemaining} required · {recommendedEquipmentRemaining} recommended item(s) remaining
              </span>
            </div>
            <div style={{ marginTop: 12 }}>
              <Link
                to="/project-quote"
                style={{
                  ...FS, fontSize: 13, fontWeight: 700, color: '#fff', background: '#1a2744', padding: '10px 16px',
                  minHeight: 40, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
                }}
              >
                Open Project Quote <ArrowRight size={14} />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
