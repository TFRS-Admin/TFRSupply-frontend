/**
 * components/configurator/ConfiguratorFitmentFeedback.tsx
 *
 * Fitment Feedback panel for the Configurator Experience. Composes the
 * existing Vehicle Fitment Service (useProductFitment) against the
 * customer's globally-selected vehicle and the configurator's selected
 * base SKU. Presents four states: Compatible, Incompatible, Warning
 * (compatible but with warning-severity issues), and Unknown.
 *
 * No new fitment rules are introduced here — this only presents whatever
 * the existing service returns, honestly, including the intentionally
 * unavailable default adapter's "unknown" result.
 */

import React, { useMemo } from 'react';
import type { ComponentType, CSSProperties } from 'react';
import { CheckCircle2, HelpCircle, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useVehicle } from '@/context/VehicleContext';
import { useProductFitment } from '@/hooks/vehicleFitment';
import { toFitmentVehicle } from '@/components/product/FitmentSummary';
import type { ConfiguratorVehicleSelection, FitmentResult, ProductFitmentRequest } from '@/types';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

export type FitmentPresentationCategory = 'compatible' | 'warning' | 'incompatible' | 'unknown';

interface FitmentPresentationMeta {
  icon: ComponentType<{ size?: number | string; style?: CSSProperties }>;
  color: string;
  bg: string;
  border: string;
  label: string;
}

const PRESENTATION: Record<FitmentPresentationCategory, FitmentPresentationMeta> = {
  compatible: { icon: CheckCircle2, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Compatible' },
  warning: { icon: AlertTriangle, color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Compatible — Advisory' },
  incompatible: { icon: ShieldAlert, color: '#c8102e', bg: '#fef2f2', border: '#fecaca', label: 'Incompatible' },
  unknown: { icon: HelpCircle, color: '#6b7280', bg: '#f8fafc', border: '#e5e7eb', label: 'Compatibility Unknown' },
};

/**
 * Derives a four-state presentation category from the Vehicle Fitment
 * Service's three-state result (compatible/incompatible/unknown) plus
 * issue severities — a "compatible" result carrying a warning-severity
 * issue is presented as "warning" rather than a flat green check.
 */
export function deriveFitmentPresentation(fitmentResult: FitmentResult | null | undefined): FitmentPresentationCategory {
  if (!fitmentResult) return 'unknown';
  if (fitmentResult.status === 'compatible') {
    const hasWarning = (fitmentResult.issues ?? []).some((issue) => issue.severity === 'warning' || issue.severity === 'error');
    return hasWarning ? 'warning' : 'compatible';
  }
  return fitmentResult.status ?? 'unknown';
}

interface ConfiguratorFitmentFeedbackProps {
  configuratorId?: string;
  sku?: string;
}

export default function ConfiguratorFitmentFeedback({ configuratorId, sku }: ConfiguratorFitmentFeedbackProps) {
  const { selectedVehicle } = useVehicle() as { selectedVehicle: ConfiguratorVehicleSelection | null };
  const vehicle = useMemo(() => toFitmentVehicle(selectedVehicle), [selectedVehicle]);

  const fitmentRequest = useMemo(
    () => (vehicle && configuratorId ? { vehicle, productId: configuratorId, sku } : null),
    [vehicle, configuratorId, sku],
  );
  const { result, loading } = useProductFitment(fitmentRequest);

  const category = deriveFitmentPresentation(result);
  const meta = PRESENTATION[category];
  const Icon = meta.icon;

  return (
    <div style={{ ...FS, border: '1px solid #e8e8e8', background: '#fff' }} data-testid="configurator-fitment-feedback">
      <div style={{ background: '#1a2744', padding: '10px 16px' }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff' }}>Fitment Feedback</span>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {!selectedVehicle && (
          <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
            Select a vehicle to check fitment for your current configuration.
          </p>
        )}

        {selectedVehicle && !sku && (
          <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
            Select a SKU above to check fitment against your vehicle.
          </p>
        )}

        {selectedVehicle && sku && loading && (
          <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Checking fitment…</p>
        )}

        {selectedVehicle && sku && !loading && (
          <div
            data-testid="fitment-status-badge"
            data-fitment-status={category}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              padding: '10px 12px', background: meta.bg, border: `1px solid ${meta.border}`,
            }}
          >
            <Icon size={16} style={{ color: meta.color, flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: meta.color }}>{meta.label}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#666' }}>
                {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model} · SKU {sku}
              </p>
              {result?.issues?.map((issue) => (
                <p key={issue.code} style={{ margin: '4px 0 0', fontSize: 11, color: '#666' }}>{issue.message}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
