/**
 * context/RecentlyViewedContext.jsx
 * Global recently-viewed product tracking — persists across page navigation.
 * Stores up to MAX_RECENTLY_VIEWED_PRODUCTS product ids, most-recent-first,
 * so Product Detail, Search, and the homepage can all share one list.
 */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { MAX_RECENTLY_VIEWED_PRODUCTS, trackRecentlyViewedProduct } from '@/domain/catalog';

const STORAGE_KEY = 'tfr_recently_viewed_products';
export { MAX_RECENTLY_VIEWED_PRODUCTS };

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

const RecentlyViewedContext = createContext(null);

export function RecentlyViewedProvider({ children }) {
  const [productIds, setProductIds] = useState(() => loadFromStorage());

  const trackView = useCallback((productId) => {
    setProductIds((current) => {
      const next = trackRecentlyViewedProduct(current, productId);
      if (next !== current) saveToStorage(next);
      return next;
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setProductIds([]);
    saveToStorage([]);
  }, []);

  const value = useMemo(() => ({
    productIds,
    trackView,
    clearRecentlyViewed,
  }), [productIds, trackView, clearRecentlyViewed]);

  return <RecentlyViewedContext.Provider value={value}>{children}</RecentlyViewedContext.Provider>;
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext);
  if (!ctx) throw new Error('useRecentlyViewed must be used within RecentlyViewedProvider');
  return ctx;
}
