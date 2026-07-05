/**
 * components/configurator/ConfiguratorCommerceActions.tsx
 *
 * Commerce Actions panel for the Configurator Experience. Composes the
 * existing Cart Workspace (useCartWorkspace / cartWorkspaceService) and
 * Quote Builder (quoteBuilderService) foundations to add the configured
 * product to the cart or assemble a quote — no new cart, checkout, or
 * quote logic is introduced. "Save Configuration" is an explicit
 * placeholder: configuration persistence is out of scope for this issue.
 */

import React, { useState } from 'react';
import type { ComponentType, MouseEventHandler } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Save, Send, ArrowLeft } from 'lucide-react';
import { useCartWorkspace } from '@/hooks/cartWorkspace';
import { quoteBuilderService } from '@/services/quoteBuilder';
import { money } from '@/domain/pricing';
import { toFitmentVehicle } from '@/components/product/FitmentSummary';
import { useVehicle } from '@/context/VehicleContext';
import appConfig from '@/config/appConfig';
import type { CartLineInput, ConfiguratorQuotePayload, ConfiguratorVehicleSelection, QuoteAssemblyInput, Vehicle } from '@/types';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

/**
 * Converts the existing configurator quote payload into a CartLineInput
 * for the Cart Workspace Foundation. Pure and side-effect free so it can
 * be unit tested independently of the cart hook / adapter.
 */
export function buildCartLineInput(configState: ConfiguratorQuotePayload | null | undefined): CartLineInput | null {
  if (!configState?.selectedBaseSku) return null;
  const hasReviewFlags = (configState.reviewFlags ?? []).length > 0;
  return {
    productId: configState.configuratorId ?? configState.selectedBaseSku,
    sku: configState.selectedBaseSku,
    label: configState.productFamily ?? configState.selectedBaseSku,
    quantity: 1,
    unitPrice: money(configState.basePrice ?? 0, 'USD'),
    availability: configState.checkoutReady ? 'available' : 'unknown',
    configurationStatus: hasReviewFlags ? 'incomplete' : 'complete',
    isPackage: (configState.accessorySkus ?? []).length > 0,
    source: 'configurator',
    metadata: {
      attributes: {
        accessorySkus: (configState.accessorySkus ?? []).join(','),
        vehicle: configState.selectedVehicle
          ? `${configState.selectedVehicle.year} ${configState.selectedVehicle.make} ${configState.selectedVehicle.model}`
          : '',
      },
    },
  };
}

/**
 * Converts the existing configurator quote payload into a
 * QuoteAssemblyInput for the Quote Builder Foundation. Pure and side-effect
 * free so it can be unit tested independently of the service / adapter.
 */
export function buildQuoteAssemblyInput(configState: ConfiguratorQuotePayload | null | undefined, vehicle: Vehicle | null | undefined): QuoteAssemblyInput | null {
  if (!configState?.selectedBaseSku) return null;
  const accessoryLines = (configState.accessorySkus ?? []).map((sku) => ({
    lineType: 'accessory' as const,
    label: sku,
    quantity: 1,
    sku,
  }));
  return {
    customer: {},
    verticalId: configState.verticalId,
    vehicle: vehicle ?? undefined,
    lines: [
      {
        lineType: 'product',
        label: configState.productFamily ?? configState.selectedBaseSku,
        quantity: 1,
        sku: configState.selectedBaseSku,
        productId: configState.configuratorId,
      },
      ...accessoryLines,
    ],
    metadata: {
      attributes: { reviewFlagCount: (configState.reviewFlags ?? []).length },
    },
  };
}

type ActionButtonVariant = 'primary' | 'secondary';

interface ActionButtonProps {
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  href?: string;
  icon: ComponentType<{ size?: number | string }>;
  label: string;
  variant?: ActionButtonVariant;
  disabled?: boolean;
  title?: string;
}

function ActionButton({ onClick, href, icon: Icon, label, variant = 'secondary', disabled = false, title }: ActionButtonProps) {
  const styles: Record<ActionButtonVariant, { background: string; color: string; border: string }> = {
    primary: { background: '#c8102e', color: '#fff', border: '2px solid #c8102e' },
    secondary: { background: '#fff', color: '#1a2744', border: '2px solid #1a2744' },
  };
  const commonStyle = {
    ...FS, ...styles[variant],
    fontSize: 13, fontWeight: 700, padding: '10px 16px', textDecoration: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
  };

  if (href && !disabled) {
    return (
      <a href={href} onClick={onClick} style={commonStyle} title={title}>
        <Icon size={15} /> {label}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} title={title} style={commonStyle}>
      <Icon size={15} /> {label}
    </button>
  );
}

interface ConfiguratorCommerceActionsProps {
  configState: ConfiguratorQuotePayload | null;
  verticalId?: string;
  categoryId?: string;
}

export default function ConfiguratorCommerceActions({ configState, verticalId, categoryId }: ConfiguratorCommerceActionsProps) {
  const { addLine } = useCartWorkspace();
  const { selectedVehicle } = useVehicle() as { selectedVehicle: ConfiguratorVehicleSelection | null };
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [quoteMessage, setQuoteMessage] = useState<string | null>(null);

  if (!configState?.selectedBaseSku) {
    return null;
  }

  async function handleAddToCart() {
    const input = buildCartLineInput(configState);
    if (!input) return;
    await addLine(input);
    setCartMessage(`Added ${input.sku} to your cart.`);
  }

  async function handleRequestQuote() {
    const vehicle = toFitmentVehicle(selectedVehicle);
    const input = buildQuoteAssemblyInput(configState, vehicle);
    if (!input) return;
    const result = await quoteBuilderService.assembleQuote(input);
    setQuoteMessage(result.reviewFlags?.[0]?.message ?? `Quote assembly status: ${result.status}`);
  }

  const quoteHref = `mailto:${appConfig.quoteRecipientEmail}?subject=${encodeURIComponent(`Quote Request: ${configState.productFamily ?? ''} (${configState.selectedBaseSku})`)}`;
  const continueShoppingHref = verticalId && categoryId ? `/${verticalId}/${categoryId}` : '/';

  return (
    <div style={{ ...FS, border: '1px solid #e8e8e8', background: '#fff' }} data-testid="configurator-commerce-actions">
      <div style={{ background: '#1a2744', padding: '10px 16px' }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff' }}>Commerce Actions</span>
      </div>

      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
          <ActionButton onClick={handleAddToCart} icon={ShoppingCart} label="Add to Cart" variant="primary" />
          <ActionButton href={quoteHref} onClick={handleRequestQuote} icon={Send} label="Request Quote" />
          <ActionButton
            icon={Save}
            label="Save Configuration"
            disabled
            title="Configuration persistence is not yet implemented — coming in a future issue."
          />
          <Link
            to={continueShoppingHref}
            style={{ ...FS, fontSize: 13, fontWeight: 700, color: '#1a2744', border: '2px solid #1a2744', padding: '10px 16px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <ArrowLeft size={15} /> Continue Shopping
          </Link>
        </div>

        {cartMessage && <p style={{ fontSize: 12, color: '#15803d', margin: '4px 0' }} data-testid="cart-action-message">{cartMessage}</p>}
        {quoteMessage && <p style={{ fontSize: 12, color: '#666', margin: '4px 0' }} data-testid="quote-action-message">{quoteMessage}</p>}
      </div>
    </div>
  );
}
