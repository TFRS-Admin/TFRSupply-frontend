import type { Package, PackageLine } from '@/types';

export interface PackageBuilderService {
  getPackage(packageId: string): Promise<Package | null>;
  createPackage(lines: PackageLine[]): Promise<Package>;
  validatePackage(packageId: string): Promise<Package>;
}

export const packageBuilderService: PackageBuilderService = {
  async getPackage(): Promise<Package | null> {
    throw new Error('Not implemented');
  },
  async createPackage(): Promise<Package> {
    throw new Error('Not implemented');
  },
  async validatePackage(): Promise<Package> {
    throw new Error('Not implemented');
  },
};
