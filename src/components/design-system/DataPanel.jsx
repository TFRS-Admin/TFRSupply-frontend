import React from 'react';
import { cn } from '@/lib/utils';

// Horizontal padding is shared by header/body/footer; vertical padding is
// applied per-slot below so a header's bottom edge and the body's top edge
// never fight over the same CSS property.
const PADDING_X = {
  none: '',
  compact: 'px-4',
  default: 'px-5 sm:px-6',
};
const PADDING_TOP = {
  none: '',
  compact: 'pt-4',
  default: 'pt-5 sm:pt-6',
};
const PADDING_BOTTOM = {
  none: '',
  compact: 'pb-4',
  default: 'pb-5 sm:pb-6',
};

/**
 * DataPanel — the one bordered-white-card shell every page currently
 * hand-rolls as `style={{background:'#fff',border:'1px solid
 * #e5e7eb',borderRadius:4,padding:'18px 20px'}}`. Standardizes padding,
 * radius, shadow, header spacing, and footer spacing (Issue #081 goal 3).
 *
 * `title`/`icon`/`actions` render a header row automatically; omit them and
 * just pass `children` for a plain panel. `footer` renders below a divider.
 */
export default function DataPanel({
  title,
  icon: Icon,
  actions,
  footer,
  padding = 'default',
  interactive = false,
  selected = false,
  className,
  headerClassName,
  bodyClassName,
  children,
  ...props
}) {
  const hasHeader = Boolean(title || icon || actions);

  return (
    <div
      className={cn(
        'rounded-lg border bg-white shadow-sm flex flex-col min-w-0',
        selected ? 'border-ink ring-1 ring-ink' : 'border-gray-200',
        interactive && 'transition-shadow hover:shadow-md',
        className,
      )}
      {...props}
    >
      {hasHeader && (
        <div className={cn('flex items-center justify-between gap-3 flex-wrap border-b border-gray-100 pb-3', PADDING_X[padding], PADDING_TOP[padding], headerClassName)}>
          <div className="flex items-center gap-2 min-w-0">
            {Icon && <Icon size={15} className="text-ink shrink-0" aria-hidden="true" />}
            {typeof title === 'string' ? (
              <p className="font-bold text-[13px] tracking-wide uppercase text-ink truncate">{title}</p>
            ) : title}
          </div>
          {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
        </div>
      )}

      <div className={cn(PADDING_X[padding], PADDING_BOTTOM[padding], hasHeader ? 'pt-4' : PADDING_TOP[padding], 'flex-1 min-w-0', bodyClassName)}>
        {children}
      </div>

      {footer && (
        <div className={cn('border-t border-gray-100 pt-3', PADDING_X[padding], PADDING_BOTTOM[padding])}>
          {footer}
        </div>
      )}
    </div>
  );
}
