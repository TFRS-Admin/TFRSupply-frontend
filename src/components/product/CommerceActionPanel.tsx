import React, { useState } from 'react';
import type { ComponentType, MouseEvent } from 'react';
import { Settings, FileText, ShoppingCart, Phone } from 'lucide-react';
import { useCommerceProduct } from '@/hooks/commerce';
import { commerceService } from '@/services/commerce';
import appConfig from '@/config/appConfig';
import CompareToggleButton from '@/components/product/CompareToggleButton';
import SaveForLaterButton from '@/components/product/SaveForLaterButton';
import AddToAllCompatibleBuildsButton from '@/components/fleetBuilds/AddToAllCompatibleBuildsButton';
import type { Product } from '@/types';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };
const SALES_PHONE = '800-621-9959';

type ActionButtonVariant = 'primary' | 'secondary';

interface ActionButtonProps {
  href?: string;
  onClick?: () => void;
  icon: ComponentType<{ size?: number | string }>;
  label: string;
  variant?: ActionButtonVariant;
  disabled?: boolean;
  fullWidth?: boolean;
}

function ActionButton({ href, onClick, icon: Icon, label, variant = 'secondary', disabled = false, fullWidth = false }: ActionButtonProps) {
  const styles: Record<ActionButtonVariant, { background: string; color: string; border: string }> = {
    primary: { background: '#c8102e', color: '#fff', border: '2px solid #c8102e' },
    secondary: { background: '#fff', color: '#1a2744', border: '2px solid #1a2744' },
  };
  const commonStyle = {
    ...FS,
    ...styles[variant],
    fontSize: 13, fontWeight: 700, padding: '12px 16px', textDecoration: 'none', minHeight: 44,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
    gridColumn: fullWidth ? '1 / -1' : undefined, transition: 'background-color 0.15s, color 0.15s',
  };
  const hoverStyle = variant === 'primary'
    ? { background: '#a80d26' }
    : { background: '#1a2744', color: '#fff' };

  const handleEnter = (e: MouseEvent<HTMLElement>) => { if (!disabled) Object.assign(e.currentTarget.style, hoverStyle); };
  const handleLeave = (e: MouseEvent<HTMLElement>) => { if (!disabled) Object.assign(e.currentTarget.style, styles[variant]); };

  if (href) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
        style={commonStyle} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
        <Icon size={15} /> {label}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} style={commonStyle}
      onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <Icon size={15} /> {label}
    </button>
  );
}

interface CommerceActionPanelProps {
  product: Product;
}

/**
 * Commerce CTA Area — composes the existing configurator, commerce, and
 * quote-request affordances into one action panel. Add to Cart only appears
 * once the Commerce Foundation reports the product as cart-eligible; no
 * checkout or cart persistence is implemented here.
 */
export default function CommerceActionPanel({ product }: CommerceActionPanelProps) {
  const { data: shopifyProduct } = useCommerceProduct(product.id);
  const [cartMessage, setCartMessage] = useState<string | null | undefined>(null);

  const configuratorHref = product.configuratorId
    ? '#build-configure'
    : (product.actions?.configuratorUrl ?? product.cta?.configurator_url);

  const quoteHref = `mailto:${appConfig.quoteRecipientEmail}?subject=${encodeURIComponent(`Quote Request: ${product.title ?? product.label ?? ''}`)}`;

  const cartEligible = shopifyProduct?.cartEligible === true;

  async function handleAddToCart() {
    const result = await commerceService.prepareCartLine(product.sku ?? '', 1);
    setCartMessage(result.status === 'ready' ? 'Ready to add — connect checkout to finish.' : result.message);
  }

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="pd-cta-grid grid grid-cols-2 md:grid-cols-4 gap-3">
          {configuratorHref && (
            <ActionButton href={configuratorHref} icon={Settings} label="Configure Product" variant="primary" fullWidth />
          )}
          <ActionButton href={quoteHref} icon={FileText} label="Request Quote" />
          {cartEligible && (
            <ActionButton onClick={handleAddToCart} icon={ShoppingCart} label="Add to Cart" />
          )}
          <ActionButton href={`tel:${SALES_PHONE}`} icon={Phone} label="Contact Sales" />
          <CompareToggleButton productId={product.id} variant="inline" />
          <SaveForLaterButton productId={product.id} variant="inline" />
          <AddToAllCompatibleBuildsButton product={product} variant="inline" />
        </div>
        {cartMessage && (
          <p style={{ ...FS, fontSize: 12, color: '#888', marginTop: 10 }}>{cartMessage}</p>
        )}
      </div>
    </div>
  );
}
