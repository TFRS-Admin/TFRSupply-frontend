import React from 'react';
import { Heart } from 'lucide-react';
import { useSavedProducts } from '@/context/SavedProductsContext';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

/**
 * Shared save/unsave-for-later control. `variant="icon"` renders the compact
 * circular overlay used on ProductCard; `variant="inline"` renders a full
 * action button matching CommerceActionPanel's secondary CTA style. Both
 * read/write the same SavedProductsContext selection.
 */
export default function SaveForLaterButton({ productId, variant = 'icon', className = '' }) {
  const { isSaved, saveForLater, unsaveForLater } = useSavedProducts();
  if (!productId) return null;

  const active = isSaved(productId);

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (active) unsaveForLater(productId);
    else saveForLater(productId);
  }

  const title = active ? 'Remove from saved products' : 'Save for later';

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={active}
        aria-label={title}
        title={title}
        className={className}
        style={{
          position: 'absolute', top: 8, left: 8, width: 30, height: 30, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none',
          background: active ? '#c8102e' : 'rgba(255,255,255,0.92)',
          color: active ? '#fff' : '#1a2744',
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)', zIndex: 2, padding: 0,
        }}
      >
        <Heart size={15} fill={active ? '#fff' : 'none'} />
      </button>
    );
  }

  const idleStyle = { background: '#fff', color: '#1a2744', border: '2px solid #1a2744' };
  const activeStyle = { background: '#1a2744', color: '#fff', border: '2px solid #1a2744' };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      title={title}
      className={className}
      style={{
        ...FS, ...(active ? activeStyle : idleStyle),
        fontSize: 13, fontWeight: 700, padding: '12px 16px', minHeight: 44,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        cursor: 'pointer', transition: 'background-color 0.15s, color 0.15s',
      }}
      onMouseEnter={(e) => { Object.assign(e.currentTarget.style, { background: '#1a2744', color: '#fff' }); }}
      onMouseLeave={(e) => { Object.assign(e.currentTarget.style, active ? activeStyle : idleStyle); }}
    >
      <Heart size={15} fill={active ? '#fff' : 'none'} /> {active ? 'Remove from Saved' : 'Save for Later'}
    </button>
  );
}
