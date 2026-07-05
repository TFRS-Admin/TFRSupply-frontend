import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import StatusBadge from './StatusBadge';

/**
 * ActionCard — a whole-card navigation/action tile with a consistent hover
 * state, an optional status badge, and a disabled/"coming soon" state.
 * Renders a `<Link>` when `to` is given, an `<a>` when `href` is given,
 * otherwise a `<button>` (or a plain non-interactive `<div>` when
 * `disabled`).
 */
export default function ActionCard({
  icon: Icon,
  image,
  imageAlt = '',
  title,
  description,
  badge,
  to,
  href,
  onClick,
  disabled = false,
  disabledLabel = 'Coming Soon',
  className,
}) {
  const body = (
    <>
      {image && (
        <div className="relative h-32 -m-5 mb-4 overflow-hidden rounded-t-lg bg-gray-100">
          <img src={image} alt={imageAlt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {disabled && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
              <span className="text-[10px] font-bold text-gray-600 bg-white px-2 py-1 rounded">{disabledLabel}</span>
            </div>
          )}
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {Icon && <Icon size={20} className="text-brand mb-2" aria-hidden="true" />}
          <p className="font-black text-sm text-ink truncate">{title}</p>
          {description && <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{description}</p>}
        </div>
        {!disabled && !image && <ArrowRight size={16} className="text-gray-300 group-hover:text-brand transition-colors shrink-0 mt-1" aria-hidden="true" />}
      </div>
      {badge && <div className="mt-3">{typeof badge === 'string' ? <StatusBadge status={badge} compact /> : badge}</div>}
    </>
  );

  const sharedClassName = cn(
    'group block rounded-lg border p-5 min-w-0 text-left min-h-[44px]',
    disabled
      ? 'border-gray-100 opacity-60 cursor-default'
      : 'border-gray-200 bg-white hover:border-brand hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ink',
    className,
  );

  if (disabled) {
    return <div className={sharedClassName}>{body}</div>;
  }
  if (to) {
    return <Link to={to} className={sharedClassName}>{body}</Link>;
  }
  if (href) {
    return <a href={href} className={sharedClassName}>{body}</a>;
  }
  return (
    <button type="button" onClick={onClick} className={cn(sharedClassName, 'w-full')}>
      {body}
    </button>
  );
}
