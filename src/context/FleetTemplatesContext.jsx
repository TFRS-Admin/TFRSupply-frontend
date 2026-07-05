/**
 * context/FleetTemplatesContext.jsx
 * Fleet Templates & Vehicle Cloning — client-side saved-template workspace
 * state. Persists to localStorage, mirroring FleetBuildsContext's pattern.
 * Every create/rename/delete/usage decision delegates to the pure functions
 * in src/domain/fleetBuilds; this context only owns React state wiring,
 * id/timestamp generation, and localStorage persistence. No backend,
 * authentication, or Shopify calls are involved.
 *
 * Fleet Projects — every template belongs to exactly one Fleet Project
 * (`template.projectId`), scoped the same way FleetBuildsContext scopes
 * builds: `templates` is filtered to the active project (FleetProjectContext),
 * while `allTemplates` stays unscoped for cross-project summaries.
 */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  MAX_FLEET_TEMPLATES,
  createTemplateFromBuild,
  addTemplate,
  removeTemplate,
  renameTemplate,
  touchTemplateUsage,
  cloneCategorySelections,
} from '@/domain/fleetBuilds';
import { DEFAULT_PROJECT_ID } from '@/domain/fleetProjects';
import { useFleetProject } from './FleetProjectContext';

const STORAGE_KEY = 'tfr_fleet_templates';
export { MAX_FLEET_TEMPLATES };

function isValidStoredTemplate(value) {
  return Boolean(
    value && typeof value === 'object'
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && value.selections && typeof value.selections === 'object',
  );
}

/** Pre-Fleet-Projects templates have no projectId — normalize them onto the default project so they're never lost. */
function normalizeTemplate(template) {
  return typeof template.projectId === 'string' ? template : { ...template, projectId: DEFAULT_PROJECT_ID };
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidStoredTemplate).map(normalizeTemplate) : [];
  } catch {
    return [];
  }
}

function saveToStorage(templates) {
  if (templates.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function generateTemplateId() {
  return `template-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const FleetTemplatesContext = createContext(null);

export function FleetTemplatesProvider({ children }) {
  const { activeProjectId } = useFleetProject();
  const [allTemplates, setAllTemplates] = useState(() => loadFromStorage());

  const templates = useMemo(
    () => allTemplates.filter((template) => template.projectId === activeProjectId),
    [allTemplates, activeProjectId],
  );

  const saveTemplateFromBuild = useCallback((build, name) => {
    if (!activeProjectId) return null;
    const newId = generateTemplateId();
    const createdAt = Date.now();
    let created = null;
    setAllTemplates((current) => {
      const scoped = current.filter((template) => template.projectId === activeProjectId);
      if (scoped.length >= MAX_FLEET_TEMPLATES) return current;
      created = { ...createTemplateFromBuild(newId, createdAt, build, scoped, name), projectId: activeProjectId };
      const next = addTemplate(current, created);
      saveToStorage(next);
      return next;
    });
    return created;
  }, [activeProjectId]);

  const renameTemplateById = useCallback((templateId, name) => {
    setAllTemplates((current) => {
      const next = renameTemplate(current, templateId, name, Date.now());
      saveToStorage(next);
      return next;
    });
  }, []);

  const deleteTemplate = useCallback((templateId) => {
    setAllTemplates((current) => {
      const next = removeTemplate(current, templateId);
      saveToStorage(next);
      return next;
    });
  }, []);

  const touchUsage = useCallback((templateId) => {
    setAllTemplates((current) => {
      const next = touchTemplateUsage(current, templateId, Date.now());
      saveToStorage(next);
      return next;
    });
  }, []);

  // Fleet Projects — Duplicate Project: clones every template belonging to
  // sourceProjectId into destProjectId with new ids and reset usage
  // tracking (a duplicated project starts its own usage history).
  const duplicateTemplatesForProject = useCallback((sourceProjectId, destProjectId) => {
    setAllTemplates((current) => {
      const sourceTemplates = current.filter((template) => template.projectId === sourceProjectId);
      if (sourceTemplates.length === 0) return current;
      const stamp = Date.now();
      const duplicated = sourceTemplates.map((template, index) => ({
        ...template,
        id: `template-${stamp}-${index}-${Math.random().toString(36).slice(2, 6)}`,
        projectId: destProjectId,
        selections: cloneCategorySelections(template.selections),
        createdAt: stamp,
        updatedAt: stamp,
        usageCount: 0,
        lastUsedAt: null,
      }));
      const next = [...current, ...duplicated];
      saveToStorage(next);
      return next;
    });
  }, []);

  // Fleet Projects — Delete Project cascade: removes every template belonging to projectId.
  const removeTemplatesForProject = useCallback((projectId) => {
    setAllTemplates((current) => {
      const next = current.filter((template) => template.projectId !== projectId);
      saveToStorage(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    templates,
    allTemplates,
    isFull: templates.length >= MAX_FLEET_TEMPLATES,
    saveTemplateFromBuild,
    renameTemplate: renameTemplateById,
    deleteTemplate,
    touchUsage,
    duplicateTemplatesForProject,
    removeTemplatesForProject,
  }), [
    templates, allTemplates, saveTemplateFromBuild, renameTemplateById, deleteTemplate, touchUsage,
    duplicateTemplatesForProject, removeTemplatesForProject,
  ]);

  return <FleetTemplatesContext.Provider value={value}>{children}</FleetTemplatesContext.Provider>;
}

export function useFleetTemplates() {
  const ctx = useContext(FleetTemplatesContext);
  if (!ctx) throw new Error('useFleetTemplates must be used within FleetTemplatesProvider');
  return ctx;
}
