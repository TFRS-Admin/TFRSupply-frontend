import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TONE_DOT_CLASSES, resolveTone } from './tokens';

/**
 * Timeline — a vertical list of steps with a connecting line and a
 * status-colored dot per step (colors resolved through the same
 * STATUS_TONE map as StatusBadge, so a "complete" timeline step and a
 * "Complete" badge always agree on green). For guided, sequential flows —
 * order history, quote lifecycle, a build's step-by-step progress.
 */
export default function Timeline({ steps = [], className }) {
  return (
    <ol className={cn('flex flex-col', className)}>
      {steps.map((step, index) => {
        const tone = resolveTone(step.status, step.tone);
        const isLast = index === steps.length - 1;
        return (
          <li key={step.id ?? index} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={cn('flex items-center justify-center h-6 w-6 rounded-full shrink-0 text-white', TONE_DOT_CLASSES[tone])}>
                {step.status === 'complete' || step.status === 'completed' ? <Check size={13} /> : <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
              {!isLast && <span className="w-px flex-1 bg-gray-200 my-1" aria-hidden="true" />}
            </div>
            <div className={cn('min-w-0', !isLast && 'pb-5')}>
              <p className="text-sm font-bold text-ink">{step.label}</p>
              {step.description && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{step.description}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
