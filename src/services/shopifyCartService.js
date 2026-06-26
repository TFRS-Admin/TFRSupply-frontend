/**
 * services/shopifyCartService.js
 * Sprint 10 — Shopify Cart Service Layer (stub/architecture only)
 *
 * UI components import ONLY this file — never the adapter directly.
 * This layer handles payload construction and readiness checks.
 * No Shopify API calls are made here or in Sprint 10.
 *
 * Architecture note:
 * When real Shopify integration is ready, the adapter (shopifyCartAdapter.js)
 * will handle the actual Storefront API calls via a backend proxy.
 * This service remains the single import point for all UI components.
 */

import { buildCartPayload, checkMappingReadiness } from '@/adapters/shopify/shopifyCartAdapter';

/**
 * Checks whether the current configuration state qualifies for cart add.
 * Returns specific, distinguished reasons for each failing condition.
 *
 * Rules:
 *  1. configuration must be complete (no pending required steps)
 *  2. no hard exclusion violations exist
 *  3. Shopify product_id must be set
 *  4. shopify.cart_eligible must be true
 *  5. shopify.storefront_available must be true
 *  6. shopify.variant_mappings must be non-empty
 *
 * @param {object} summary    - from computeSummary (ConfigurationContext)
 * @param {object} shopifyMap - product's shopify block (from product JSON)
 * @returns {{ ready: boolean, reasons: string[], categories: object }}
 */
export function getCartReadiness(summary, shopifyMap) {
  const reasons = [];
  // Track reason categories for precise UI messaging
  const categories = {
    configIncomplete: false,
    hardViolation: false,
    productMappingMissing: false,
    variantMappingMissing: false,
    cartEligibilityDisabled: false,
    storefrontUnavailable: false,
    accessoryMappingMissing: false,
  };

  if (!summary?.isComplete) {
    categories.configIncomplete = true;
    reasons.push('Configuration is not complete.');
  }

  const hardViolations = summary?.violations?.filter(v => v.type === 'excludes') ?? [];
  if (hardViolations.length > 0) {
    categories.hardViolation = true;
    reasons.push(`${hardViolations.length} hard exclusion conflict${hardViolations.length > 1 ? 's' : ''} must be resolved.`);
  }

  const mappingCheck = checkMappingReadiness(shopifyMap);
  if (!mappingCheck.ready) {
    Object.assign(categories, mappingCheck.categories);
    reasons.push(...mappingCheck.reasons);
  }

  return { ready: reasons.length === 0, reasons, categories };
}

/**
 * Builds a structured cart payload from current configuration state.
 * Does NOT submit anything — returns payload for inspection/simulation.
 *
 * Accepts summary directly and normalises fields from the engine's output shape:
 *   summary.resolvedSelections — [{ stepId, stepLabel, selected: string[] }]
 *   summary.accessories        — [{ stepId, stepLabel, optionId, optionLabel, priceModifier }]
 *
 * @param {object} params
 * @param {string} params.productId
 * @param {string} params.configuratorId
 * @param {string} params.skuPreview
 * @param {object} params.summary          - full summary from computeSummary
 * @param {number} params.quantity
 * @param {object} params.shopifyMap       - product's shopify block
 * @returns {object} structured cart payload (see docs/shopify-cart-architecture.md)
 */
export function prepareCartPayload({ productId, configuratorId, skuPreview, summary, quantity = 1, shopifyMap }) {
  // Normalise resolvedSelections → selectedOptions for the adapter
  const selectedOptions = (summary?.resolvedSelections ?? []).map(s => ({
    stepId: s.stepId,
    stepLabel: s.stepLabel,
    // single-select steps: selected is always a 1-element array
    optionLabel: s.selected?.[0] ?? '',
  }));

  // Normalise accessories from engine output
  const accessories = (summary?.accessories ?? []).map(a => ({
    stepId: a.stepId,
    stepLabel: a.stepLabel,
    optionId: a.optionId,
    label: a.optionLabel,
    priceModifier: a.priceModifier,
  }));

  return buildCartPayload({ productId, configuratorId, skuPreview, selectedOptions, accessories, quantity, shopifyMap });
}