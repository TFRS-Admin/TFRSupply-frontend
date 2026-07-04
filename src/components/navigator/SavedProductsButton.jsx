import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useSavedProducts } from '@/context/SavedProductsContext';

/**
 * Reusable header "Saved Products" entry point. Reads the shared
 * SavedProductsContext count — it does not own saved-product state.
 * Navigates to the full /saved-products page, mirroring MiniCart's
 * "View Cart" navigation pattern.
 */
export default function SavedProductsButton() {
  const navigate = useNavigate();
  const { productIds } = useSavedProducts();
  const count = productIds.length;

  return (
    <button
      onClick={() => navigate('/saved-products')}
      aria-label={`View saved products, ${count} item${count === 1 ? '' : 's'}`}
      className="saved-products-btn"
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#f5f5f5', color: '#1a1a1a',
        border: '1.5px solid #d0d0d0', borderRadius: 3, cursor: 'pointer',
        fontSize: 13, fontWeight: 600, padding: '8px 14px', whiteSpace: 'nowrap',
        fontFamily: "'Roboto','Inter',sans-serif",
      }}
    >
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        <Heart size={16} />
        {count > 0 && (
          <span style={{
            position: 'absolute', top: -8, right: -10,
            background: '#c8102e', color: '#fff', borderRadius: 999,
            fontSize: 10, fontWeight: 700, lineHeight: 1,
            padding: '2px 5px', minWidth: 15, textAlign: 'center',
          }}>
            {count}
          </span>
        )}
      </span>
    </button>
  );
}
