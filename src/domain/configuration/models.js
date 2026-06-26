/**
 * domain/configuration/models.js
 * Pure data model constructors and helpers for the configuration engine.
 * No React, no Base44, no Shopify dependencies.
 */

/**
 * ConfigurationSession — top-level session container.
 * @param {object} configuratorJson — raw loaded JSON
 * @returns {ConfigurationSession}
 */
export function createSession(configuratorJson) {
  return {
    id: configuratorJson.id,
    productId: configuratorJson.productId,
    label: configuratorJson.label,
    skuRoot: configuratorJson.skuRoot,
    steps: configuratorJson.steps.map(normalizeStep),
    dependencyRules: (configuratorJson.dependencyRules || []).map(normalizeDependencyRule),
    compatibilityRules: (configuratorJson.compatibilityRules || []).map(normalizeCompatibilityRule),
    // skuOptions is the source of truth — existing SKUs that selections filter against
    skuOptions: (configuratorJson.skuOptions || []).map(normalizeSkuOption),
    priceDisplay: configuratorJson.priceDisplay || 'Contact for pricing',
    shopifyMapping: configuratorJson.shopifyMapping || null, // reserved, not used
  };
}

/**
 * ConfigurationStep — a single user-facing configuration question.
 */
export function normalizeStep(raw) {
  return {
    id: raw.id,
    label: raw.label,
    required: raw.required !== false,
    multiple: raw.multiple === true,
    skuSegmentKey: raw.skuSegmentKey || raw.id,
    options: (raw.options || []).map(normalizeOption),
  };
}

/**
 * ConfigurationOption — a single selectable choice within a step.
 */
export function normalizeOption(raw) {
  return {
    id: raw.id,
    label: raw.label,
    skuSegment: raw.skuSegment || raw.id.toUpperCase(),
    priceModifier: raw.priceModifier || 0,
    description: raw.description || null,
    image: raw.image || null,
    tags: raw.tags || [],
    _prototype: raw._prototype || false,
  };
}

/**
 * SkuOption — an existing SKU from the product catalog with its filter attributes.
 * User selections are filtered against these to find the matching SKU.
 *
 * @param {object} raw — { sku, label?, attributes: { [skuSegmentKey]: skuSegmentValue } }
 */
export function normalizeSkuOption(raw) {
  return {
    sku: raw.sku,
    label: raw.label || raw.sku,
    attributes: raw.attributes || {},
  };
}

/**
 * SelectionState — the user's current choices.
 * stepId → optionId (string) | optionId[] (if multiple)
 */
export function createSelectionState() {
  return {};
}

/**
 * DependencyRule — "if step X = option Y, then step Z is required / default to W"
 */
export function normalizeDependencyRule(raw) {
  return {
    id: raw.id,
    type: raw.type || 'requires', // 'requires' | 'forces'
    ifStep: raw.ifStep,
    ifOption: raw.ifOption,
    thenStep: raw.thenStep,
    thenOption: raw.thenOption || null,
    message: raw.message || null,
  };
}

/**
 * CompatibilityRule — "option A in step X cannot coexist with option B in step Y"
 */
export function normalizeCompatibilityRule(raw) {
  return {
    id: raw.id,
    type: raw.type || 'excludes', // 'excludes' | 'warns'
    stepA: raw.stepA,
    optionA: raw.optionA,
    stepB: raw.stepB,
    optionB: raw.optionB,
    message: raw.message || 'Incompatible combination selected.',
  };
}