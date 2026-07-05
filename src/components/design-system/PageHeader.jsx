import React from 'react';
import { cn } from '@/lib/utils';

/**
 * PageHeader — the Header step of the standard page hierarchy (Issue #081
 * goal 2: Header → Summary → Primary Actions → Main Content → Supporting
 * Panels → Related Information). Renders an eyebrow, an `<h1>`, a
 * description, and a wrapped row of primary actions.
 *
 * `children` renders below the description and above actions — use it for a
 * page-level "Summary" strip (e.g. a row of StatCards) so the whole
 * hierarchy can be expressed with PageHeader + PageSection alone.
 */
export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}) {
  return (
    <div className={cn('mb-6 sm:mb-8', className)}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-xs font-bold tracking-widest uppercase text-brand mb-2">{eyebrow}</p>
          )}
          <h1 className="font-black text-ink leading-tight" style={{ fontSize: 'clamp(1.5rem,3vw,2rem)' }}>
            {title}
          </h1>
          {description && (
            <p className="text-sm text-gray-600 leading-relaxed max-w-2xl mt-1.5">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3 flex-wrap shrink-0">{actions}</div>}
      </div>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
