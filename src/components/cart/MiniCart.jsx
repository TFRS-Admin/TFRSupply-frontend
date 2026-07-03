import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useMiniCart } from '@/hooks/cartWorkspace';

function formatMoney(amount, currencyCode = 'USD') {
  if (typeof amount !== 'number') return '—';
  return amount.toLocaleString(undefined, { style: 'currency', currency: currencyCode });
}

/**
 * Reusable header mini-cart. Reads the shared cartWorkspaceService state via
 * useMiniCart() — it does not own cart state, and it never performs
 * checkout. "View Cart" navigates to the full /cart Cart Workspace.
 */
export default function MiniCart() {
  const navigate = useNavigate();
  const { summary, loading } = useMiniCart();
  const itemCount = summary?.itemCount ?? 0;

  return (
    <button
      onClick={() => navigate('/cart')}
      aria-label={`View cart, ${itemCount} item${itemCount === 1 ? '' : 's'}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#f5f5f5', color: '#1a1a1a',
        border: '1.5px solid #d0d0d0', borderRadius: 3, cursor: 'pointer',
        fontSize: 13, fontWeight: 600, padding: '8px 14px', whiteSpace: 'nowrap',
        fontFamily: "'Roboto','Inter',sans-serif",
      }}
    >
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        <ShoppingCart size={16} />
        {itemCount > 0 && (
          <span style={{
            position: 'absolute', top: -8, right: -10,
            background: '#c8102e', color: '#fff', borderRadius: 999,
            fontSize: 10, fontWeight: 700, lineHeight: 1,
            padding: '2px 5px', minWidth: 15, textAlign: 'center',
          }}>
            {itemCount}
          </span>
        )}
      </span>
      <span>{loading ? 'Cart…' : formatMoney(summary?.subtotal?.amount, summary?.currencyCode)}</span>
    </button>
  );
}
