import React from 'react';
import { cn } from '@/lib/utils';

/**
 * PageSection — a titled, evenly-spaced content block (Issue #081 goal 2's
 * "Main Content / Supporting Panels / Related Information" tiers). Replaces
 * the repeated `<section style={{marginBottom:32}}><div style={{display:
 * 'flex',justifyContent:'space-between'...}}>` header pattern.
 *
 * `title` renders as the small-caps eyebrow label used throughout the app
 * (icon + uppercase text); pass a node instead of a string to render
 * something custom. `toolbar` is the right-aligned action row (wrap in
 * SectionToolbar for multiple items).
 */
export default function PageSection({
  icon: Icon,
  title,
  description,
  toolbar,
  spacing = 'default',
  className,
  bodyClassName,
  children,
  ...props
}) {
  const hasHeader = Boolean(title || toolbar);

  return (
    <section className={cn(spacing === 'default' ? 'mb-8 sm:mb-10' : 'mb-4', className)} {...props}>
      {hasHeader && (
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          {title && (
            typeof title === 'string' ? (
              <p className="flex items-center gap-2 text-[13px] font-bold tracking-wide uppercase text-ink m-0">
                {Icon && <Icon size={14} aria-hidden="true" />}
                {title}
              </p>
            ) : title
          )}
          {toolbar}
        </div>
      )}
      {description && <p className="text-sm text-gray-600 leading-relaxed mb-4 max-w-2xl">{description}</p>}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
