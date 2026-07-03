import React from 'react';
import { Minus, Package, Plus, Trash2 } from 'lucide-react';

function formatMoney(money) {
  if (!money || typeof money.amount !== 'number') return '—';
  return money.amount.toLocaleString(undefined, { style: 'currency', currency: money.currencyCode || 'USD' });
}

const AVAILABILITY_LABEL = {
  available: { label: 'In Stock', color: '#15803d', bg: '#dcfce7' },
  backorder: { label: 'Backorder', color: '#92400e', bg: '#fef3c7' },
  preorder: { label: 'Preorder', color: '#1d4ed8', bg: '#dbeafe' },
  unavailable: { label: 'Unavailable', color: '#b91c1c', bg: '#fee2e2' },
  unknown: { label: 'Checking Availability', color: '#6b7280', bg: '#f3f4f6' },
};

const CONFIG_LABEL = {
  complete: { label: 'Configured', color: '#15803d' },
  incomplete: { label: 'Needs Configuration', color: '#b45309' },
  'not-required': { label: 'No Configuration Required', color: '#888' },
  unknown: { label: 'Configuration Unknown', color: '#888' },
};

export default function CartLineRow({ line, onUpdateQuantity, onRemove, onConfigure }) {
  const availability = AVAILABILITY_LABEL[line.availability] ?? AVAILABILITY_LABEL.unknown;
  const config = CONFIG_LABEL[line.configurationStatus] ?? CONFIG_LABEL.unknown;

  return (
    <div className="cart-line-row" style={{ display: 'flex', gap: 16, padding: '18px 0', borderBottom: '1px solid #f0f0f0' }}>
      <div className="cart-line-image" style={{ width: 84, height: 84, flexShrink: 0, background: '#f4f5f7', borderRadius: 4, overflow: 'hidden' }}>
        {line.image?.src && (
          <img src={line.image.src} alt={line.image.alt || line.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 6 }}>
              {line.label}
              {line.isPackage && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: '#1a2744', background: '#e5e9f2', borderRadius: 999, padding: '2px 8px' }}>
                  <Package size={10} /> Package
                </span>
              )}
            </p>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#888', fontFamily: 'monospace' }}>SKU: {line.sku}</p>
          </div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1a2744', whiteSpace: 'nowrap' }}>{formatMoney(line.lineTotal)}</p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: availability.color, background: availability.bg, borderRadius: 2, padding: '3px 8px' }}>
            {availability.label}
          </span>
          <span style={{ fontSize: 11, color: config.color }}>{config.label}</span>
        </div>

        <div className="cart-line-controls" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d0d0d0', borderRadius: 3 }}>
            <button
              className="cart-line-qty-btn"
              onClick={() => onUpdateQuantity(line.id, Math.max(1, line.quantity - 1))}
              aria-label={`Decrease quantity of ${line.label}`}
              style={{ border: 'none', background: 'none', padding: '6px 10px', cursor: 'pointer' }}
            >
              <Minus size={13} />
            </button>
            <span style={{ minWidth: 28, textAlign: 'center', fontSize: 13, fontWeight: 700 }}>{line.quantity}</span>
            <button
              className="cart-line-qty-btn"
              onClick={() => onUpdateQuantity(line.id, line.quantity + 1)}
              aria-label={`Increase quantity of ${line.label}`}
              style={{ border: 'none', background: 'none', padding: '6px 10px', cursor: 'pointer' }}
            >
              <Plus size={13} />
            </button>
          </div>

          <div className="cart-line-actions" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 12, color: '#888' }}>{formatMoney(line.unitPrice)} / unit</span>
            {line.configurationStatus === 'incomplete' && (
              <button onClick={() => onConfigure(line)} style={{ fontSize: 12, color: '#1a2744', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                Configure
              </button>
            )}
            <button onClick={() => onRemove(line.id)} aria-label={`Remove ${line.label}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#b91c1c', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Trash2 size={13} /> Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
