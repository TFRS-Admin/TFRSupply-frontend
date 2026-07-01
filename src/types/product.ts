import type { BaseEntity, Dimensions, ImageAsset, Metadata } from './common';


export interface LinkAction {
  label: string;
  href: string;
}

export interface VerticalHero {
  title?: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  cta?: LinkAction;
}

export interface VerticalCardItem {
  label: string;
  desc?: string;
  image?: string;
  imageAlt?: string;
  href?: string;
  icon?: string;
  categoryId?: string | null;
  tagline?: string;
  external?: boolean;
}

export interface VerticalSection {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  body?: string;
  cta?: LinkAction;
  items: VerticalCardItem[];
}

export interface VerticalArticle {
  eyebrow?: string;
  title: string;
  body?: string;
  image?: string;
  imageAlt?: string;
  cta?: LinkAction;
}

export interface Vertical extends BaseEntity {
  slug: string;
  priority?: number;
  hero?: VerticalHero;
  featured_article?: VerticalArticle;
  featured_products_section?: VerticalSection;
  categories_section?: VerticalSection;
  configurators_section?: VerticalSection;
  contracts_section?: VerticalSection;
  resources_section?: VerticalSection;
}

export interface CategoryHero {
  title?: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
}

export interface CategoryFilter {
  id: string;
  label: string;
  options: string[];
}

export interface CategoryProductCard {
  id: string;
  label: string;
  href?: string;
  image?: string;
  tagline?: string;
  specs?: string[];
  badges?: string[];
  [key: string]: string | string[] | undefined;
}

export interface CategoryBreadcrumb {
  label: string;
  to?: string;
}

export interface Category extends BaseEntity {
  slug: string;
  verticalId: string;
  parentCategoryId?: string;
  image?: ImageAsset;
  hero?: CategoryHero;
  filters?: CategoryFilter[];
  products?: CategoryProductCard[];
  breadcrumbs?: CategoryBreadcrumb[];
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
