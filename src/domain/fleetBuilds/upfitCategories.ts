import type { Product } from '@/types';
import type { UpfitCategoryDefinition, UpfitCategoryId } from '@/types/fleetBuilds';

/**
 * The 12 deterministic upfit categories every fleet build is measured
 * against. Fixed, ordered list — not derived from the catalog — because a
 * build's checklist must stay stable even while the product catalog is thin.
 */
export const UPFIT_CATEGORIES: UpfitCategoryDefinition[] = [
  { id: 'roof_lighting', label: 'Roof Lighting' },
  { id: 'interior_lighting', label: 'Interior Lighting' },
  { id: 'perimeter_lighting', label: 'Perimeter Lighting' },
  { id: 'siren', label: 'Siren' },
  { id: 'speaker', label: 'Speaker' },
  { id: 'push_bumper', label: 'Push Bumper' },
  { id: 'console', label: 'Console' },
  { id: 'partition', label: 'Partition' },
  { id: 'rear_warning', label: 'Rear Warning' },
  { id: 'scene_lighting', label: 'Scene Lighting' },
  { id: 'graphics_markings', label: 'Graphics / Markings' },
  { id: 'accessories', label: 'Accessories' },
];

export const ALL_UPFIT_CATEGORY_IDS: UpfitCategoryId[] = UPFIT_CATEGORIES.map((category) => category.id);

const UPFIT_CATEGORY_LABEL_BY_ID: Record<UpfitCategoryId, string> = UPFIT_CATEGORIES.reduce(
  (labels, category) => ({ ...labels, [category.id]: category.label }),
  {} as Record<UpfitCategoryId, string>,
);

export function getUpfitCategoryLabel(categoryId: UpfitCategoryId): string {
  return UPFIT_CATEGORY_LABEL_BY_ID[categoryId] ?? categoryId;
}

/** Maps an existing catalog Category id (src/data/categories/*.json) to its upfit category. */
const CATALOG_CATEGORY_TO_UPFIT: Record<string, UpfitCategoryId> = {
  'light-bars': 'roof_lighting',
};

/**
 * Ordered keyword rules over existing product text fields; first match wins.
 * Keywords are deliberately narrow (full phrases, not single generic words)
 * to avoid misclassifying unrelated products.
 */
const UPFIT_CATEGORY_KEYWORD_RULES: Array<{ id: UpfitCategoryId; keywords: string[] }> = [
  { id: 'siren', keywords: ['siren'] },
  { id: 'speaker', keywords: ['speaker'] },
  { id: 'push_bumper', keywords: ['push bumper', 'push-bumper'] },
  { id: 'partition', keywords: ['partition', 'prisoner barrier', 'prisoner transport'] },
  { id: 'console', keywords: ['console', 'consolette'] },
  { id: 'rear_warning', keywords: ['rear warning', 'signalmaster', 'traffic director', 'arrow stick', 'directional warning'] },
  { id: 'scene_lighting', keywords: ['scene light', 'work light', 'floodlight', 'flood light', 'takedown light'] },
  { id: 'graphics_markings', keywords: ['graphic', 'marking', 'decal', 'chevron', 'reflective striping'] },
  { id: 'perimeter_lighting', keywords: ['perimeter light', 'surface mount light', 'hideaway', 'dynaflare', 'grille light'] },
  { id: 'interior_lighting', keywords: ['interior light', 'dash light', 'visor light', 'deck light', 'compartment light'] },
  { id: 'roof_lighting', keywords: ['light bar', 'lightbar', 'roof light', 'beacon', 'rotator'] },
  { id: 'accessories', keywords: ['accessory', 'accessories', 'harness cable', 'mount bracket', 'controller switch'] },
];

function buildProductHaystack(product: Product): string {
  const parts = [
    product.title,
    product.label,
    product.subtitle,
    product.product_family,
    ...(product.marketing?.features ?? []),
  ];
  return parts.filter((value): value is string => Boolean(value)).join(' ').toLowerCase();
}

/**
 * Deterministically classifies a product into one of the 12 upfit categories
 * using only existing catalog metadata (catalog category id, title/label/
 * subtitle, product family, marketing features) — no new product database is
 * introduced. Returns null when no rule matches so callers never guess.
 */
export function classifyProductUpfitCategory(product: Product | null | undefined): UpfitCategoryId | null {
  if (!product) return null;

  const catalogCategoryIds = [product.category, ...(product.categoryIds ?? [])].filter(
    (value): value is string => Boolean(value),
  );
  for (const categoryId of catalogCategoryIds) {
    const mapped = CATALOG_CATEGORY_TO_UPFIT[categoryId];
    if (mapped) return mapped;
  }

  const haystack = buildProductHaystack(product);
  if (!haystack) return null;

  for (const rule of UPFIT_CATEGORY_KEYWORD_RULES) {
    if (rule.keywords.some((keyword) => haystack.includes(keyword))) return rule.id;
  }

  return null;
}
