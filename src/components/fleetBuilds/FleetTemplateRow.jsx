/**
 * components/fleetBuilds/FleetTemplateRow.jsx
 * One saved template's summary and controls: name (renamable inline, like
 * FleetBuildCard), vehicle/style, completion badge, how many current fleet
 * builds use this template, and Apply/Clone/Delete actions. Pure/props-driven
 * so it is fixture-testable independent of FleetTemplatesSection, matching
 * FleetBuildCard's convention — all mutation callbacks are provided by the
 * caller; this component holds no persistence logic of its own.
 */
import React, { useState } from 'react';
import { Copy, Trash2, Wand2 } from 'lucide-react';
import { getBuildStyleLabel } from '@/domain/fleetBuilds';
import FleetBuildCompletionBadge from './FleetBuildCompletionBadge';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

function completionFromPercent(percent) {
  return { percent, color: percent >= 100 ? 'green' : percent > 0 ? 'yellow' : 'red' };
}

export default function FleetTemplateRow({ template, buildsUsingTemplate, onApply, onClone, onRename, onDelete }) {
  const [name, setName] = useState(template.name);

  function commitRename() {
    const trimmed = name.trim();
    if (trimmed && trimmed !== template.name) onRename(trimmed);
    else setName(template.name);
  }

  return (
    <div data-testid="fleet-template-row" data-template-id={template.id} style={{ border: '1px solid #e5e7eb', borderRadius: 4, padding: '14px 16px', marginBottom: 12, background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
          aria-label="Template name"
          style={{ ...FS, flex: '1 1 160px', minWidth: 120, fontSize: 14, fontWeight: 700, color: '#1a1a1a', border: 'none', borderBottom: '1.5px solid #eee', padding: '2px 0', outline: 'none', background: 'transparent' }}
        />
        <FleetBuildCompletionBadge completion={completionFromPercent(template.completionPercent)} compact />
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${template.name}`}
          title="Delete template"
          style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: 4, display: 'flex' }}
        >
          <Trash2 size={15} />
        </button>
      </div>

      <p style={{ ...FS, fontSize: 12, color: '#666', margin: '0 0 10px' }}>
        {template.vehicle ? `${template.vehicle.year} ${template.vehicle.make} ${template.vehicle.model}` : 'No vehicle saved'}
        {' · '}{getBuildStyleLabel(template.buildStyle)}
        {' · '}{buildsUsingTemplate} vehicle{buildsUsingTemplate === 1 ? '' : 's'} using this template
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onApply}
          style={{ ...FS, fontSize: 11, fontWeight: 700, color: '#fff', background: '#c8102e', border: 'none', borderRadius: 2, padding: '6px 10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <Wand2 size={12} /> Apply Template
        </button>
        <button
          type="button"
          onClick={onClone}
          style={{ ...FS, fontSize: 11, fontWeight: 700, color: '#1a2744', background: 'none', border: '1.5px solid #1a2744', borderRadius: 2, padding: '6px 10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          <Copy size={12} /> Clone
        </button>
      </div>
    </div>
  );
}
