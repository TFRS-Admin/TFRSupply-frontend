import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useProductSearch } from '@/hooks/useCatalog';
import { resolveProductDetailPath } from '@/domain/catalog';
import { NAV_VERTICALS } from '@/config/navigationVerticals';
import type { Product } from '@/types';

const FONT = "'Montserrat', sans-serif";
const RED = '#c8102e';
const MAX_RESULTS = 5;
const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 150;

interface GlobalSearchOverlayProps {
  query: string;
  onNavigate: () => void;
}

/**
 * Header search dropdown — shown while the search field is focused. With no
 * query it surfaces quick vertical shortcuts; once the query reaches
 * MIN_QUERY_LENGTH it debounces into useProductSearch and lists top matches
 * with a "View all results" link into the full /search page.
 */
export default function GlobalSearchOverlay({ query, onNavigate }: GlobalSearchOverlayProps) {
  const { data, loading, search } = useProductSearch();
  const trimmedQuery = query.trim();
  const [debouncedQuery, setDebouncedQuery] = useState<string>(trimmedQuery);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(trimmedQuery), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [trimmedQuery]);

  useEffect(() => {
    if (debouncedQuery.length >= MIN_QUERY_LENGTH) {
      search({ query: debouncedQuery });
    }
  }, [debouncedQuery, search]);

  const showResults = trimmedQuery.length >= MIN_QUERY_LENGTH;
  const products: Product[] = showResults ? (data?.products ?? []).slice(0, MAX_RESULTS) : [];
  const total = data?.total ?? 0;

  return (
    <div
      role="listbox"
      style={{
        position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
        background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 6,
        boxShadow: '0 12px 32px rgba(0,0,0,0.14)', zIndex: 50,
        fontFamily: FONT, overflow: 'hidden',
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {!showResults && (
        <div style={{ padding: '16px 20px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#999', margin: '0 0 10px' }}>
            Shop by Vertical
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {NAV_VERTICALS.filter((vertical) => vertical.path).map((vertical) => (
              <Link
                key={vertical.id}
                to={vertical.path as string}
                onClick={onNavigate}
                style={{
                  fontSize: 12, fontWeight: 600, color: '#1a1a1a', textDecoration: 'none',
                  border: '1px solid #e0e0e0', borderRadius: 4, padding: '6px 12px',
                }}
              >
                {vertical.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {showResults && loading && (
        <p style={{ padding: '16px 20px', fontSize: 13, color: '#888', margin: 0 }}>Searching…</p>
      )}

      {showResults && !loading && products.length === 0 && (
        <p style={{ padding: '16px 20px', fontSize: 13, color: '#888', margin: 0 }}>
          No products found for &ldquo;{trimmedQuery}&rdquo;.
        </p>
      )}

      {showResults && !loading && products.length > 0 && (
        <ul style={{ listStyle: 'none', margin: 0, padding: '6px 0' }}>
          {products.map((product) => {
            const href = resolveProductDetailPath(product);
            if (!href) return null;
            return (
              <li key={product.id}>
                <Link
                  to={href}
                  onClick={onNavigate}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 20px', textDecoration: 'none', color: '#1a1a1a',
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#fafafa'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {product.media?.hero ? (
                    <img src={product.media.hero} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 3, flexShrink: 0 }} />
                  ) : (
                    <span style={{ width: 36, height: 36, borderRadius: 3, background: '#f0f0f0', flexShrink: 0 }} />
                  )}
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product.label}
                    </span>
                    {product.commerce?.price_display && (
                      <span style={{ display: 'block', fontSize: 12, color: '#888' }}>{product.commerce.price_display}</span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
          <li style={{ borderTop: '1px solid #eee', marginTop: 4 }}>
            <Link
              to={`/search?q=${encodeURIComponent(trimmedQuery)}`}
              onClick={onNavigate}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px',
                fontSize: 13, fontWeight: 700, color: RED, textDecoration: 'none',
              }}
            >
              View all {total} result{total === 1 ? '' : 's'} <ArrowRight size={13} />
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}
