import { z } from 'zod';
import type { Category, CategoryBreadcrumb, CategoryFilter, CategoryHero, CategoryProductCard, Feature, LinkAction, Product, ProductDocumentation, ProductDocumentationItem, ProductFamily, ProductMedia, ProductMediaAsset, ProductTab, Specification, Vertical, VerticalArticle, VerticalCardItem, VerticalHero, VerticalSection } from '@/types';
import { baseEntityObjectSchema, dimensionsSchema, imageAssetSchema, metadataSchema } from './common.schema';


export const linkActionSchema = z.object({
  label: z.string(),
  href: z.string(),
}) as z.ZodType<LinkAction>;

export const verticalHeroSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  cta: linkActionSchema.optional(),
}) as z.ZodType<VerticalHero>;

export const verticalCardItemSchema = z.object({
  label: z.string(),
  desc: z.string().optional(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  href: z.string().optional(),
  icon: z.string().optional(),
  categoryId: z.string().nullable().optional(),
  tagline: z.string().optional(),
  external: z.boolean().optional(),
}) as z.ZodType<VerticalCardItem>;

export const verticalSectionSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  body: z.string().optional(),
  cta: linkActionSchema.optional(),
  items: z.array(verticalCardItemSchema),
}) as z.ZodType<VerticalSection>;

export const verticalArticleSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string(),
  body: z.string().optional(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  cta: linkActionSchema.optional(),
}) as z.ZodType<VerticalArticle>;

export const verticalSchema = baseEntityObjectSchema.extend({
  slug: z.string(),
  priority: z.number().optional(),
  hero: verticalHeroSchema.optional(),
  featured_article: verticalArticleSchema.optional(),
  featured_products_section: verticalSectionSchema.optional(),
  categories_section: verticalSectionSchema.optional(),
  configurators_section: verticalSectionSchema.optional(),
  contracts_section: verticalSectionSchema.optional(),
  resources_section: verticalSectionSchema.optional(),
}) as z.ZodType<Vertical>;

export const categoryHeroSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
}) as z.ZodType<CategoryHero>;

export const categoryFilterSchema = z.object({
  id: z.string(),
  label: z.string(),
  options: z.array(z.string()),
}) as z.ZodType<CategoryFilter>;

export const categoryProductCardSchema = z.object({
  id: z.string(),
  label: z.string(),
  href: z.string().optional(),
  image: z.string().optional(),
  tagline: z.string().optional(),
  specs: z.array(z.string()).optional(),
  badges: z.array(z.string()).optional(),
}).catchall(z.union([z.string(), z.array(z.string()), z.undefined()])) as z.ZodType<CategoryProductCard>;

export const categoryBreadcrumbSchema = z.object({
  label: z.string(),
  to: z.string().optional(),
}) as z.ZodType<CategoryBreadcrumb>;

export const categorySchema = baseEntityObjectSchema.extend({
  slug: z.string(),
  verticalId: z.string(),
  parentCategoryId: z.string().optional(),
  image: imageAssetSchema.optional(),
  hero: categoryHeroSchema.optional(),
  filters: z.array(categoryFilterSchema).optional(),
  products: z.array(categoryProductCardSchema).optional(),
  breadcrumbs: z.array(categoryBreadcrumbSchema).optional(),
}) as z.ZodType<Category>;

export const productFamilySchema = baseEntityObjectSchema.extend({
  slug: z.string(),
  verticalIds: z.array(z.string()),
  categoryIds: z.array(z.string()),
  heroImage: imageAssetSchema.optional(),
}) as z.ZodType<ProductFamily>;

export const featureSchema = baseEntityObjectSchema.extend({
  icon: z.string().optional(),
  sortOrder: z.number().optional(),
}) as z.ZodType<Feature>;

export const specificationSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
  unit: z.string().optional(),
  group: z.string().optional(),
  sortOrder: z.number().optional(),
}) as z.ZodType<Specification>;

const productSpecificationValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
  z.array(z.number()),
  z.array(z.boolean()),
]);

export const productMediaAssetSchema = z.object({
  src: z.string(),
  alt: z.string().optional(),
}) as z.ZodType<ProductMediaAsset>;

export const productMediaSchema = z.object({
  hero: z.string().optional(),
  gallery: z.array(productMediaAssetSchema).optional(),
  videos: z.array(z.string()).optional(),
}) as z.ZodType<ProductMedia>;

export const productMarketingSchema = z.object({
  features: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  applications: z.array(z.string()).optional(),
});

export const productDocumentationItemSchema = z.object({
  label: z.string(),
  url: z.string().optional(),
  type: z.string().optional(),
}).catchall(z.string().optional()) as z.ZodType<ProductDocumentationItem>;

export const productDocumentationSchema = z.object({
  manuals: z.array(productDocumentationItemSchema).optional(),
  brochures: z.array(productDocumentationItemSchema).optional(),
  cad_files: z.array(productDocumentationItemSchema).optional(),
  certifications: z.array(productDocumentationItemSchema).optional(),
}) as z.ZodType<ProductDocumentation>;

export const productTabSchema = z.object({
  id: z.string(),
  label: z.string(),
  content_type: z.string(),
}) as z.ZodType<ProductTab>;

export const productSchema = baseEntityObjectSchema.extend({
  slug: z.string(),
  sku: z.string().optional(),
  familyId: z.string().optional(),
  verticalIds: z.array(z.string()),
  categoryIds: z.array(z.string()),
  features: z.array(featureSchema).optional(),
  specifications: z.record(productSpecificationValueSchema).optional(),
  dimensions: dimensionsSchema.optional(),
  images: z.array(imageAssetSchema).optional(),
  documentIds: z.array(z.string()).optional(),
  metadata: metadataSchema.optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  vendor: z.string().optional(),
  category: z.string().optional(),
  verticals: z.array(z.string()).optional(),
  product_family: z.string().optional(),
  tabs_component: z.string().optional(),
  tabs: z.array(productTabSchema).optional(),
  breadcrumbs: z.array(categoryBreadcrumbSchema).optional(),
  media: productMediaSchema.optional(),
  marketing: productMarketingSchema.optional(),
  documentation: productDocumentationSchema.optional(),
  commerce: z.object({
    sku_root: z.string().optional(),
    msrp_display: z.string().optional(),
    availability: z.string().optional(),
    price_display: z.string().optional(),
    accessories: z.array(z.object({
      sku: z.string().optional(),
      label: z.string().optional(),
      price: z.number().optional(),
    })).optional(),
    related_products: z.array(z.string()).optional(),
    sku_table: z.array(z.record(z.union([z.string(), z.number(), z.boolean(), z.null(), z.undefined()]))).optional(),
  }).catchall(z.unknown()).optional(),
  cta: z.object({
    where_to_buy_url: z.string().optional(),
    request_info_url: z.string().optional(),
    configurator_url: z.string().optional(),
    manual_url: z.string().optional(),
  }).optional(),
  configuratorId: z.string().optional(),
}) as z.ZodType<Product>;
