/**
 * hooks/useFleetProjectActions.js
 * Fleet Projects — cross-context actions that touch project metadata
 * (FleetProjectContext) together with the fleet builds/templates that
 * belong to it (FleetBuildsContext/FleetTemplatesContext). Kept out of all
 * three contexts so each stays focused on its own slice of state, mirroring
 * how FinishYourUpfitPanel/FleetBuildsPanel already compose useFleetBuilds()
 * + useFleetTemplates() at the component layer for template-apply/clone
 * flows rather than coupling the contexts directly to each other.
 */
import { useCallback } from 'react';
import { useFleetProject } from '@/context/FleetProjectContext';
import { useFleetBuilds } from '@/context/FleetBuildsContext';
import { useFleetTemplates } from '@/context/FleetTemplatesContext';

export function useFleetProjectActions() {
  const { duplicateProject, deleteProject } = useFleetProject();
  const { duplicateBuildsForProject, removeBuildsForProject } = useFleetBuilds();
  const { duplicateTemplatesForProject, removeTemplatesForProject } = useFleetTemplates();

  const duplicateProjectWithContents = useCallback((projectId) => {
    const created = duplicateProject(projectId);
    if (!created) return null;
    duplicateBuildsForProject(projectId, created.id);
    duplicateTemplatesForProject(projectId, created.id);
    return created;
  }, [duplicateProject, duplicateBuildsForProject, duplicateTemplatesForProject]);

  const deleteProjectWithContents = useCallback((projectId) => {
    deleteProject(projectId);
    removeBuildsForProject(projectId);
    removeTemplatesForProject(projectId);
  }, [deleteProject, removeBuildsForProject, removeTemplatesForProject]);

  return { duplicateProjectWithContents, deleteProjectWithContents };
}
