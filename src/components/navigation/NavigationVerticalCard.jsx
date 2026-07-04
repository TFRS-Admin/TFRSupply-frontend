import React from 'react';
import { useCatalogVertical } from '@/hooks/useCatalog';
import NavigationImagePanel from './NavigationImagePanel';
import NavigationCategoryList from './NavigationCategoryList';
import NavigationFeaturedProducts from './NavigationFeaturedProducts';

/**
 * Full content panel for one nav vertical: image/title/description/CTA on
 * the left, browse-categories + featured-products on the right. Used by
 * both the desktop mega menu dropdown and the mobile drawer's expanded
 * accordion section.
 *
 * Category/product data comes live from useCatalogVertical() when the
 * vertical has catalog JSON; verticals without data yet (path: null) fall
 * back to the image/title/description-only "Coming Soon" state.
 */
export default function NavigationVerticalCard({ vertical, layout = 'row', onNavigate }) {
  const comingSoon = !vertical.path;
  const { data: catalogVertical } = useCatalogVertical(comingSoon ? null : vertical.id);
  const categories = catalogVertical?.categories_section?.items || [];
  const products = catalogVertical?.featured_products_section?.items || [];

  const isRow = layout === 'row';

  return (
    <div className={isRow ? 'grid grid-cols-[240px_1fr] gap-8' : 'flex flex-col gap-6'}>
      <NavigationImagePanel
        image={vertical.image}
        imageAlt={vertical.imageAlt}
        tagline={vertical.tagline}
        description={vertical.description}
        ctaHref={vertical.path}
        comingSoon={comingSoon}
      />

      {!comingSoon && (categories.length > 0 || products.length > 0) && (
        <div className={isRow ? 'grid grid-cols-2 gap-8' : 'flex flex-col gap-6'}>
          <NavigationCategoryList categories={categories} verticalId={vertical.id} onNavigate={onNavigate} />
          <NavigationFeaturedProducts products={products} onNavigate={onNavigate} />
        </div>
      )}
    </div>
  );
}
