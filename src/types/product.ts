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

export type ProductSpecificationValue = string | number | boolean | string[] | number[] | boolean[];

export interface Specification {
  id: string;
  label: string;
  value: string | number | boolean;
  unit?: string;
  group?: string;
  sortOrder?: number;
}

export interface ProductMediaAsset {
  src: string;
  alt?: string;
}

export interface ProductMedia {
  hero?: string;
  gallery?: ProductMediaAsset[];
  videos?: string[];
}

export interface ProductMarketing {
  features?: string[];
  benefits?: string[];
  applications?: string[];
}

export interface ProductDocumentationItem {
  label: string;
  url?: string;
  type?: string;
  [key: string]: string | undefined;
}

export interface ProductDocumentation {
  manuals?: ProductDocumentationItem[];
  brochures?: ProductDocumentationItem[];
  cad_files?: ProductDocumentationItem[];
  certifications?: ProductDocumentationItem[];
}

export interface ProductCommerceAccessory {
  sku?: string;
  label?: string;
  price?: number;
}

export interface ProductSkuRow {
  sku?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface ProductCommerce {
  sku_root?: string;
  msrp_display?: string;
  availability?: string;
  price_display?: string;
  accessories?: ProductCommerceAccessory[];
  related_products?: string[];
  related_packages?: string[];
  sku_table?: ProductSkuRow[];
  [key: string]: unknown;
}

export interface ProductCTA {
  where_to_buy_url?: string;
  request_info_url?: string;
  configurator_url?: string;
  manual_url?: string;
}

export interface ProductHeroActionLinks {
  whereToBuyUrl?: string;
  requestInfoUrl?: string;
  configuratorUrl?: string;
  manualUrl?: string;
}

export interface ProductHeroTabLink {
  label: string;
  href: string;
}

export interface ProductTab {
  id: string;
  label: string;
  content_type: string;
}

export type ProductListStatus = 'ready' | 'empty' | 'unavailable';

export interface ProductSearchFilter {
  verticalId?: string;
  categoryId?: string;
  vendor?: string;
}

export interface ProductSearchQuery {
  query?: string;
  filter?: ProductSearchFilter;
}

export interface ProductListResult {
  status: ProductListStatus;
  products: Product[];
  total: number;
}

export interface Product extends BaseEntity {
  slug: string;
  sku?: string;
  familyId?: string;
  verticalIds: string[];
  categoryIds: string[];
  features?: Feature[];
  specifications?: Record<string, ProductSpecificationValue>;
  dimensions?: Dimensions;
  images?: ImageAsset[];
  documentIds?: string[];
  metadata?: Metadata;

  title?: string;
  subtitle?: string;
  vendor?: string;
  category?: string;
  verticals?: string[];
  product_family?: string;
  tabs_component?: string;
  tabs?: ProductTab[];
  breadcrumbs?: CategoryBreadcrumb[];
  media?: ProductMedia;
  marketing?: ProductMarketing;
  documentation?: ProductDocumentation;
  commerce?: ProductCommerce;
  cta?: ProductCTA;
  summary_bullets?: string[];
  actions?: ProductHeroActionLinks;
  hero_tabs?: ProductHeroTabLink[];
  shopify?: Record<string, unknown>;
  configuratorId?: string;
}
