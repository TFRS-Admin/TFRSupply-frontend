import React from 'react';
import { cn } from '@/lib/utils';

/**
 * StickySidebar — sticks its children under the sticky SiteHeader on
 * desktop (`lg` and above); static everywhere else so it never traps mobile
 * scroll inside a short viewport. `topClassName` lets a page tune the offset
 * if its header is a different height.
 */
export default function StickySidebar({ children, topClassName = 'lg:top-24', className }) {
  return (
    <div className={cn('lg:sticky lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto', topClassName, className)}>
      {children}
    </div>
  );
}
