import type {
  MissingEquipmentReport,
  ProjectQuoteExportPreview,
  QuoteItemGroup,
  QuoteRecommendedAddition,
  VehicleQuoteSummary,
} from '@/types/fleetQuote';

const MAX_EXPORT_RECOMMENDATIONS = 8;

export interface BuildExportPreviewInput {
  departmentLabel: string;
  projectName: string;
  vehicleSummaries: VehicleQuoteSummary[];
  equipmentSummary: QuoteItemGroup[];
  missingEquipment: MissingEquipmentReport;
  quoteNotes?: string;
  generatedAt: number;
}

/**
 * Assembles the Export Preview's read-only document from already-computed
 * aggregation pieces — Department, Project, Vehicle Summary, Equipment
 * Summary, Missing Equipment, Recommendations, Quote Notes. Preview only: no
 * PDF generation, no backend, no new computation beyond de-duplicating
 * recommended products already surfaced per vehicle.
 */
export function buildExportPreview(input: BuildExportPreviewInput): ProjectQuoteExportPreview {
  const seenProductIds = new Set<string>();
  const recommendations: QuoteRecommendedAddition[] = [];

  input.vehicleSummaries.forEach((summary) => {
    summary.recommendedAdditions.forEach((addition) => {
      if (recommendations.length >= MAX_EXPORT_RECOMMENDATIONS || seenProductIds.has(addition.product.id)) return;
      seenProductIds.add(addition.product.id);
      recommendations.push(addition);
    });
  });

  return {
    departmentLabel: input.departmentLabel,
    projectName: input.projectName,
    vehicleSummaries: input.vehicleSummaries,
    equipmentSummary: input.equipmentSummary,
    missingEquipment: input.missingEquipment,
    recommendations,
    quoteNotes: input.quoteNotes ?? '',
    generatedAt: input.generatedAt,
  };
}
