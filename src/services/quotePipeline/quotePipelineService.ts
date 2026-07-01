import { catalogService, type CatalogService } from '@/services/catalog';
import { commerceService, type CommerceService } from '@/services/commerce';
import { configuratorService, type ConfiguratorService } from '@/services/configurator';
import { packageBuilderService, type PackageBuilderService } from '@/services/packageBuilder';
import { pricingService, type PricingService } from '@/services/pricing';
import { quoteBuilderService, type QuoteBuilderService } from '@/services/quoteBuilder';
import { vehicleFitmentService, type VehicleFitmentService } from '@/services/vehicleFitment';
import { quoteAssemblyInputSchema, quotePipelineInputSchema, quotePipelineResultSchema } from '@/schemas/quote.schema';
import type { QuoteLineAssemblyInput, QuotePackageReference, QuotePipelineCommerceReference, QuotePipelineInput, QuotePipelineResult, ReviewFlag } from '@/types';

export interface QuotePipelineServiceDependencies {
  catalog: CatalogService;
  configurator: ConfiguratorService;
  packageBuilder: PackageBuilderService;
  pricing: PricingService;
  commerce: CommerceService;
  vehicleFitment: VehicleFitmentService;
  quoteBuilder: QuoteBuilderService;
}

export interface QuotePipelineService {
  assembleQuote(input: QuotePipelineInput): Promise<QuotePipelineResult>;
}

const defaultDependencies: QuotePipelineServiceDependencies = {
  catalog: catalogService,
  configurator: configuratorService,
  packageBuilder: packageBuilderService,
  pricing: pricingService,
  commerce: commerceService,
  vehicleFitment: vehicleFitmentService,
  quoteBuilder: quoteBuilderService,
};

function flag(code: string, severity: ReviewFlag['severity'], message: string, source: ReviewFlag['source'], fieldPath?: string): ReviewFlag {
  return fieldPath ? { code, severity, message, source, fieldPath } : { code, severity, message, source };
}

function statusFrom(flags: ReviewFlag[], quoteStatus: QuotePipelineResult['quote']['status'], pricingStatus: QuotePipelineResult['pricing']['status']): QuotePipelineResult['status'] {
  if (flags.some((reviewFlag) => reviewFlag.severity === 'error')) return 'invalid';
  if (quoteStatus === 'unavailable' || pricingStatus === 'unavailable') return 'unavailable';
  if (quoteStatus === 'assembled' && pricingStatus === 'priced') return 'assembled';
  return 'pending';
}

export function createQuotePipelineService(dependencies: Partial<QuotePipelineServiceDependencies> = {}): QuotePipelineService {
  const services = { ...defaultDependencies, ...dependencies };

  return {
    async assembleQuote(input) {
      const validated = quotePipelineInputSchema.parse(input);
      const reviewFlags: ReviewFlag[] = [];
      const commerceReferences: QuotePipelineCommerceReference[] = [];
      const packageReferences: QuotePackageReference[] = [];

      for (const line of validated.lines) {
        if (line.productId && !services.catalog.getProduct(line.productId)) {
          reviewFlags.push(flag('catalog-product-not-found', 'review-required', `Catalog product ${line.productId} was not found.`, 'quote-builder', 'lines.productId'));
        }
        if (line.configuratorId && !services.configurator.getConfigurator(line.configuratorId)) {
          reviewFlags.push(flag('configurator-not-found', 'review-required', `Configurator ${line.configuratorId} was not found.`, 'quote-builder', 'lines.configuratorId'));
        }
        if (validated.vehicle && line.productId) {
          const fitment = await services.vehicleFitment.evaluateProductCompatibility({
            vehicle: validated.vehicle,
            productId: line.productId,
            sku: line.sku,
          });
          if (!fitment.compatible && fitment.status === 'incompatible') {
            reviewFlags.push(flag('product-fitment-incompatible', 'error', fitment.notes ?? `Product ${line.productId} is not compatible with the selected vehicle.`, 'unknown', 'vehicle'));
          }
          for (const issue of fitment.issues) {
            reviewFlags.push(flag(issue.code, issue.severity === 'error' ? 'error' : 'warning', issue.message, 'unknown', issue.field));
          }
        }
        const reference: QuotePipelineCommerceReference = { sku: line.sku, productId: line.productId };
        if (line.productId) reference.productLookup = await services.commerce.getShopifyProduct(line.productId);
        if (line.sku) reference.variantMappingLookup = await services.commerce.getVariantMapping(line.sku);
        if (reference.productLookup || reference.variantMappingLookup) commerceReferences.push(reference);
      }

      for (const packageInput of validated.packages ?? []) {
        if (validated.vehicle) {
          const fitment = await services.vehicleFitment.evaluatePackageCompatibility({ vehicle: validated.vehicle, packageId: packageInput.packageId });
          if (!fitment.compatible && fitment.status === 'incompatible') {
            reviewFlags.push(flag('package-fitment-incompatible', 'error', fitment.notes ?? `Package ${packageInput.packageId} is not compatible with the selected vehicle.`, 'unknown', 'packages.vehicle'));
          }
        }
        const assembly = await services.packageBuilder.assemblePackage({ ...packageInput, vehicle: packageInput.vehicle ?? validated.vehicle });
        packageReferences.push({
          packageId: packageInput.packageId,
          packageRevision: assembly.package?.metadata?.revision ?? packageInput.definition?.metadata?.revision,
          packageName: assembly.package?.label ?? packageInput.definition?.label,
          definition: assembly.package ?? packageInput.definition,
          assembly,
        });
        for (const warning of assembly.warnings ?? []) {
          reviewFlags.push(flag(warning.code, warning.severity, warning.message, 'package-builder', warning.fieldPath));
        }
      }

      const pricing = await services.pricing.priceQuote({
        quoteId: validated.draftId,
        context: validated.pricingContext,
        lines: validated.lines
          .filter((line) => line.sku)
          .map((line) => ({ sku: line.sku as string, productId: line.productId, quantity: line.quantity })),
      });
      for (const warning of pricing.warnings ?? []) {
        reviewFlags.push(flag(warning.code, warning.severity, warning.message, 'pricing', warning.fieldPath));
      }

      const lines: QuoteLineAssemblyInput[] = validated.lines.map(({ configuratorId, ...line }) => line);
      const quoteInput = quoteAssemblyInputSchema.parse({
        draftId: validated.draftId,
        customer: validated.customer,
        verticalId: validated.verticalId,
        vehicle: validated.vehicle,
        lines,
        packageReferences,
        pricingReference: { status: pricing.status, result: pricing.data ?? undefined },
        workflow: { status: 'assembling', approvalStatus: 'draft', reviewFlags },
        metadata: validated.metadata,
      });
      const quote = await services.quoteBuilder.assembleQuote(quoteInput);
      const allFlags = [...reviewFlags, ...quote.reviewFlags];

      return quotePipelineResultSchema.parse({
        status: statusFrom(allFlags, quote.status, pricing.status),
        quote,
        packageReferences,
        pricing,
        commerceReferences,
        reviewFlags: allFlags,
      });
    },
  };
}

export const quotePipelineService: QuotePipelineService = createQuotePipelineService();
