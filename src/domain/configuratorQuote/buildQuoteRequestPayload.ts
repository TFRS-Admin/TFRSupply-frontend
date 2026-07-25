/**
 * domain/configuratorQuote/buildQuoteRequestPayload.ts
 *
 * Converts a ConfiguratorQuotePayload (the object ConfiguratorModule's
 * internal quotePayload useMemo produces — shared by both its own Package
 * Quote panel and the composed ConfiguratorCommerceActions panel) plus
 * captured contact info into the QuotePayload the quote delivery adapter
 * (PR-12, src/adapters/quoteDelivery) expects. Pure and side-effect free.
 */

import type { QuoteAccessory, QuoteContact, QuotePayload, QuoteSelectedOption } from '@/adapters/quoteDelivery';
import type { Configurator, ConfiguratorQuotePayload, ConfiguratorSection, ConfiguratorStep, ConfiguratorVehicleSelection } from '@/types';

function labelForFilterSelection(steps: ConfiguratorStep[], stepId: string, optionId: string): { stepLabel: string; optionLabel: string } {
  const step = steps.find((s) => s.id === stepId);
  const option = step?.options?.find((o) => o.id === optionId);
  return { stepLabel: step?.label ?? stepId, optionLabel: option?.label ?? optionId };
}

function vehicleSummaryText(vehicle: Pick<ConfiguratorVehicleSelection, 'year' | 'make' | 'model'> | null | undefined): string | undefined {
  if (!vehicle?.year && !vehicle?.make && !vehicle?.model) return undefined;
  return [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(' ');
}

export function buildQuoteRequestPayload(
  configState: ConfiguratorQuotePayload | null | undefined,
  configuratorData: Configurator | null | undefined,
  contact: QuoteContact,
  submissionId: string,
): QuotePayload | null {
  if (!configState?.selectedBaseSku) return null;

  const legacySections = configuratorData?.sections as unknown as Record<string, ConfiguratorSection> | undefined;
  const steps = configuratorData?.sectionMap?.skuSelector?.steps ?? legacySections?.skuSelector?.steps ?? [];
  const selectedOptions: QuoteSelectedOption[] = Object.entries(configState.selectedFilters ?? {}).map(([stepId, optionId]) => {
    const { stepLabel, optionLabel } = labelForFilterSelection(steps, stepId, optionId);
    return { stepId, stepLabel, selected: [optionLabel] };
  });

  const accessories: QuoteAccessory[] = (configState.accessorySkus ?? []).map((sku) => {
    const line = (configState.commerceLines ?? []).find((l) => l.sku === sku);
    return { stepId: 'accessories', optionId: sku, optionLabel: sku, priceModifier: line?.price ?? 0 };
  });

  return {
    productId: configState.configuratorId ?? configState.selectedBaseSku,
    configuratorId: configState.configuratorId ?? configState.selectedBaseSku,
    productTitle: configState.productFamily ?? configState.selectedBaseSku,
    selectedOptions,
    accessories,
    selectedSku: configState.selectedBaseSku,
    matchingSkus: configState.commerceLines ?? [],
    skuStatus: configState.checkoutReady ? 'matched' : 'needs-review',
    skuPreview: configState.selectedBaseSku,
    dependencyNotes: [],
    warningNotes: configState.reviewFlags ?? [],
    vehicleSummary: vehicleSummaryText(configState.selectedVehicle),
    contact,
    submissionId,
    timestamp: new Date().toISOString(),
    source: 'configurator-pdp',
  };
}
