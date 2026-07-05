/**
 * components/fleetProjects/FleetProjectIndicator.jsx
 * Header "Fleet Project" indicator/switcher — shows the active Fleet
 * Project's name and lets the customer switch to any other non-archived
 * project without leaving the page they're on. Desktop-only (`hidden
 * md:flex`), matching the header's vehicle-selector/WorkspaceButton pattern —
 * see docs/architecture/PROJECT_WORKSPACE.md's Mobile Layout section for why
 * the icon row is already at its 390px width limit; MobileNavDrawer carries
 * the mobile equivalent instead. Switching the active project here never
 * touches VehicleContext's global selected vehicle — the two are
 * independent, see docs/architecture/FLEET_PROJECTS.md.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, ChevronDown, Plus } from 'lucide-react';
import { useFleetProject } from '@/context/FleetProjectContext';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

export default function FleetProjectIndicator() {
  const navigate = useNavigate();
  const { projects, activeProject, setActiveProject, createProject } = useFleetProject();
  const [open, setOpen] = useState(false);

  const switchableProjects = projects.filter((project) => !project.archived);

  function handleSwitch(projectId) {
    setActiveProject(projectId);
    setOpen(false);
  }

  function handleCreate() {
    const created = createProject();
    setOpen(false);
    if (created) navigate('/workspace');
  }

  return (
    <div style={{ position: 'relative' }} className="hidden md:flex">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Switch fleet project"
        aria-expanded={open}
        data-testid="fleet-project-indicator-button"
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#f5f5f5', color: '#1a1a1a',
          border: '1.5px solid #d0d0d0', borderRadius: 3, cursor: 'pointer',
          fontSize: 13, fontWeight: 600, padding: '9px 14px', whiteSpace: 'nowrap',
          fontFamily: "'Roboto','Inter',sans-serif", maxWidth: 220,
        }}
      >
        <FolderKanban size={14} style={{ flexShrink: 0, color: '#888' }} />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {activeProject ? activeProject.name : 'No Fleet Project'}
        </span>
        <ChevronDown size={12} style={{ flexShrink: 0 }} />
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 45 }} />
          <div
            role="menu"
            data-testid="fleet-project-dropdown"
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, minWidth: 240,
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 46, padding: 8,
            }}
          >
            <p style={{ ...FS, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#999', padding: '4px 8px', margin: 0 }}>
              Switch Fleet Project
            </p>
            {switchableProjects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => handleSwitch(project.id)}
                style={{
                  ...FS, display: 'block', width: '100%', textAlign: 'left', fontSize: 13,
                  fontWeight: project.id === activeProject?.id ? 700 : 500,
                  color: project.id === activeProject?.id ? '#c8102e' : '#1a1a1a',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: 2,
                }}
              >
                {project.name}
              </button>
            ))}
            <div style={{ borderTop: '1px solid #eee', marginTop: 6, paddingTop: 6 }}>
              <button
                type="button"
                onClick={handleCreate}
                style={{ ...FS, display: 'flex', alignItems: 'center', gap: 6, width: '100%', fontSize: 13, fontWeight: 700, color: '#1a2744', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
              >
                <Plus size={13} /> New Project
              </button>
              <button
                type="button"
                onClick={() => { setOpen(false); navigate('/workspace'); }}
                style={{ ...FS, display: 'block', width: '100%', textAlign: 'left', fontSize: 12, color: '#666', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
              >
                Manage Projects →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
