/**
 * components/fleetBuilds/FleetTemplatesWorkspaceSection.jsx
 * /workspace section — saved Fleet Templates summary: template count, recent
 * templates (name/vehicle/style/completion), how many fleet builds are
 * currently using each template, and an aggregate completion summary. Pure/
 * presentational (props-driven), matching FleetBuildsWorkspaceSection's
 * convention of resolving context state in the connected WorkspaceDashboard
 * wrapper rather than reading its own context.
 */
import React from 'react';
import { Boxes, ArrowRight } from 'lucide-react';
import { countBuildsUsingTemplate, getBuildStyleLabel } from '@/domain/fleetBuilds';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };
const RECENT_TEMPLATE_LIMIT = 5;

function sortByRecentUsage(templates) {
  return [...templates].sort((a, b) => (b.lastUsedAt ?? b.createdAt) - (a.lastUsedAt ?? a.createdAt));
}

function averageCompletion(templates) {
  if (templates.length === 0) return 0;
  const total = templates.reduce((sum, template) => sum + template.completionPercent, 0);
  return Math.round(total / templates.length);
}

function TemplateSummaryRow({ template, buildsUsingTemplate }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 4, padding: '12px 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
        <p style={{ ...FS, fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{template.name}</p>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#1a2744', background: '#f0f4ff', padding: '2px 8px', borderRadius: 999 }}>
          {template.completionPercent}% Complete
        </span>
      </div>
      <p style={{ ...FS, fontSize: 12, color: '#666', margin: '0 0 4px' }}>
        {template.vehicle ? `${template.vehicle.year} ${template.vehicle.make} ${template.vehicle.model}` : 'No vehicle saved'}
        {' · '}{getBuildStyleLabel(template.buildStyle)}
      </p>
      <p style={{ ...FS, fontSize: 12, color: '#888', margin: 0 }}>
        {buildsUsingTemplate} vehicle{buildsUsingTemplate === 1 ? '' : 's'} using this template
      </p>
    </div>
  );
}

export default function FleetTemplatesWorkspaceSection({ templates, builds, onOpenFleetBuilds }) {
  const recentTemplates = sortByRecentUsage(templates).slice(0, RECENT_TEMPLATE_LIMIT);

  return (
    <section style={{ marginBottom: 32 }} data-testid="fleet-templates-workspace-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <p style={{
          ...FS, fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
          color: '#1a2744', display: 'flex', alignItems: 'center', gap: 8, margin: 0,
        }}>
          <Boxes size={14} /> {`Fleet Templates (${templates.length})`}
        </p>
        <button
          type="button"
          onClick={onOpenFleetBuilds}
          style={{ ...FS, fontSize: 12, fontWeight: 700, color: '#c8102e', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          Open Fleet Builds <ArrowRight size={12} />
        </button>
      </div>

      {templates.length > 0 ? (
        <>
          <p style={{ ...FS, fontSize: 12, color: '#666', margin: '0 0 12px' }}>
            Average completion across saved templates: <strong>{averageCompletion(templates)}%</strong>
          </p>
          <div className="workspace-fleet-templates-grid grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentTemplates.map((template) => (
              <TemplateSummaryRow
                key={template.id}
                template={template}
                buildsUsingTemplate={countBuildsUsingTemplate(builds, template.id)}
              />
            ))}
          </div>
        </>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '24px 20px' }}>
          <p style={{ ...FS, fontSize: 13, color: '#888', lineHeight: 1.6, margin: 0 }}>
            No saved templates yet. Save a complete fleet build as a template to reuse it across your fleet.
          </p>
          <button
            type="button"
            onClick={onOpenFleetBuilds}
            style={{ ...FS, marginTop: 12, fontSize: 12, fontWeight: 700, color: '#fff', background: '#c8102e', border: 'none', padding: '9px 16px', cursor: 'pointer' }}
          >
            Open Fleet Builds
          </button>
        </div>
      )}
    </section>
  );
}
