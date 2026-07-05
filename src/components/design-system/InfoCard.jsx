import React from 'react';
import { cn } from '@/lib/utils';

/**
 * InfoCard — icon + title + description, no interaction. Used for
 * explanatory tiles (homepage "Why TFR Supply" trust points, workspace
 * shortcut cards that aren't clickable as a whole). For a clickable variant
 * see ActionCard.
 */
export default function InfoCard({ icon: Icon, title, description, tone = 'light', className, children }) {
  const dark = tone === 'dark';

  return (
    <div
      className={cn(
        'rounded-lg border p-5 min-w-0',
        dark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white',
        className,
      )}
    >
      {Icon && <Icon size={24} className={cn('mb-3', dark ? 'text-red-400' : 'text-brand')} aria-hidden="true" />}
      {title && <p className={cn('font-black text-sm mb-1.5', dark ? 'text-white' : 'text-ink')}>{title}</p>}
      {description && (
        <p className={cn('text-xs leading-relaxed', dark ? 'text-gray-400' : 'text-gray-500')}>{description}</p>
      )}
      {children}
    </div>
  );
}
