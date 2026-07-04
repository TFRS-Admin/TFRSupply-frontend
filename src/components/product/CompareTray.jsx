import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, GitCompare } from 'lucide-react';
import { useCompare } from '@/context/CompareContext';
import { catalogService } from '@/services/catalog';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

/**
 * Pure tray presentation, split out from the context/route-aware default
 * export so it can be rendered directly in tests with fixture products,
 * matching the *View split used elsewhere in src/pages.
 */
export function CompareTrayView({ products, onRemove, onClear }) {
  if (!products.length) return null;

  return (
    <div
      className="compare-tray"
      style={{
        ...FS, position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40,
        background: '#fff', borderTop: '2px solid #1a2744', boxShadow: '0 -2px 10px rgba(0,0,0,0.12)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          className="compare-tray-chips"
          style={{ display: 'flex', gap: 10, overflowX: 'auto', flex: 1, minWidth: 0, WebkitOverflowScrolling: 'touch' }}
        >
          {products.map((product) => (
            <div key={product.id} style={{
              display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
              border: '1px solid #e5e7eb', padding: '4px 8px 4px 4px', background: '#fafafa',
            }}>
              {(product.media?.hero || product.images?.[0]?.src) ? (
                <img
                  src={product.media?.hero || product.images?.[0]?.src}
                  alt={product.title ?? product.label}
                  style={{ width: 32, height: 32, objectFit: 'cover', flexShrink: 0 }}
                />
              ) : (
                <div style={{ width: 32, height: 32, background: '#eee', flexShrink: 0 }} />
              )}
              <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a', whiteSpace: 'nowrap', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {product.title ?? product.label}
              </span>
              <button
                type="button"
                onClick={() => onRemove(product.id)}
                aria-label={`Remove ${product.title ?? product.label} from comparison`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', color: '#888', cursor: 'pointer', padding: 2 }}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <button
            type="button"
            onClick={onClear}
            style={{ ...FS, fontSize: 12, fontWeight: 700, color: '#888', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.03em' }}
          >
            Clear All
          </button>
          <Link
            to="/compare"
            style={{
              ...FS, fontSize: 13, fontWeight: 700, color: '#fff', background: '#c8102e',
              padding: '10px 18px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
            }}
          >
            <GitCompare size={15} /> {`Compare (${products.length})`}
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Sticky comparison tray — shown site-wide once at least one product is
 * selected for comparison. Reuses catalogService.getProduct for display data
 * (same read path RecommendedProducts/CategoryTemplate already use) and
 * CompareContext for the selection itself. Hidden on the /compare page,
 * where the same selection is already fully visible.
 */
export default function CompareTray() {
  const { productIds, removeFromCompare, clearCompare } = useCompare();
  const location = useLocation();

  if (location.pathname === '/compare') return null;

  const products = productIds
    .map((id) => catalogService.getProduct(id))
    .filter(Boolean);

  return <CompareTrayView products={products} onRemove={removeFromCompare} onClear={clearCompare} />;
}
