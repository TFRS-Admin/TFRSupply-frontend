/**
 * components/fleetProjects/FleetProjectsWorkspaceSection.jsx
 * /workspace top section — every Fleet Project as a card (Open/Duplicate/
 * Rename/Archive/Delete), plus a collapsed "Archived Projects" list with
 * Restore/Delete. Pure/presentational (props-driven), matching
 * FleetBuildsWorkspaceSection/FleetTemplatesWorkspaceSection's convention of
 * resolving context state and side effects (toasts) in the connected
 * WorkspaceDashboard wrapper rather than reading its own context here.
 */
import React from 'react';
import { FolderPlus, ChevronDown, ChevronUp } from 'lucide-react';
import FleetProjectCard from './FleetProjectCard';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

export default function FleetProjectsWorkspaceSection({
  projects = [],
  archivedProjects = [],
  activeProjectId,
  summaries = {},
  isFull = false,
  showArchived = false,
  onToggleShowArchived,
  onCreate,
  onOpen,
  onDuplicate,
  onRename,
  onArchive,
  onUnarchive,
  onDelete,
}) {
  return (
    <section style={{ marginBottom: 32 }} data-testid="fleet-projects-workspace-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <p style={{
          ...FS, fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
          color: '#1a2744', margin: 0,
        }}>
          {`Fleet Projects (${projects.length})`}
        </p>
        <button
          type="button"
          onClick={onCreate}
          disabled={isFull}
          style={{
            ...FS, fontSize: 12, fontWeight: 700, color: '#fff',
            background: isFull ? '#e5e5e5' : '#c8102e', border: 'none', borderRadius: 2,
            padding: '9px 14px', cursor: isFull ? 'not-allowed' : 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          <FolderPlus size={14} /> New Project
        </button>
      </div>

      {projects.length > 0 ? (
        projects.map((project) => (
          <FleetProjectCard
            key={project.id}
            project={project}
            summary={summaries[project.id]}
            isActive={project.id === activeProjectId}
            onOpen={() => onOpen(project.id)}
            onDuplicate={() => onDuplicate(project.id)}
            onRename={(name) => onRename(project.id, name)}
            onArchive={() => onArchive(project.id)}
            onDelete={() => onDelete(project.id)}
          />
        ))
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '24px 20px' }}>
          <p style={{ ...FS, fontSize: 13, color: '#888', lineHeight: 1.6, margin: 0 }}>
            No active fleet projects. Create one to start organizing fleet builds and templates for a customer program.
          </p>
          <button
            type="button"
            onClick={onCreate}
            style={{ ...FS, marginTop: 12, fontSize: 12, fontWeight: 700, color: '#fff', background: '#c8102e', border: 'none', padding: '9px 16px', cursor: 'pointer' }}
          >
            Create Your First Project
          </button>
        </div>
      )}

      {archivedProjects.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <button
            type="button"
            onClick={onToggleShowArchived}
            style={{ ...FS, fontSize: 12, fontWeight: 700, color: '#666', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            {showArchived ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {`${showArchived ? 'Hide' : 'Show'} Archived Projects (${archivedProjects.length})`}
          </button>
          {showArchived && (
            <div style={{ marginTop: 12 }} data-testid="fleet-projects-archived-list">
              {archivedProjects.map((project) => (
                <FleetProjectCard
                  key={project.id}
                  project={project}
                  summary={summaries[project.id]}
                  isActive={project.id === activeProjectId}
                  onUnarchive={() => onUnarchive(project.id)}
                  onDelete={() => onDelete(project.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
