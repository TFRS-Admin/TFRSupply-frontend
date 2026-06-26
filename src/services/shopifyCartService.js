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
 *
 * Rules:
 *  1. configuration must be complete (no pending required steps)
 *  2. no hard exclusion violations exist
 *  3. Shopify product mapping must be ready (product_id + variant_mappings populated)
 *  4. product must be marked cart_eligible in its JSON
 *
 * @param {object} summary    - from computeSummary (ConfigurationContext)
 * @param {object} shopifyMap - product's shopify block (from product JSON)
 * @returns {{ ready: boolean, reasons: string[] }}
 */
export function getCartReadiness(summary, shopifyMap) {
  const reasons = [];

  if (!summary?.isComplete) {
    reasons.push('Configuration is not complete.');
  }

  const hardViolations = summary?.violations?.filter(v => v.type === 'excludes') ?? [];
  if (hardViolations.length > 0) {
    reasons.push(`${hardViolations.length} hard exclusion conflict${hardViolations.length > 1 ? 's' : ''} must be resolved.`);
  }

  const mappingReady = checkMappingReadiness(shopifyMap);
  if (!mappingReady.ready) {
    reasons.push(...mappingReady.reasons);
  }

  if (!shopifyMap?.cart_eligible) {
    reasons.push('Shopify cart mapping incomplete.');
  }

  return { ready: reasons.length === 0, reasons };
}

/**
 * Builds a structured cart payload from current configuration state.
 * Does NOT submit anything — returns payload for inspection/simulation.
 *
 * @param {object} params
 * @param {string} params.productId
 * @param {string} params.configuratorId
 * @param {string} params.skuPreview
 * @param {Array}  params.selectedOptions  - [{ stepId, stepLabel, optionId, optionLabel, skuSegment }]
 * @param {Array}  params.accessories      - [{ id, label, sku, quantity }]
 * @param {number} params.quantity
 * @param {object} params.shopifyMap       - product's shopify block
 * @returns {object} structured cart payload (see docs/shopify-cart-architecture.md)
 */
export function prepareCartPayload(params) {
  return buildCartPayload(params);
}