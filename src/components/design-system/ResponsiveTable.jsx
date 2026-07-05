import React from 'react';
import { cn } from '@/lib/utils';

/**
 * ResponsiveTable — the one reusable table for Project Quote, Procurement,
 * Workspace summaries, and Fleet summaries (Issue #081 goal 6). Renders a
 * real `<table>` on desktop/tablet (`md` and up) and stacked label/value
 * cards on mobile, from the same `columns`/`rows` data so a table never has
 * to be hand-duplicated into a second mobile layout again.
 *
 * `columns`: `[{ key, label, align, render(row), hideOnMobile, headerClassName, cellClassName }]`
 * `rowKey(row, index)` defaults to `row.id ?? index`.
 */
export default function ResponsiveTable({
  columns,
  rows,
  rowKey,
  emptyState,
  className,
  stickyHeader = false,
  getRowProps,
  mobileTitle,
}) {
  if (!rows || rows.length === 0) {
    return emptyState ?? null;
  }

  function keyFor(row, index) {
    return rowKey ? rowKey(row, index) : (row.id ?? index);
  }

  return (
    <div className={className}>
      {/* Desktop / tablet: real table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-[11px] font-bold tracking-wide uppercase text-gray-500 bg-gray-50 border-b border-gray-200',
                    column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left',
                    stickyHeader && 'sticky top-0 z-10',
                    column.headerClassName,
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const rowProps = getRowProps ? getRowProps(row, index) : {};
              return (
                <tr key={keyFor(row, index)} {...rowProps} className={cn('border-b border-gray-100 last:border-0 even:bg-gray-50/40', rowProps.className)}>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'px-4 py-3 text-gray-800 align-middle',
                        column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left',
                        column.cellClassName,
                      )}
                    >
                      {column.render ? column.render(row, index) : row[column.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards, one per row */}
      <div className="md:hidden flex flex-col gap-3">
        {rows.map((row, index) => (
          <div key={keyFor(row, index)} className="rounded-lg border border-gray-200 bg-white p-4">
            {mobileTitle && <p className="font-bold text-sm text-ink mb-2">{mobileTitle(row, index)}</p>}
            <dl className="flex flex-col gap-2">
              {columns.filter((column) => !column.hideOnMobile).map((column) => (
                <div key={column.key} className="flex items-baseline justify-between gap-3">
                  <dt className="text-[11px] font-bold tracking-wide uppercase text-gray-500 shrink-0">{column.label}</dt>
                  <dd className="text-sm text-gray-800 text-right m-0 min-w-0">{column.render ? column.render(row, index) : row[column.key]}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
