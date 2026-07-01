import type { BaseEntity, Metadata } from './common';
import type { Product } from './product';
import type { Fitment, Vehicle } from './vehicle';

export type PackageLineItemType = 'product' | 'accessory' | 'service' | 'kit';
export type PackageAccessoryRequirement = 'required' | 'optional';
export type PackageCompatibilityStatus = 'compatible' | 'incompatible' | 'unknown' | 'requires-review';
export type PackageAssemblyStatus = 'assembled' | 'pending' | 'invalid' | 'unavailable';
export type PackageValidationSeverity = 'info' | 'warning' | 'error' | 'review-required';

export interface Accessory extends BaseEntity {
  sku?: string;
  productId?: string;
  compatibleProductIds?: string[];
  requirement?: PackageAccessoryRequirement;
  quantity?: number;
}

export interface PackageMetadata extends Metadata {
  packageType?: 'reusable' | 'vehicle-specific' | 'installer' | 'quote-ready' | 'unknown';
  revision?: string;
  owner?: string;
  effectiveAt?: string;
  expiresAt?: string;
}

export interface PackageLine {
  id: string;
  product: Product | Accessory;
  quantity: number;
  required: boolean;
  sortOrder?: number;
  itemType?: PackageLineItemType;
  sku?: string;
  productId?: string;
  accessoryIds?: string[];
  metadata?: PackageMetadata;
}

export interface PackageDefinition extends BaseEntity {
  verticalIds: string[];
  categoryIds?: string[];
  vehicleIds?: string[];
  lines: PackageLine[];
  requiredAccessories?: Accessory[];
  optionalAccessories?: Accessory[];
  metadata?: PackageMetadata;
}

export interface Package extends PackageDefinition {}

export interface PackageAssemblyInput {
  packageId?: string;
  definition?: PackageDefinition;
  selectedOptionalAccessoryIds?: string[];
  vehicle?: Vehicle;
  fitment?: Fitment[];
  metadata?: PackageMetadata;
}

export interface PackageCompatibilityIssue {
  code: string;
  severity: PackageValidationSeverity;
  message: string;
  lineId?: string;
  productId?: string;
  accessoryId?: string;
  vehicleId?: string;
  fieldPath?: string;
}

export interface PackageCompatibilityResult {
  status: PackageCompatibilityStatus;
  compatible: boolean;
  issues: PackageCompatibilityIssue[];
}

export interface PackageAssemblyResult {
  status: PackageAssemblyStatus;
  package: PackageDefinition | null;
  compatibility: PackageCompatibilityResult;
  selectedOptionalAccessories: Accessory[];
  requiredAccessories: Accessory[];
  warnings?: PackageCompatibilityIssue[];
}

export interface PackageValidationResult {
  valid: boolean;
  issues: PackageCompatibilityIssue[];
}
