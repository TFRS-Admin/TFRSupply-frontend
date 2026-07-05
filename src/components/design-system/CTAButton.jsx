import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * CTAButton — the brand-red / navy-outline call-to-action rendered dozens of
 * times by hand across pages (`background:'#c8102e'`, `border:'2px solid
 * #1a2744'`, etc.). Polymorphic: renders a react-router `<Link>` when `to` is
 * given, a plain `<a>` when `href` is given, otherwise a `<button>`.
 * Always meets the 44px touch-target minimum (Issue #081 goal 10).
 */
export default function CTAButton({
  variant = 'primary',
  size = 'default',
  to,
  href,
  icon: Icon,
  iconPosition = 'trailing',
  className,
  children,
  ...props
}) {
  const base = cn(
    'inline-flex items-center justify-center gap-2 font-bold whitespace-nowrap',
    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ink',
    'disabled:opacity-50 disabled:pointer-events-none',
    size === 'default' ? 'min-h-[44px] px-5 py-2.5 text-sm' : 'min-h-[44px] px-4 py-2 text-xs',
    variant === 'primary' && 'bg-brand text-white hover:bg-brand-hover',
    variant === 'secondary' && 'bg-ink text-white hover:bg-ink-dark',
    variant === 'outline' && 'border-2 border-ink text-ink bg-transparent hover:bg-ink hover:text-white',
    variant === 'ghost' && 'text-ink hover:underline px-1 min-h-[44px]',
    className,
  );

  const content = (
    <>
      {Icon && iconPosition === 'leading' && <Icon size={15} aria-hidden="true" />}
      {children}
      {Icon && iconPosition === 'trailing' && <Icon size={15} aria-hidden="true" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={base} {...props}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={base} {...props}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" className={base} {...props}>
      {content}
    </button>
  );
}
