/**
 * context/DepartmentStandardsContext.jsx
 * Fleet Intelligence & Department Standards — client-side company standards
 * library state. Persists to localStorage, mirroring FleetTemplatesContext's
 * pattern. Every clone/rename/delete/category-edit decision delegates to the
 * pure functions in src/domain/departmentStandards; this context only owns
 * React state wiring, id/timestamp generation, and localStorage persistence.
 * No backend, authentication, or Shopify calls are involved.
 *
 * Unlike Fleet Builds/Templates, company standards are NOT scoped to a Fleet
 * Project — "Company Standards" describes equipment policy for the whole
 * account, reusable across every project (see docs/architecture/
 * FLEET_INTELLIGENCE.md's Architecture Decisions). The 12 shipped defaults
 * (src/domain/departmentStandards/defaultStandards.ts) are always available
 * and never persisted here; this context only stores user-created clones.
 */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  MAX_DEPARTMENT_STANDARDS,
  DEFAULT_DEPARTMENT_STANDARDS,
  getDepartmentStandardById,
  cloneDepartmentStandard,
  addDepartmentStandard,
  removeDepartmentStandard,
  renameDepartmentStandard,
  addCategoryToTier,
  removeCategoryFromTier,
} from '@/domain/departmentStandards';

const STORAGE_KEY = 'tfr_department_standards';
export { MAX_DEPARTMENT_STANDARDS };

function isValidStoredStandard(value) {
  return Boolean(
    value && typeof value === 'object'
    && typeof value.id === 'string'
    && typeof value.name === 'string'
    && value.categories && typeof value.categories === 'object',
  );
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidStoredStandard) : [];
  } catch {
    return [];
  }
}

function saveToStorage(standards) {
  if (standards.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(standards));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function generateStandardId() {
  return `standard-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const DepartmentStandardsContext = createContext(null);

export function DepartmentStandardsProvider({ children }) {
  const [companyStandards, setCompanyStandards] = useState(() => loadFromStorage());

  const allStandards = useMemo(
    () => [...DEFAULT_DEPARTMENT_STANDARDS, ...companyStandards],
    [companyStandards],
  );

  const getStandardById = useCallback(
    (standardId) => getDepartmentStandardById(standardId, companyStandards),
    [companyStandards],
  );

  const cloneStandard = useCallback((sourceStandard, name) => {
    if (!sourceStandard) return null;
    const newId = generateStandardId();
    const createdAt = Date.now();
    let created = null;
    setCompanyStandards((current) => {
      if (current.length >= MAX_DEPARTMENT_STANDARDS) return current;
      created = cloneDepartmentStandard(newId, createdAt, sourceStandard, name);
      const next = addDepartmentStandard(current, created);
      saveToStorage(next);
      return next;
    });
    return created;
  }, []);

  const renameStandard = useCallback((standardId, name) => {
    setCompanyStandards((current) => {
      const next = renameDepartmentStandard(current, standardId, name, Date.now());
      saveToStorage(next);
      return next;
    });
  }, []);

  const deleteStandard = useCallback((standardId) => {
    setCompanyStandards((current) => {
      const next = removeDepartmentStandard(current, standardId);
      saveToStorage(next);
      return next;
    });
  }, []);

  const addCategory = useCallback((standardId, tier, categoryId) => {
    setCompanyStandards((current) => {
      const next = addCategoryToTier(current, standardId, tier, categoryId, Date.now());
      saveToStorage(next);
      return next;
    });
  }, []);

  const removeCategory = useCallback((standardId, tier, categoryId) => {
    setCompanyStandards((current) => {
      const next = removeCategoryFromTier(current, standardId, tier, categoryId, Date.now());
      saveToStorage(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({
    defaultStandards: DEFAULT_DEPARTMENT_STANDARDS,
    companyStandards,
    allStandards,
    isFull: companyStandards.length >= MAX_DEPARTMENT_STANDARDS,
    getStandardById,
    cloneStandard,
    renameStandard,
    deleteStandard,
    addCategory,
    removeCategory,
  }), [companyStandards, allStandards, getStandardById, cloneStandard, renameStandard, deleteStandard, addCategory, removeCategory]);

  return <DepartmentStandardsContext.Provider value={value}>{children}</DepartmentStandardsContext.Provider>;
}

export function useDepartmentStandards() {
  const ctx = useContext(DepartmentStandardsContext);
  if (!ctx) throw new Error('useDepartmentStandards must be used within DepartmentStandardsProvider');
  return ctx;
}
