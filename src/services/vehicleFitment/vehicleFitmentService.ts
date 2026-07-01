import { unavailableVehicleFitmentAdapter } from '@/adapters/vehicleFitment';
import type { VehicleFitmentAdapter } from '@/adapters/vehicleFitment';
import { fitmentRequestSchema, fitmentResultSchema, packageFitmentRequestSchema, productFitmentRequestSchema } from '@/schemas/vehicle.schema';
import type { FitmentRequest, FitmentResult, FitmentSubject, PackageFitmentRequest, ProductFitmentRequest } from '@/types';

export interface VehicleFitmentService {
  evaluateFitment(request: FitmentRequest): Promise<FitmentResult>;
  evaluateProductCompatibility(request: ProductFitmentRequest): Promise<FitmentResult>;
  evaluatePackageCompatibility(request: PackageFitmentRequest): Promise<FitmentResult>;
}

function createSubject(type: FitmentSubject['type'], id: string, sku?: string): FitmentSubject {
  return sku ? { type, id, sku } : { type, id };
}

export function createVehicleFitmentService(adapter: VehicleFitmentAdapter = unavailableVehicleFitmentAdapter): VehicleFitmentService {
  async function evaluateValidated(request: FitmentRequest): Promise<FitmentResult> {
    const result = await adapter.evaluateFitment(fitmentRequestSchema.parse(request));
    return fitmentResultSchema.parse(result);
  }

  return {
    evaluateFitment(request) {
      return evaluateValidated(request);
    },
    evaluateProductCompatibility(request) {
      const validated = productFitmentRequestSchema.parse(request);
      return evaluateValidated({
        vehicle: validated.vehicle,
        subject: createSubject('product', validated.productId, validated.sku),
        requestedOptionIds: validated.requestedOptionIds,
      });
    },
    evaluatePackageCompatibility(request) {
      const validated = packageFitmentRequestSchema.parse(request);
      return evaluateValidated({
        vehicle: validated.vehicle,
        subject: createSubject('package', validated.packageId, validated.sku),
        requestedOptionIds: validated.requestedOptionIds,
      });
    },
  };
}

export const vehicleFitmentService: VehicleFitmentService = createVehicleFitmentService();
