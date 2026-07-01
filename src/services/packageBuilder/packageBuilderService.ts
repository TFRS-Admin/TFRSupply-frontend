import { unavailablePackageBuilderAdapter } from '@/adapters/packageBuilder';
import type { PackageBuilderAdapter } from '@/adapters/packageBuilder';
import { packageAssemblyInputSchema } from '@/schemas/package.schema';
import type { PackageAssemblyInput, PackageAssemblyResult, PackageDefinition, PackageValidationResult } from '@/types';

export interface PackageBuilderService {
  getPackageDefinition(packageId: string): Promise<PackageDefinition | null>;
  assemblePackage(input: PackageAssemblyInput): Promise<PackageAssemblyResult>;
  validatePackage(input: PackageAssemblyInput): Promise<PackageValidationResult>;
}

export function createPackageBuilderService(adapter: PackageBuilderAdapter = unavailablePackageBuilderAdapter): PackageBuilderService {
  return {
    getPackageDefinition(packageId) {
      return adapter.getPackageDefinition(packageId);
    },
    assemblePackage(input) {
      return adapter.assemblePackage(packageAssemblyInputSchema.parse(input));
    },
    validatePackage(input) {
      return adapter.validatePackage(packageAssemblyInputSchema.parse(input));
    },
  };
}

export const packageBuilderService: PackageBuilderService = createPackageBuilderService();
