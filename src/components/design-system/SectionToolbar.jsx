import React from 'react';
import { cn } from '@/lib/utils';

/**
 * SectionToolbar — a consistent right-aligned (wraps to left on mobile) row
 * of links/buttons/filters that sits inside a PageSection or DataPanel
 * header. Pulled out on its own because nearly every section header in the
 * app is `justify-content: space-between` with a title on the left and 1-3
 * actions on the right that currently each re-implement the gap/wrap rules.
 */
export default function SectionToolbar({ children, className, align = 'end' }) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 flex-wrap',
        align === 'end' ? 'justify-end' : 'justify-start',
        className,
      )}
    >
      {children}
    </div>
  );
}
