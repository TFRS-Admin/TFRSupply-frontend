import React from 'react';
import { cn } from '@/lib/utils';

const WIDTH_CLASSES = {
  narrow: 'lg:w-[260px]',
  default: 'lg:w-[320px]',
  wide: 'lg:w-[380px]',
};

/**
 * SplitPanel — the "main content + supporting sidebar" responsive layout
 * used by Product Detail, the Guided Upfit Builder, and any future two-pane
 * page. Side-by-side at `lg` and above; stacked (sidebar below main) on
 * tablet/mobile. Wrap `sidebar` in StickySidebar for sticky desktop
 * positioning.
 */
export default function SplitPanel({
  main,
  sidebar,
  sidebarPosition = 'right',
  sidebarWidth = 'default',
  gap = 'gap-6',
  className,
}) {
  const sidebarEl = <div className={cn('min-w-0 w-full', WIDTH_CLASSES[sidebarWidth], 'shrink-0')}>{sidebar}</div>;
  const mainEl = <div className="min-w-0 flex-1">{main}</div>;

  return (
    <div className={cn('flex flex-col lg:flex-row items-start', gap, className)}>
      {sidebarPosition === 'left' ? (
        <>
          {sidebarEl}
          {mainEl}
        </>
      ) : (
        <>
          {mainEl}
          {sidebarEl}
        </>
      )}
    </div>
  );
}
