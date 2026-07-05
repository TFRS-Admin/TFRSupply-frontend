import React from 'react';
import { cn } from '@/lib/utils';
import { TONE_CLASSES, TONE_DOT_CLASSES, humanizeStatus, resolveTone } from './tokens';

/**
 * StatusBadge — the one unified status pill for the whole app (Issue #081
 * goal 7: Complete/In Progress/Needs Attention/Recommended/Required/
 * Optional/Missing/Compatible/Incompatible/Archived/Draft, etc.).
 *
 * Resolves a color automatically from `status` via STATUS_TONE
 * (design-system/tokens.js) — pass `tone` explicitly only to override it.
 * `label` overrides the auto-humanized text (e.g. "needs_attention" →
 * "Needs Attention") when the call site already has a display label (most
 * existing readiness/completion objects do).
 */
export default function StatusBadge({
  status,
  label,
  tone,
  compact = false,
  dot = false,
  className,
  ...rest
}) {
  const resolvedTone = resolveTone(status, tone);
  const text = label ?? humanizeStatus(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-bold whitespace-nowrap',
        compact ? 'text-[11px] px-2 py-0.5' : 'text-xs px-3 py-1',
        TONE_CLASSES[resolvedTone],
        className,
      )}
      data-status={status}
      data-tone={resolvedTone}
      {...rest}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', TONE_DOT_CLASSES[resolvedTone])} />}
      {text}
    </span>
  );
}
