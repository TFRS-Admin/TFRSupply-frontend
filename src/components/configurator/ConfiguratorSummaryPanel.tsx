/**
 * components/configurator/ConfiguratorSummaryPanel.tsx
 *
 * Configuration Summary panel for the Configurator Experience. Reads the
 * existing configurator output (the `quotePayload` ConfiguratorModule
 * already builds, surfaced upward via its onConfigurationChange prop) and
 * presents selected options, the resulting SKU list, a compatibility
 * status badge, warnings, and a package summary — without recomputing any
 * configurator, fitment, or package-builder logic itself.
 */

import React, { useMemo } from 'react';
import { CheckCircle2, AlertTriangle, Package, ListChecks } from 'lucide-react';
import { usePackageDefinition } from '@/hooks/packageBuilder';
import { deriveFitmentPresentation } from '@/components/configurator/ConfiguratorFitmentFeedback';
import type { Configurator, ConfiguratorQuotePayload, ConfiguratorSection, ConfiguratorStep, FitmentResult } from '@/types';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

function labelForSelection(steps: ConfiguratorStep[], stepId: string, optionId: string): { stepLabel: string; optionLabel: string } {
  const step = steps.find((s) => s.id === stepId);
  const option = step?.options?.find((o) => o.id === optionId);
  return { stepLabel: step?.label ?? stepId, optionLabel: option?.label ?? optionId };
}

interface PackageSummaryProps {
  packageId?: string;
}

function PackageSummary({ packageId }: PackageSummaryProps) {
  const { data: packageDefinition, loading } = usePackageDefinition(packageId);

  if (!packageId) {
    return <p style={{ fontSize: 12, color: '#888', margin: 0 }}>No related package linked to this configurator.</p>;
  }
  if (loading) return <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Loading package summary…</p>;
  if (!packageDefinition) {
    return <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Package summary unavailable — Package Builder data source is not connected.</p>;
  }

  return (
    <div>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: '0 0 2px' }}>{packageDefinition.label}</p>
      <p style={{ fontSize: 12, color: '#666', margin: 0 }}>
        {packageDefinition.lines?.length ?? 0} component{packageDefinition.lines?.length === 1 ? '' : 's'}
      </p>
    </div>
  );
}

interface ConfiguratorSummaryPanelProps {
  configuratorData?: Configurator | null;
  configState: ConfiguratorQuotePayload | null;
  fitmentResult?: FitmentResult | null;
  packageId?: string;
}

export default function ConfiguratorSummaryPanel({ configuratorData, configState, fitmentResult, packageId }: ConfiguratorSummaryPanelProps) {
  const legacySections = configuratorData?.sections as unknown as Record<string, ConfiguratorSection> | undefined;
  const steps = configuratorData?.sectionMap?.skuSelector?.steps ?? legacySections?.skuSelector?.steps ?? [];

  const selectedOptions = useMemo(() => {
    const selections = configState?.selectedFilters ?? {};
    return Object.entries(selections).map(([stepId, optionId]) => labelForSelection(steps, stepId, optionId));
  }, [steps, configState]);

  const skuList = configState?.commerceLines ?? [];
  const warnings = configState?.reviewFlags ?? [];
  const category = deriveFitmentPresentation(fitmentResult);

  if (!configState) {
    return (
      <div style={{ ...FS, border: '1px solid #e8e8e8', background: '#fff', padding: '16px' }} data-testid="configurator-summary-panel">
        <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Select a SKU above to see your configuration summary.</p>
      </div>
    );
  }

  return (
    <div style={{ ...FS, border: '1px solid #e8e8e8', background: '#fff' }} data-testid="configurator-summary-panel">
      <div style={{ background: '#1a2744', padding: '10px 16px' }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff' }}>Configuration Summary</span>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {/* Selected options */}
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
            <ListChecks size={11} /> Selected Options
          </p>
          {selectedOptions.length === 0 ? (
            <p style={{ fontSize: 12, color: '#888', margin: 0, fontStyle: 'italic' }}>No filters applied.</p>
          ) : (
            selectedOptions.map((sel) => (
              <div key={sel.stepLabel} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f0f0f0', fontSize: 12 }}>
                <span style={{ color: '#666' }}>{sel.stepLabel}</span>
                <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{sel.optionLabel}</span>
              </div>
            ))
          )}
        </div>

        {/* SKU list */}
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>SKU List</p>
          {skuList.length === 0 ? (
            <p style={{ fontSize: 12, color: '#888', margin: 0, fontStyle: 'italic' }}>No SKU selected yet.</p>
          ) : (
            skuList.map((line) => (
              <div key={line.sku} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#1a2744' }}>{line.sku}</span>
                <span style={{ fontSize: 11, color: line.status === 'unmatched' ? '#92400e' : '#15803d' }}>
                  {line.status === 'unmatched' ? 'Needs Review' : 'Ready'}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Compatibility status */}
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Compatibility Status</p>
          <p
            data-testid="summary-compatibility-status"
            data-fitment-status={category}
            style={{ fontSize: 12, fontWeight: 600, margin: 0, color: category === 'compatible' ? '#16a34a' : category === 'incompatible' ? '#c8102e' : category === 'warning' ? '#d97706' : '#6b7280' }}
          >
            {category === 'compatible' && 'Compatible'}
            {category === 'warning' && 'Compatible — Advisory'}
            {category === 'incompatible' && 'Incompatible'}
            {category === 'unknown' && 'Unknown'}
          </p>
        </div>

        {/* Warnings */}
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
            <AlertTriangle size={11} /> Warnings
          </p>
          {warnings.length === 0 ? (
            <p style={{ fontSize: 12, color: '#16a34a', margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle2 size={12} /> No outstanding warnings
            </p>
          ) : (
            warnings.map((flag, i) => (
              <p key={i} style={{ fontSize: 11, color: '#92400e', margin: '0 0 4px' }}>{flag}</p>
            ))
          )}
        </div>

        {/* Package summary */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Package size={11} /> Package Summary
          </p>
          <PackageSummary packageId={packageId} />
        </div>
      </div>
    </div>
  );
}
