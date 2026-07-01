export interface Metadata {
  source?: string;
  tags?: string[];
  attributes?: Record<string, string | number | boolean | null>;
}

export interface BaseEntity {
  id: string;
  label: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Metadata;
}

export interface Money {
  amount: number;
  currencyCode: string;
}

export interface Dimensions {
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  unit?: string;
  weightUnit?: string;
}

export interface ImageAsset {
  id?: string;
  src: string;
  alt: string;
  title?: string;
  width?: number;
  height?: number;
}
