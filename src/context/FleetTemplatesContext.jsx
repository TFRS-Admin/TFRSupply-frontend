/**
 * context/FleetTemplatesContext.jsx
 * Fleet Templates & Vehicle Cloning — client-side saved-template workspace
 * state. Persists to localStorage, mirroring FleetBuildsContext's pattern.
 * Every create/rename/delete/usage decision delegates to the pure functions
 * in src/domain/fleetBuilds; this context only owns React state wiring,
 * id/timestamp generation, and localStorage persistence. No backend,
 * authentication, or Shopify calls are involved.
 */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  MAX_FLEET_TEMPLATES,
  createTemplateFromBuild,
  addTemplate,
  removeTemplate,
  renameTemplate,
  touchTemplateUsage,
} from '@/domain/fleetBuilds';

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

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidStoredTemplate) : [];
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
  const [templates, setTemplates] = useState(() => loadFromStorage());

  const saveTemplateFromBuild = useCallback((build, name) => {
    const newId = generateTemplateId();
    const createdAt = Date.now();
    let created = null;
    setTemplates((current) => {
      if (current.length >= MAX_FLEET_TEMPLATES) return current;
      created = createTemplateFromBuild(newId, createdAt, build, current, name);
      const next = addTemplate(current, created);
      saveToStorage(next);
      return next;
    });
    return created;
  }, []);

  const renameTemplateById = useCallback((templateId, name) => {
    setTemplates((current) => {
      const next = renameTemplate(current, templateId, name, Date.now());
      saveToStorage(next);
      return next;
    });
  }, []);

  const deleteTemplate = useCallback((templateId) => {
    setTemplates((current) => {
      const next = removeTemplate(current, templateId);
      saveToStorage(next);
      return next;
    });
  }, []);

  const touchUsage = useCallback((templateId) => {
    setTemplates((current) => {
      const next = touchTemplateUsage(current, templateId, Date.now());
      saveToStorage(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    templates,
    isFull: templates.length >= MAX_FLEET_TEMPLATES,
    saveTemplateFromBuild,
    renameTemplate: renameTemplateById,
    deleteTemplate,
    touchUsage,
  }), [templates, saveTemplateFromBuild, renameTemplateById, deleteTemplate, touchUsage]);

  return <FleetTemplatesContext.Provider value={value}>{children}</FleetTemplatesContext.Provider>;
}

export function useFleetTemplates() {
  const ctx = useContext(FleetTemplatesContext);
  if (!ctx) throw new Error('useFleetTemplates must be used within FleetTemplatesProvider');
  return ctx;
}
