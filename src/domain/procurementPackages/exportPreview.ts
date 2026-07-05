import type { MissingEquipmentReport, QuoteItemGroup, VehicleQuoteSummary } from '@/types/fleetQuote';
import type { ProcurementExportPreview } from '@/types/procurementPackages';
import { buildExportPreview } from '@/domain/fleetQuote';

export interface BuildProcurementExportPreviewInput {
  departmentLabel: string;
  packageName: string;
  vehicleSummaries: VehicleQuoteSummary[];
  equipment: QuoteItemGroup[];
  missingEquipment: MissingEquipmentReport;
  procurementNotes?: string;
  generatedAt: number;
}

/**
 * Assembles one package's read-only Export Preview by calling
 * src/domain/fleetQuote/exportPreview.ts's buildExportPreview directly, so
 * its recommendation de-duplication (by product id, capped at 8) is reused
 * rather than re-implemented — only the field names are remapped to this
 * feature's vocabulary (packageName/equipment/procurementNotes instead of
 * projectName/equipmentSummary/quoteNotes). Preview only: no PDF generation,
 * no backend call.
 */
export function buildProcurementExportPreview(input: BuildProcurementExportPreviewInput): ProcurementExportPreview {
  const base = buildExportPreview({
    departmentLabel: input.departmentLabel,
    projectName: input.packageName,
    vehicleSummaries: input.vehicleSummaries,
    equipmentSummary: input.equipment,
    missingEquipment: input.missingEquipment,
    quoteNotes: input.procurementNotes,
    generatedAt: input.generatedAt,
  });

  return {
    departmentLabel: base.departmentLabel,
    packageName: base.projectName,
    vehicleSummaries: base.vehicleSummaries,
    equipment: base.equipmentSummary,
    missingEquipment: base.missingEquipment,
    recommendations: base.recommendations,
    procurementNotes: base.quoteNotes,
    generatedAt: base.generatedAt,
  };
}
