import React from 'react';
import { cn } from '@/lib/utils';
import SiteHeader from '@/components/navigator/SiteHeader';
import PrototypeBanner from '@/components/PrototypeBanner';
import PrototypeFooter from '@/components/PrototypeFooter';
import ProductBreadcrumb from '@/components/product/ProductBreadcrumb';
import { FONT_STACK } from './tokens';

/**
 * PageLayout — the standard page shell (Issue #081 goal 2): banner + site
 * header + breadcrumb + a max-width content column + footer. Every major
 * page already assembles these five pieces by hand in the same order; this
 * just gives that shape one name so it can't drift.
 *
 * `background`: 'subtle' (#f4f5f7, the dashboard-style pages — Workspace,
 * Quote, Procurement, Guided Builder) or 'white' (catalog-style pages —
 * Product Detail, Search, Homepage).
 */
export default function PageLayout({
  crumbs,
  activeVertical,
  activeCategory,
  background = 'subtle',
  contentClassName,
  maxWidth = 'max-w-7xl',
  fullBleed = false,
  beforeContent,
  children,
}) {
  return (
    <div
      className={cn('min-h-screen', background === 'white' ? 'bg-white text-gray-900' : 'bg-[#f4f5f7]')}
      style={{ fontFamily: FONT_STACK }}
    >
      <PrototypeBanner />
      <SiteHeader activeVertical={activeVertical} activeCategory={activeCategory} />
      {crumbs && <ProductBreadcrumb crumbs={crumbs} />}
      {beforeContent}

      {fullBleed ? children : (
        <div className={cn(maxWidth, 'mx-auto px-4 sm:px-6 py-8 sm:py-10', contentClassName)}>
          {children}
        </div>
      )}

      <PrototypeFooter />
    </div>
  );
}
