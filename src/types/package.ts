import type { BaseEntity } from './common';
import type { Product } from './product';

export interface Accessory extends BaseEntity {
  sku?: string;
  productId?: string;
  compatibleProductIds?: string[];
}

export interface PackageLine {
  id: string;
  product: Product | Accessory;
  quantity: number;
  required: boolean;
  sortOrder?: number;
}

export interface Package extends BaseEntity {
  verticalIds: string[];
  categoryIds?: string[];
  lines: PackageLine[];
}
