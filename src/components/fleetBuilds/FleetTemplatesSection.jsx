/**
 * components/fleetBuilds/FleetTemplatesSection.jsx
 * Fleet Templates section of the Fleet Build Workspace (Fleet Builds tab) —
 * lists saved templates (FleetTemplateRow) with Clone, Apply Template,
 * Rename, and Delete actions. Reads useFleetTemplates() (localStorage-backed)
 * and useFleetBuilds() (to resolve/create the active build for Apply
 * Template and to add cloned builds); catalogService is read only to resolve
 * a product's verticalIds for the destination-vehicle compatibility
 * re-evaluation shared with every other clone/apply entry point.
 */
import React, { useState } from 'react';
import { Boxes } from 'lucide-react';
import { useFleetTemplates } from '@/context/FleetTemplatesContext';
import { useFleetBuilds } from '@/context/FleetBuildsContext';
import { countBuildsUsingTemplate, cloneSourceFromTemplate } from '@/domain/fleetBuilds';
import { catalogService } from '@/services/catalog';
import { toast } from '@/components/ui/use-toast';
import FleetTemplateRow from './FleetTemplateRow';
import CloneBuildDialog, { summarizeCompatibilityResult } from './CloneBuildDialog';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

function getProductVerticalIds(productId) {
  return catalogService.getProduct(productId)?.verticalIds ?? null;
}

export default function FleetTemplatesSection() {
  const { templates, renameTemplate, deleteTemplate, touchUsage } = useFleetTemplates();
  const { builds, activeBuildId, addBuild, cloneBuild, applyTemplate } = useFleetBuilds();
  const [cloneSource, setCloneSource] = useState(null);

  function handleApply(template) {
    const targetBuildId = activeBuildId || addBuild();
    const result = applyTemplate(targetBuildId, template, getProductVerticalIds);
    if (!result) return;
    touchUsage(template.id);
    toast(summarizeCompatibilityResult(result, `Applied "${template.name}"`));
  }

  function handleCloneSubmit(destination) {
    if (!cloneSource) return;
    const result = cloneBuild(cloneSourceFromTemplate(cloneSource), destination, getProductVerticalIds);
    const templateId = cloneSource.id;
    setCloneSource(null);
    if (!result) {
      toast({ title: 'Fleet build limit reached', description: 'Remove a build to clone another.' });
      return;
    }
    touchUsage(templateId);
    toast(summarizeCompatibilityResult(result, `Cloned to "${destination.name}"`));
  }

  return (
    <div data-testid="fleet-templates-section" style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Boxes size={14} style={{ color: '#1a2744' }} />
        <p style={{ ...FS, fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#1a2744', margin: 0 }}>
          Fleet Templates
        </p>
      </div>
      <p style={{ ...FS, fontSize: 12, color: '#666', lineHeight: 1.6, margin: '0 0 14px' }}>
        Save a complete build as a reusable template, then apply or clone it across your fleet.
      </p>

      {templates.length === 0 ? (
        <p style={{ ...FS, fontSize: 13, color: '#888', margin: 0 }}>
          No saved templates yet. Use &quot;Save as Template&quot; on a fleet build to create one.
        </p>
      ) : (
        templates.map((template) => (
          <FleetTemplateRow
            key={template.id}
            template={template}
            buildsUsingTemplate={countBuildsUsingTemplate(builds, template.id)}
            onApply={() => handleApply(template)}
            onClone={() => setCloneSource(template)}
            onRename={(name) => renameTemplate(template.id, name)}
            onDelete={() => deleteTemplate(template.id)}
          />
        ))
      )}

      {cloneSource && (
        <CloneBuildDialog
          sourceLabel="Template"
          sourceName={cloneSource.name}
          sourceVehicle={cloneSource.vehicle}
          sourceQuantity={1}
          onClose={() => setCloneSource(null)}
          onClone={handleCloneSubmit}
        />
      )}
    </div>
  );
}
