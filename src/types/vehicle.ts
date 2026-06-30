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
}

export interface Fitment {
  vehicleId?: string;
  productId?: string;
  compatible: boolean;
  notes?: string;
  requiredOptionIds?: string[];
  excludedOptionIds?: string[];
}
