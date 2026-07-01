import type { BaseEntity } from './common';

export interface Make extends BaseEntity {
  slug: string;
}

export interface Model extends BaseEntity {
  makeId: string;
  slug: string;
}

export interface Year {
  value: number;
  label?: string;
}

export interface Vehicle extends BaseEntity {
  make: Make;
  model: Model;
  year: Year;
  bodyStyle?: string;
  trim?: string;
  chassis?: string;
}

export type FitmentSubjectType = 'product' | 'package';

export type FitmentEvaluationStatus = 'compatible' | 'incompatible' | 'unknown';

export type FitmentIssueSeverity = 'info' | 'warning' | 'error';

export interface FitmentSubject {
  type: FitmentSubjectType;
  id: string;
  sku?: string;
}

export interface FitmentRequest {
  vehicle: Vehicle;
  subject: FitmentSubject;
  requestedOptionIds?: string[];
}

export interface FitmentIssue {
  code: string;
  severity: FitmentIssueSeverity;
  message: string;
  field?: string;
}

export interface FitmentResult {
  status: FitmentEvaluationStatus;
  compatible: boolean;
  vehicleId?: string;
  subject: FitmentSubject;
  notes?: string;
  requiredOptionIds?: string[];
  excludedOptionIds?: string[];
  issues: FitmentIssue[];
}

export interface ProductFitmentRequest extends Omit<FitmentRequest, 'subject'> {
  productId: string;
  sku?: string;
}

export interface PackageFitmentRequest extends Omit<FitmentRequest, 'subject'> {
  packageId: string;
  sku?: string;
}

export interface Fitment {
  vehicleId?: string;
  productId?: string;
  compatible: boolean;
  notes?: string;
  requiredOptionIds?: string[];
  excludedOptionIds?: string[];
}
