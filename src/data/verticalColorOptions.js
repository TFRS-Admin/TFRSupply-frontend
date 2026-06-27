/**
 * data/verticalColorOptions.js
 * Vertical-aware color option sets for lightbar configurators.
 * Each entry maps to a `color` step option in the configurator JSON.
 * skuSegment values are illustrative — SKU filtering not wired yet.
 */

export const VERTICAL_COLOR_OPTIONS = {
  police: [
    { id: 'rbw',   label: 'Red / Blue / White', skuSegment: 'RBW' },
    { id: 'bw',    label: 'Blue / White',        skuSegment: 'BW'  },
    { id: 'rb',    label: 'Red / Blue',           skuSegment: 'RB'  },
    { id: 'rba',   label: 'Red / Blue / Amber',   skuSegment: 'RBA' },
    { id: 'ab',    label: 'All Blue',             skuSegment: 'BB'  },
    { id: 'ar',    label: 'All Red',              skuSegment: 'RR'  },
  ],
};

/**
 * Returns overridden color options for a vertical, or null if no override exists.
 * @param {string | null | undefined} verticalId
 * @returns {Array | null}
 */
export function getVerticalColorOptions(verticalId) {
  if (!verticalId) return null;
  return VERTICAL_COLOR_OPTIONS[verticalId.toLowerCase()] ?? null;
}