import React from 'react';
import { GitCompare, Check } from 'lucide-react';
import { useCompare } from '@/context/CompareContext';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

/**
 * Shared add/remove-from-comparison control. `variant="icon"` renders the
 * compact circular overlay used on ProductCard; `variant="inline"` renders a
 * full action button matching CommerceActionPanel's secondary CTA style.
 * Both read/write the same CompareContext selection (max 4 products).
 */
export default function CompareToggleButton({ productId, variant = 'icon', className = '' }) {
  const { isComparing, isFull, addToCompare, removeFromCompare } = useCompare();
  if (!productId) return null;

  const active = isComparing(productId);
  const disabled = !active && isFull;

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (active) removeFromCompare(productId);
    else addToCompare(productId);
  }

  const title = disabled
    ? 'Compare list is full (max 4 products)'
    : (active ? 'Remove from comparison' : 'Add to comparison');

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-pressed={active}
        aria-label={title}
        title={title}
        className={className}
        style={{
          position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none',
          background: active ? '#c8102e' : 'rgba(255,255,255,0.92)',
          color: active ? '#fff' : '#1a2744',
          cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)', zIndex: 2, padding: 0,
        }}
      >
        {active ? <Check size={15} /> : <GitCompare size={15} />}
      </button>
    );
  }

  const idleStyle = { background: '#fff', color: '#1a2744', border: '2px solid #1a2744' };
  const activeStyle = { background: '#1a2744', color: '#fff', border: '2px solid #1a2744' };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={active}
      title={title}
      className={className}
      style={{
        ...FS, ...(active ? activeStyle : idleStyle),
        fontSize: 13, fontWeight: 700, padding: '12px 16px', minHeight: 44,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.15s, color 0.15s',
      }}
      onMouseEnter={(e) => { if (!disabled) Object.assign(e.currentTarget.style, { background: '#1a2744', color: '#fff' }); }}
      onMouseLeave={(e) => { if (!disabled) Object.assign(e.currentTarget.style, active ? activeStyle : idleStyle); }}
    >
      {active ? <Check size={15} /> : <GitCompare size={15} />} {active ? 'Remove from Compare' : 'Add to Compare'}
    </button>
  );
}
