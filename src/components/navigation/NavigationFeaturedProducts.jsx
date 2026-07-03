import React from 'react';
import { Link } from 'react-router-dom';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

/**
 * Compact featured-product tiles for the mega menu / mobile drawer.
 * Consumes the same featured_products_section.items shape catalogService
 * already returns via useCatalogVertical() — no catalog logic lives here.
 */
export default function NavigationFeaturedProducts({ products = [], title = 'Featured Products', onNavigate }) {
  if (products.length === 0) return null;

  return (
    <div>
      <p style={{ ...FS, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#999', marginBottom: 10 }}>
        {title}
      </p>
      <ul className="flex flex-col gap-3">
        {products.slice(0, 3).map((product) => {
          const inner = (
            <div className="flex gap-3 items-center group">
              {product.image && (
                <img
                  src={product.image}
                  alt={product.imageAlt || product.label}
                  className="object-cover flex-shrink-0 rounded-sm"
                  style={{ width: 56, height: 56 }}
                  loading="lazy"
                />
              )}
              <div className="min-w-0">
                <p
                  className="group-hover:underline"
                  style={{ ...FS, fontSize: 12.5, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.3 }}
                >
                  {product.label}
                </p>
                {product.tagline && (
                  <p style={{ ...FS, fontSize: 11, color: '#888', marginTop: 2, lineHeight: 1.3 }}>
                    {product.tagline}
                  </p>
                )}
              </div>
            </div>
          );
          return (
            <li key={product.label}>
              {product.href ? (
                <Link to={product.href} onClick={onNavigate} style={{ textDecoration: 'none' }}>
                  {inner}
                </Link>
              ) : (
                inner
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
