import React, { useState } from 'react';
import { Settings, FileText, ShoppingCart, Phone } from 'lucide-react';
import { useCommerceProduct } from '@/hooks/commerce';
import { commerceService } from '@/services/commerce';
import appConfig from '@/config/appConfig';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };
const SALES_PHONE = '800-621-9959';

function ActionButton({ href, onClick, icon: Icon, label, variant = 'secondary', disabled = false }) {
  const styles = {
    primary: { background: '#c8102e', color: '#fff', border: '2px solid #c8102e' },
    secondary: { background: '#fff', color: '#1a2744', border: '2px solid #1a2744' },
  };
  const commonStyle = {
    ...FS,
    ...styles[variant],
    fontSize: 13, fontWeight: 700, padding: '10px 16px', textDecoration: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
  };

  if (href) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={commonStyle}>
        <Icon size={15} /> {label}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} style={commonStyle}>
      <Icon size={15} /> {label}
    </button>
  );
}

/**
 * Commerce CTA Area — composes the existing configurator, commerce, and
 * quote-request affordances into one action panel. Add to Cart only appears
 * once the Commerce Foundation reports the product as cart-eligible; no
 * checkout or cart persistence is implemented here.
 */
export default function CommerceActionPanel({ product }) {
  const { data: shopifyProduct } = useCommerceProduct(product.id);
  const [cartMessage, setCartMessage] = useState(null);

  const configuratorHref = product.configuratorId
    ? '#build-configure'
    : (product.actions?.configuratorUrl ?? product.cta?.configurator_url);

  const quoteHref = `mailto:${appConfig.quoteRecipientEmail}?subject=${encodeURIComponent(`Quote Request: ${product.title ?? product.label ?? ''}`)}`;

  const cartEligible = shopifyProduct?.cartEligible === true;

  async function handleAddToCart() {
    const result = await commerceService.prepareCartLine(product.sku, 1);
    setCartMessage(result.status === 'ready' ? 'Ready to add — connect checkout to finish.' : result.message);
  }

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {configuratorHref && (
            <ActionButton href={configuratorHref} icon={Settings} label="Configure Product" variant="primary" />
          )}
          <ActionButton href={quoteHref} icon={FileText} label="Request Quote" />
          {cartEligible && (
            <ActionButton onClick={handleAddToCart} icon={ShoppingCart} label="Add to Cart" />
          )}
          <ActionButton href={`tel:${SALES_PHONE}`} icon={Phone} label="Contact Sales" />
        </div>
        {cartMessage && (
          <p style={{ ...FS, fontSize: 12, color: '#888', marginTop: 10 }}>{cartMessage}</p>
        )}
      </div>
    </div>
  );
}
