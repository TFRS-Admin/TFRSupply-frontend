import type { FitmentRequest, FitmentResult } from '@/types';

export interface VehicleFitmentAdapter {
  evaluateFitment(request: FitmentRequest): Promise<FitmentResult>;
}

const unavailableMessage = 'Vehicle fitment data source is not connected.';

export const unavailableVehicleFitmentAdapter: VehicleFitmentAdapter = {
  async evaluateFitment(request) {
    return {
      status: 'unknown',
      compatible: false,
      vehicleId: request.vehicle.id,
      subject: request.subject,
      issues: [{ code: 'VEHICLE_FITMENT_UNAVAILABLE', severity: 'info', message: unavailableMessage }],
    };
  },
};
