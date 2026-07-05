import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * StatCard — a compact KPI tile: icon/label header, one prominent value, an
 * optional caption. Used for the small summary tiles that currently litter
 * Workspace (cart summary, selected vehicle, compare queue count) as one-off
 * bordered divs. Renders as a `<Link>` when `to` is passed.
 */
export default function StatCard({ icon: Icon, label, value, caption, tone, to, className }) {
  const Wrapper = to ? Link : 'div';
  const wrapperProps = to ? { to } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-4 sm:p-5 flex flex-col min-w-0',
        to && 'transition-shadow hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-center gap-2 mb-2 text-gray-500">
        {Icon && <Icon size={14} aria-hidden="true" />}
        <p className="text-[11px] font-bold tracking-wide uppercase m-0 truncate">{label}</p>
      </div>
      <p className={cn('text-xl font-extrabold text-ink truncate', tone === 'danger' && 'text-red-700', tone === 'success' && 'text-green-700')}>
        {value}
      </p>
      {caption && <p className="text-xs text-gray-500 mt-1 leading-snug">{caption}</p>}
    </Wrapper>
  );
}
