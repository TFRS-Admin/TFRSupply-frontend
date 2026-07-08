import React from 'react';
import { Link } from 'react-router-dom';
import CompareToggleButton from '@/components/product/CompareToggleButton';
import SaveForLaterButton from '@/components/product/SaveForLaterButton';
import AddToAllCompatibleBuildsButton from '@/components/fleetBuilds/AddToAllCompatibleBuildsButton';
import { getDisplayPricing, formatCurrency } from '@/lib/pricing';

/**
 * Shared product discovery card. Accepts a display-ready view model rather
 * than a raw Product/CategoryProductCard so it can render results from both
 * catalogService.searchProducts() and the denormalized category product
 * cards without either caller reshaping its data to match the other.
 *
 * `product` (the full catalog Product, optional) only powers the Add to All
 * Compatible Builds overlay — callers rendering denormalized category cards
 * with no full Product record simply omit it and the overlay stays absent,
 * matching how Compare/Save already tolerate an unresolvable product.
 */
export default function ProductCard({ id, href, label, image, imageAlt, tagline, specs = [], badges = [], product = null, price = null, compareAtPrice = null, category = null }) {
  const pricing = getDisplayPricing(compareAtPrice, price, category);
  const content = (
    <div className="pd-card group relative flex h-full flex-col overflow-hidden rounded-md border border-gray-200 bg-white transition-all duration-150 hover:-translate-y-1 hover:border-[#c8102e] hover:shadow-md">
      {href && <SaveForLaterButton productId={id} variant="icon" />}
      {href && <CompareToggleButton productId={id} variant="icon" />}
      {href && product && <AddToAllCompatibleBuildsButton product={product} variant="icon" />}
      {image && <img src={image} alt={imageAlt || label} className="h-[180px] w-full object-cover" />}
      <div className="flex flex-1 flex-col p-4">
        <p className="font-heading mb-1 text-base font-bold uppercase leading-tight tracking-tight text-[#0f0f0f]">{label}</p>
        {tagline && <p className="font-body mb-2 text-xs font-medium text-[#8a6d00]">{tagline}</p>}
        {specs.length > 0 && (
          <ul className="font-body flex-1 list-disc pl-4 text-xs leading-relaxed text-gray-600">
            {specs.map((spec) => <li key={spec}>{spec}</li>)}
          </ul>
        )}
        {badges.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {badges.map((badge) => (
              <span key={badge} className="font-body bg-[#f0f4ff] px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-[#1a2744]">{badge}</span>
            ))}
          </div>
        )}
        {pricing.displayPrice != null && (
          <div className="mt-2 flex items-baseline gap-2">
            {pricing.hasDiscount && pricing.msrp != null && (
              <span className="font-body text-xs text-gray-400 line-through">{formatCurrency(pricing.msrp)}</span>
            )}
            <span className="font-body text-sm font-bold text-amber-600">{formatCurrency(pricing.displayPrice)}</span>
          </div>
        )}
        <div className="mt-3 border-t border-gray-100 pt-3">
          {href ? (
            <span className="pd-card-cta font-heading inline-flex items-center gap-1.5 rounded-sm bg-[#c8102e] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white transition-colors duration-150 group-hover:bg-[#a50d25]">
              VIEW DETAILS <span aria-hidden="true">&rarr;</span>
            </span>
          ) : (
            <span className="font-body text-xs font-semibold tracking-wide text-gray-400">
              DETAILS COMING SOON
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (!href) {
    return <div key={id} style={{ opacity: 0.85, cursor: 'default' }}>{content}</div>;
  }

  return (
    <Link key={id} to={href} style={{ textDecoration: 'none', color: 'inherit' }}>
      {content}
    </Link>
  );
}
