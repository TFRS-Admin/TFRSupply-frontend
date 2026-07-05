import React from 'react';
import { cn } from '@/lib/utils';
import { TONE_RING_CLASSES, resolveTone } from './tokens';

/**
 * ProgressRing — a compact circular progress indicator (percent complete)
 * for dashboard tiles — e.g. a Fleet Build's overall completion, where
 * FleetBuildCompletionBadge's linear bar takes too much horizontal space.
 * Color resolves through the same STATUS_TONE map as StatusBadge (pass
 * `tone` to override the percent-based default).
 */
export default function ProgressRing({ percent = 0, size = 56, strokeWidth = 5, label, tone, className }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const resolvedTone = tone
    ? resolveTone(null, tone)
    : resolveTone(clamped >= 100 ? 'complete' : clamped > 0 ? 'in_progress' : 'missing');

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-gray-200" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn('transition-[stroke-dashoffset] duration-300', TONE_RING_CLASSES[resolvedTone])}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-ink">
        {label ?? `${Math.round(clamped)}%`}
      </span>
    </div>
  );
}
