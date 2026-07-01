import type { Fitment, Vehicle } from '@/types';

export interface VehicleService {
  getVehicle(vehicleId: string): Promise<Vehicle | null>;
  listVehicles(): Promise<Vehicle[]>;
  evaluateFitment(vehicleId: string, productId: string): Promise<Fitment>;
}

export const vehicleService: VehicleService = {
  async getVehicle(): Promise<Vehicle | null> {
    throw new Error('Not implemented');
  },
  async listVehicles(): Promise<Vehicle[]> {
    throw new Error('Not implemented');
  },
  async evaluateFitment(): Promise<Fitment> {
    throw new Error('Not implemented');
  },
};
