import React from 'react';
import { cn } from '@/lib/utils';

/**
 * PropertyGrid — a responsive label/value list. Replaces ad hoc
 * specification `<table>`s and `<dl>`s (Product Detail specifications,
 * Compare page's mobile rows, vehicle/project summaries): 2 columns on
 * desktop, 1 column on mobile, zebra-striped rows.
 *
 * `items`: `[{ label, value, span? }]` — `span: 'full'` makes a row take
 * both columns (e.g. a long spec list).
 */
export default function PropertyGrid({ items = [], columns = 2, className }) {
  return (
    <dl className={cn('grid grid-cols-1', columns === 2 && 'sm:grid-cols-2', className)}>
      {items.map((item, index) => (
        <div
          key={item.label ?? index}
          className={cn(
            'px-4 py-3 border-b border-gray-100',
            index % 2 === 0 ? 'bg-gray-50/60' : 'bg-white',
            item.span === 'full' && columns === 2 && 'sm:col-span-2',
          )}
        >
          <dt className="text-[11px] font-bold tracking-wide uppercase text-gray-500 mb-1">{item.label}</dt>
          <dd className="text-sm text-gray-800 leading-relaxed m-0">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
