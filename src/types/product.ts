import type { BaseEntity, Dimensions, ImageAsset, Metadata } from './common';

export interface Vertical extends BaseEntity {
  slug: string;
  priority?: number;
}

export interface Category extends BaseEntity {
  slug: string;
  verticalId: string;
  parentCategoryId?: string;
  image?: ImageAsset;
}

export interface ProductFamily extends BaseEntity {
  slug: string;
  verticalIds: string[];
  categoryIds: string[];
  heroImage?: ImageAsset;
}

export interface Feature extends BaseEntity {
  icon?: string;
  sortOrder?: number;
}

export interface Specification {
  id: string;
  label: string;
  value: string | number | boolean;
  unit?: string;
  group?: string;
  sortOrder?: number;
}

export interface Product extends BaseEntity {
  slug: string;
  sku?: string;
  familyId?: string;
  verticalIds: string[];
  categoryIds: string[];
  features?: Feature[];
  specifications?: Specification[];
  dimensions?: Dimensions;
  images?: ImageAsset[];
  documentIds?: string[];
  metadata?: Metadata;
}
