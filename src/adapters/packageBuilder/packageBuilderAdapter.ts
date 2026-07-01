import type { PackageAssemblyInput, PackageAssemblyResult, PackageDefinition, PackageValidationResult } from '@/types';

export interface PackageBuilderAdapter {
  getPackageDefinition(packageId: string): Promise<PackageDefinition | null>;
  assemblePackage(input: PackageAssemblyInput): Promise<PackageAssemblyResult>;
  validatePackage(input: PackageAssemblyInput): Promise<PackageValidationResult>;
}

const unavailableMessage = 'Package Builder data source is not connected.';

export const unavailablePackageBuilderAdapter: PackageBuilderAdapter = {
  async getPackageDefinition() {
    return null;
  },
  async assemblePackage() {
    return {
      status: 'pending',
      package: null,
      compatibility: { status: 'unknown', compatible: false, issues: [] },
      selectedOptionalAccessories: [],
      requiredAccessories: [],
      warnings: [{ code: 'PACKAGE_BUILDER_UNAVAILABLE', severity: 'info', message: unavailableMessage }],
    };
  },
  async validatePackage() {
    return {
      valid: false,
      issues: [{ code: 'PACKAGE_BUILDER_UNAVAILABLE', severity: 'info', message: unavailableMessage }],
    };
  },
};
