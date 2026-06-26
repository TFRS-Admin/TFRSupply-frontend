/**
 * domain/configuration/configuratorEngine.js
 * Pure configuration engine. No React, no Base44, no Shopify.
 *
 * All functions are pure: (session, selections) => result.
 * The React context owns state; the engine only computes.
 */

import { createSession, createSelectionState } from './models.js';

// ─── Session Initialization ────────────────────────────────────────────────

export function initializeEngine(configuratorJson) {
  const session = createSession(configuratorJson);
  const selections = createSelectionState();
  return { session, selections };
}

// ─── Selection Management ──────────────────────────────────────────────────

/**
 * Apply a single option selection. Returns a new selections object.
 * Clears forced/dependent downstream state when a parent changes.
 */
export function applySelection(session, selections, stepId, optionId) {
  const step = session.steps.find(s => s.id === stepId);
  if (!step) return selections;

  const next = { ...selections };

  if (step.multiple) {
    const current = Array.isArray(next[stepId]) ? next[stepId] : [];
    if (current.includes(optionId)) {
      next[stepId] = current.filter(id => id !== optionId);
    } else {
      next[stepId] = [...current, optionId];
    }
  } else {
    next[stepId] = optionId;
  }

  return next;
}

/**
 * Clear a single step's selection.
 */
export function clearStep(selections, stepId) {
  const next = { ...selections };
  delete next[stepId];
  return next;
}

// ─── Step Status ───────────────────────────────────────────────────────────

/**
 * Returns true if a step has a non-empty selection.
 */
export function isStepComplete(selections, step) {
  const val = selections[step.id];
  if (val === undefined || val === null) return false;
  if (Array.isArray(val)) return val.length > 0;
  return true;
}

/**
 * Returns the ordered list of required steps that are not yet complete.
 */
export function getPendingRequiredSteps(session, selections) {
  return session.steps.filter(
    step => step.required && !isStepComplete(selections, step)
  );
}

/**
 * Returns the first incomplete required step, or null if all done.
 */
export function getNextRequiredStep(session, selections) {
  return getPendingRequiredSteps(session, selections)[0] || null;
}

// ─── Completion Percentage ─────────────────────────────────────────────────

export function getCompletionPercentage(session, selections) {
  const required = session.steps.filter(s => s.required);
  if (required.length === 0) return 100;
  const done = required.filter(s => isStepComplete(selections, s)).length;
  return Math.round((done / required.length) * 100);
}

// ─── Dependency Evaluation ─────────────────────────────────────────────────

/**
 * Returns active dependency rules given current selections.
 * A rule is active when its `ifStep`/`ifOption` condition is met.
 */
export function getActiveDependencies(session, selections) {
  return session.dependencyRules.filter(rule => {
    const val = selections[rule.ifStep];
    if (Array.isArray(val)) return val.includes(rule.ifOption);
    return val === rule.ifOption;
  });
}

/**
 * Returns steps that are currently required due to active dependency rules.
 * These are steps not natively required but forced by a dependency.
 */
export function getDependencyRequiredSteps(session, selections) {
  const active = getActiveDependencies(session, selections);
  return active
    .filter(r => r.type === 'requires')
    .map(r => ({ stepId: r.thenStep, message: r.message, ruleId: r.id }));
}

// ─── Compatibility / Exclusion Evaluation ─────────────────────────────────

/**
 * Returns all active compatibility violations.
 * Each violation: { type, message, ruleId }
 */
export function getCompatibilityViolations(session, selections) {
  return session.compatibilityRules
    .filter(rule => {
      const valA = selections[rule.stepA];
      const valB = selections[rule.stepB];
      const matchA = Array.isArray(valA) ? valA.includes(rule.optionA) : valA === rule.optionA;
      const matchB = Array.isArray(valB) ? valB.includes(rule.optionB) : valB === rule.optionB;
      return matchA && matchB;
    })
    .map(rule => ({ type: rule.type, message: rule.message, ruleId: rule.id }));
}

// ─── SKU Generation ────────────────────────────────────────────────────────

/**
 * Generates a preliminary SKU string from the skuTemplate and selections.
 *
 * Template tokens use the step's `skuSegmentKey` wrapped in braces: {vehicle}, {color}, etc.
 * If a token is unresolved (step not selected), it outputs "???".
 *
 * PROTOTYPE: This is a simplified string interpolation approach.
 * Production: will map to real Shopify variant IDs via shopifyMapping.
 */
export function generateSkuPreview(session, selections) {
  if (!session.skuTemplate) return null;

  let sku = session.skuTemplate;

  session.steps.forEach(step => {
    const key = `{${step.skuSegmentKey}}`;
    if (!sku.includes(key)) return;

    const val = selections[step.id];
    if (!val || (Array.isArray(val) && val.length === 0)) {
      sku = sku.replace(key, '???');
      return;
    }

    const optionId = Array.isArray(val) ? val[0] : val;
    const option = step.options.find(o => o.id === optionId);
    sku = sku.replace(key, option ? option.skuSegment : '???');
  });

  return sku;
}

// ─── Summary Computation ───────────────────────────────────────────────────

/**
 * Compute the full summary object consumed by the React context and UI.
 */
export function computeSummary(session, selections) {
  const violations = getCompatibilityViolations(session, selections);
  const depRequirements = getDependencyRequiredSteps(session, selections);
  const completion = getCompletionPercentage(session, selections);
  const skuPreview = generateSkuPreview(session, selections);
  const nextStep = getNextRequiredStep(session, selections);
  const isComplete = completion === 100 && violations.filter(v => v.type === 'excludes').length === 0;

  // Build per-step resolved selection labels for display
  const resolvedSelections = session.steps
    .filter(s => isStepComplete(selections, s))
    .map(step => {
      const val = selections[step.id];
      const ids = Array.isArray(val) ? val : [val];
      const labels = ids.map(id => step.options.find(o => o.id === id)?.label || id);
      return { stepId: step.id, stepLabel: step.label, selected: labels };
    });

  return {
    resolvedSelections,
    depRequirements,
    violations,
    completion,
    skuPreview,
    nextStep,
    isComplete,
    priceDisplay: session.priceDisplay,
  };
}