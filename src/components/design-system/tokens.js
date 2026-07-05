/**
 * design-system/tokens.js — shared constants for the Design System
 * Foundation (docs/architecture/DESIGN_SYSTEM.md). Every storefront page
 * already renders the same brand font stack and the same red/green/amber/
 * slate status colors by hand in dozens of places; this file is the one
 * place that vocabulary is spelled out so primitives (and any page that
 * still needs an inline style) stay in sync.
 */

// Matches every existing `const FS = { fontFamily: "'Roboto','Inter',sans-serif" }`
// across src/pages and src/components — kept as a literal export (rather than
// switching call sites to the `font-body` Tailwind utility) so this is a
// zero-risk, purely-additive de-duplication.
export const FONT_STACK = "'Roboto','Inter',sans-serif";
export const FS = { fontFamily: FONT_STACK };

// The five tones every status/readiness/completion badge in the app already
// reduces to. Tailwind's default palette already matches the hex values the
// hand-rolled badges used (e.g. green-100 #dcfce7, amber-800 #92400e,
// red-100 #fee2e2), so no custom color tokens are needed for these.
export const TONES = ['success', 'warning', 'danger', 'info', 'neutral'];

export const TONE_CLASSES = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-indigo-100 text-indigo-800',
  neutral: 'bg-slate-100 text-slate-700',
};

export const TONE_DOT_CLASSES = {
  success: 'bg-green-600',
  warning: 'bg-amber-600',
  danger: 'bg-red-600',
  info: 'bg-indigo-600',
  neutral: 'bg-slate-400',
};

export const TONE_BAR_CLASSES = {
  success: 'bg-green-600',
  warning: 'bg-amber-600',
  danger: 'bg-red-600',
  info: 'bg-indigo-600',
  neutral: 'bg-slate-400',
};

export const TONE_RING_CLASSES = {
  success: 'stroke-green-600',
  warning: 'stroke-amber-600',
  danger: 'stroke-red-600',
  info: 'stroke-indigo-600',
  neutral: 'stroke-slate-400',
};

/**
 * The unified status vocabulary (Issue #081 goal 7). Every page that shows a
 * status word should resolve it through this map instead of inventing its
 * own color. Unrecognized statuses fall back to `neutral`, never throw.
 */
export const STATUS_TONE = {
  // Positive / done
  complete: 'success',
  completed: 'success',
  done: 'success',
  ready: 'success',
  compatible: 'success',
  operational: 'success',
  active: 'success',
  approved: 'success',

  // In progress / informational
  in_progress: 'info',
  pending: 'info',
  needs_review: 'info',
  review: 'info',

  // Needs attention
  needs_attention: 'warning',
  recommended: 'warning',
  incomplete: 'warning',
  minor_issues: 'warning',
  draft_review: 'warning',

  // Blocking / negative
  required: 'danger',
  missing: 'danger',
  incompatible: 'danger',
  blocked: 'danger',
  unavailable: 'danger',
  error: 'danger',

  // Neutral / inactive
  optional: 'neutral',
  archived: 'neutral',
  draft: 'neutral',
  unassigned: 'neutral',
  disabled: 'neutral',
};

export function humanizeStatus(status) {
  if (!status) return '';
  return String(status)
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function resolveTone(status, toneOverride) {
  if (toneOverride && TONES.includes(toneOverride)) return toneOverride;
  return STATUS_TONE[status] ?? 'neutral';
}
