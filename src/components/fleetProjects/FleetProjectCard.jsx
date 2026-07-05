/**
 * components/fleetProjects/FleetProjectCard.jsx
 * One Fleet Project's summary and controls: name (renamable inline, like
 * FleetBuildCard/FleetTemplateRow), vehicle/build/template counts, average
 * completion, last modified, an Active badge, and Open/Duplicate/Rename/
 * Archive/Delete actions (Restore/Delete only once archived). Pure/props-
 * driven — all mutation callbacks come from the caller
 * (FleetProjectsWorkspaceSection); this component holds no persistence logic.
 */
import React, { useState } from 'react';
import { FolderOpen, Copy, Pencil, Archive, ArchiveRestore, Trash2, HeartPulse } from 'lucide-react';
import FleetBuildCompletionBadge from '@/components/fleetBuilds/FleetBuildCompletionBadge';
import AssignStandardControl from '@/components/departmentStandards/AssignStandardControl';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const statLabelStyle = {
  ...FS, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#999', margin: '0 0 3px',
};
const statValueStyle = { ...FS, fontSize: 16, fontWeight: 800, color: '#1a2744', margin: 0 };

const baseBtnStyle = {
  ...FS, fontSize: 11, fontWeight: 700, borderRadius: 2, padding: '6px 10px', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 4, border: '1.5px solid transparent',
};
const primaryBtnStyle = { ...baseBtnStyle, color: '#fff', background: '#c8102e' };
const secondaryBtnStyle = { ...baseBtnStyle, color: '#1a2744', background: 'none', border: '1.5px solid #1a2744' };
const dangerBtnStyle = { ...baseBtnStyle, color: '#b91c1c', background: 'none', border: '1.5px solid #fca5a5' };

function formatDate(timestamp) {
  if (!timestamp) return 'Never';
  return new Date(timestamp).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const HEALTH_COLORS = {
  red: { bg: '#fee2e2', fg: '#b91c1c', bar: '#dc2626' },
  yellow: { bg: '#fef3c7', fg: '#92400e', bar: '#d97706' },
  green: { bg: '#dcfce7', fg: '#166534', bar: '#16a34a' },
};

export default function FleetProjectCard({
  project, summary, isActive,
  onOpen, onDuplicate, onRename, onArchive, onUnarchive, onDelete,
  defaultStandards = [], companyStandards = [], onAssignStandard, health = null,
}) {
  const [name, setName] = useState(project.name);
  const [editing, setEditing] = useState(false);

  function commitRename() {
    const trimmed = name.trim();
    setEditing(false);
    if (trimmed && trimmed !== project.name) onRename(trimmed);
    else setName(project.name);
  }

  const completion = { percent: summary.averageCompletionPercent, color: summary.completionColor };

  return (
    <div
      data-testid="fleet-project-card"
      data-project-id={project.id}
      style={{
        border: isActive ? '2px solid #c8102e' : '1px solid #e5e7eb',
        borderRadius: 4, padding: '16px 18px', marginBottom: 14,
        background: project.archived ? '#fafafa' : (isActive ? '#fff8f8' : '#fff'),
        opacity: project.archived ? 0.8 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {editing ? (
          <input
            type="text"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
            aria-label="Fleet project name"
            style={{ ...FS, flex: '1 1 160px', minWidth: 120, fontSize: 15, fontWeight: 700, color: '#1a1a1a', border: 'none', borderBottom: '1.5px solid #eee', padding: '2px 0', outline: 'none', background: 'transparent' }}
          />
        ) : (
          <p style={{ ...FS, flex: '1 1 160px', minWidth: 120, fontSize: 15, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
            {project.name}
          </p>
        )}
        {isActive && (
          <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: '#c8102e', padding: '3px 8px', borderRadius: 2, letterSpacing: '0.05em', whiteSpace: 'nowrap' }} data-testid="fleet-project-active-badge">
            ACTIVE
          </span>
        )}
        {project.archived && (
          <span style={{ fontSize: 10, fontWeight: 700, color: '#666', background: '#eee', padding: '3px 8px', borderRadius: 2, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
            ARCHIVED
          </span>
        )}
      </div>

      <div className="fleet-project-stats-grid grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ marginBottom: 12 }}>
        <div>
          <p style={statLabelStyle}>Vehicles</p>
          <p style={statValueStyle}>{summary.vehicleCount}</p>
        </div>
        <div>
          <p style={statLabelStyle}>Fleet Builds</p>
          <p style={statValueStyle}>{summary.buildCount}</p>
        </div>
        <div>
          <p style={statLabelStyle}>Templates</p>
          <p style={statValueStyle}>{summary.templateCount}</p>
        </div>
        <div>
          <p style={statLabelStyle}>Last Modified</p>
          <p style={{ ...FS, fontSize: 13, fontWeight: 600, color: '#444', margin: 0 }}>{formatDate(summary.lastModified)}</p>
        </div>
      </div>

      <div style={{ marginBottom: 14 }} data-testid="fleet-project-completion">
        <FleetBuildCompletionBadge completion={completion} />
      </div>

      {!project.archived && (
        <div style={{ marginBottom: 14 }}>
          <AssignStandardControl
            defaultStandards={defaultStandards}
            companyStandards={companyStandards}
            value={project.departmentStandardId ?? null}
            inheritedLabel="No Standard Assigned"
            onChange={onAssignStandard}
          />
        </div>
      )}

      {health && (
        <div style={{ marginBottom: 14, border: '1px solid #e5e7eb', borderRadius: 4, padding: '12px 14px', background: '#f8f9fb' }} data-testid="fleet-project-health">
          <p style={{
            ...FS, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: '#1a2744', display: 'flex', alignItems: 'center', gap: 6, margin: '0 0 8px',
          }}>
            <HeartPulse size={12} /> Fleet Health
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: health.criticalGaps.length > 0 ? 8 : 0 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
              background: (HEALTH_COLORS[health.color] ?? HEALTH_COLORS.red).bg,
              color: (HEALTH_COLORS[health.color] ?? HEALTH_COLORS.red).fg,
            }}>
              {health.overallCompletionPercent}%
            </span>
            <div style={{ flex: 1, height: 6, background: '#eee', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${health.overallCompletionPercent}%`, height: '100%', background: (HEALTH_COLORS[health.color] ?? HEALTH_COLORS.red).bar }} />
            </div>
          </div>
          {health.criticalGaps.length > 0 && (
            <div>
              <p style={{ ...FS, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#b91c1c', margin: '0 0 4px' }}>Critical</p>
              <ul style={{ margin: 0, padding: '0 0 0 16px' }}>
                {health.criticalGaps.map((gap) => (
                  <li key={gap.categoryId} style={{ ...FS, fontSize: 12, color: '#b91c1c' }}>
                    {gap.vehicleCount} Vehicle{gap.vehicleCount === 1 ? '' : 's'} Missing {gap.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {project.archived ? (
          <>
            <button type="button" onClick={onUnarchive} style={secondaryBtnStyle}><ArchiveRestore size={12} /> Restore</button>
            <button type="button" onClick={onDelete} style={dangerBtnStyle}><Trash2 size={12} /> Delete</button>
          </>
        ) : (
          <>
            <button type="button" onClick={onOpen} style={primaryBtnStyle}><FolderOpen size={12} /> Open</button>
            <button type="button" onClick={onDuplicate} style={secondaryBtnStyle}><Copy size={12} /> Duplicate</button>
            <button type="button" onClick={() => setEditing(true)} style={secondaryBtnStyle}><Pencil size={12} /> Rename</button>
            <button type="button" onClick={onArchive} style={secondaryBtnStyle}><Archive size={12} /> Archive</button>
            <button type="button" onClick={onDelete} style={dangerBtnStyle}><Trash2 size={12} /> Delete</button>
          </>
        )}
      </div>
    </div>
  );
}
