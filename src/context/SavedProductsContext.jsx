/**
 * context/SavedProductsContext.jsx
 * Global "Save for Later" selection — persists across page navigation.
 * Stores saved product ids, most-recently-saved-first, so Product Cards,
 * Product Detail, the homepage section, and /saved-products all share one
 * list, mirroring CompareContext/RecentlyViewedContext's localStorage pattern.
 */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { saveProduct, unsaveProduct, isProductSaved } from '@/domain/catalog';

const STORAGE_KEY = 'tfr_saved_products';

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

const SavedProductsContext = createContext(null);

export function SavedProductsProvider({ children }) {
  const [productIds, setProductIds] = useState(() => loadFromStorage());

  const saveForLater = useCallback((productId) => {
    setProductIds((current) => {
      const next = saveProduct(current, productId);
      if (next !== current) saveToStorage(next);
      return next;
    });
  }, []);

  const unsaveForLater = useCallback((productId) => {
    setProductIds((current) => {
      const next = unsaveProduct(current, productId);
      saveToStorage(next);
      return next;
    });
  }, []);

  const clearSavedProducts = useCallback(() => {
    setProductIds([]);
    saveToStorage([]);
  }, []);

  const value = useMemo(() => ({
    productIds,
    saveForLater,
    unsaveForLater,
    clearSavedProducts,
    isSaved: (productId) => isProductSaved(productIds, productId),
  }), [productIds, saveForLater, unsaveForLater, clearSavedProducts]);

  return <SavedProductsContext.Provider value={value}>{children}</SavedProductsContext.Provider>;
}

export function useSavedProducts() {
  const ctx = useContext(SavedProductsContext);
  if (!ctx) throw new Error('useSavedProducts must be used within SavedProductsProvider');
  return ctx;
}
