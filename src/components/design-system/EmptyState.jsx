import React from 'react';
import { cn } from '@/lib/utils';
import CTAButton from './CTAButton';

/**
 * EmptyState — icon + headline + description + primary/secondary CTA
 * (Issue #081 goal 8). Every empty state in the app (Workspace, Saved
 * Products, Compare, Recently Viewed, Procurement, Quotes, Fleet Builds,
 * Templates) should render through this instead of a one-off `<p>`.
 *
 * `primaryAction`/`secondaryAction` shape: `{ label, to?, href?, onClick?,
 * icon? }` — passed straight through to CTAButton, so any of Link/anchor/
 * button works.
 */
export default function EmptyState({
  icon: Icon,
  title,
  headingLevel: Heading = 'h2',
  description,
  primaryAction,
  secondaryAction,
  size = 'default',
  className,
  children,
  ...rest
}) {
  const compact = size === 'compact';

  return (
    <div
      className={cn(
        'flex flex-col items-center text-center rounded-lg border border-gray-200 bg-white',
        compact ? 'px-5 py-8' : 'px-6 py-14 sm:py-16',
        className,
      )}
      {...rest}
    >
      {Icon && (
        <div className={cn('flex items-center justify-center rounded-full bg-red-50 mb-4', compact ? 'h-10 w-10' : 'h-14 w-14')}>
          <Icon size={compact ? 18 : 24} className="text-brand" aria-hidden="true" />
        </div>
      )}
      {title && (
        <Heading className={cn('font-extrabold text-ink', compact ? 'text-base mb-1.5' : 'text-xl sm:text-2xl mb-2')}>
          {title}
        </Heading>
      )}
      {description && (
        <p className={cn('text-gray-500 leading-relaxed', compact ? 'text-[13px] max-w-sm' : 'text-sm max-w-md', 'mb-6')}>
          {description}
        </p>
      )}
      {children}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {primaryAction && (
            <CTAButton
              variant="primary"
              to={primaryAction.to}
              href={primaryAction.href}
              onClick={primaryAction.onClick}
              icon={primaryAction.icon}
              data-testid={primaryAction.testId}
            >
              {primaryAction.label}
            </CTAButton>
          )}
          {secondaryAction && (
            <CTAButton
              variant="outline"
              to={secondaryAction.to}
              href={secondaryAction.href}
              onClick={secondaryAction.onClick}
              icon={secondaryAction.icon}
              data-testid={secondaryAction.testId}
            >
              {secondaryAction.label}
            </CTAButton>
          )}
        </div>
      )}
    </div>
  );
}
