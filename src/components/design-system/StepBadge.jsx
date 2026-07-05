import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * StepBadge — a numbered circle for stepper/wizard UIs (Guided Upfit
 * Builder's mobile progress, any future numbered-step explainer), with
 * current/complete/upcoming states. Pair with `of` to render the
 * "Step N of Total" caption inline.
 */
export default function StepBadge({ step, of, label, status = 'upcoming', className }) {
  const isComplete = status === 'complete' || status === 'completed';
  const isCurrent = status === 'current';

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          'flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold shrink-0',
          isComplete && 'bg-green-600 text-white',
          isCurrent && 'bg-ink text-white',
          !isComplete && !isCurrent && 'bg-gray-100 text-gray-500',
        )}
      >
        {isComplete ? <Check size={13} /> : step}
      </span>
      {(label || of) && (
        <span className="text-xs font-bold text-gray-500 whitespace-nowrap">
          {label ?? (of ? `Step ${step} of ${of}` : null)}
        </span>
      )}
    </div>
  );
}
