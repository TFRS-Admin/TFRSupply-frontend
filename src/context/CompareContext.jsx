/**
 * context/CompareContext.jsx
 * Global product comparison selection — persists across page navigation.
 * Stores up to MAX_COMPARE_PRODUCTS product ids and exposes add/remove/clear
 * so the compare button, tray, and /compare page all share one selection.
 */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  MAX_COMPARE_PRODUCTS,
  addProductToCompare,
  removeProductFromCompare,
  isProductInCompare,
  isCompareFull,
} from '@/domain/catalog';

const STORAGE_KEY = 'tfr_compare_products';
export { MAX_COMPARE_PRODUCTS };

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function saveToStorage(productIds) {
  if (productIds.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(productIds));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

const CompareContext = createContext(null);

export function CompareProvider({ children }) {
  const [productIds, setProductIds] = useState(() => loadFromStorage());

  const addToCompare = useCallback((productId) => {
    setProductIds((current) => {
      const next = addProductToCompare(current, productId);
      if (next !== current) saveToStorage(next);
      return next;
    });
  }, []);

  const removeFromCompare = useCallback((productId) => {
    setProductIds((current) => {
      const next = removeProductFromCompare(current, productId);
      saveToStorage(next);
      return next;
    });
  }, []);

  const clearCompare = useCallback(() => {
    setProductIds([]);
    saveToStorage([]);
  }, []);

  const value = useMemo(() => ({
    productIds,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isComparing: (productId) => isProductInCompare(productIds, productId),
    isFull: isCompareFull(productIds),
  }), [productIds, addToCompare, removeFromCompare, clearCompare]);

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
