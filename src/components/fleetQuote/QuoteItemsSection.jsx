/**
 * components/fleetQuote/QuoteItemsSection.jsx
 * "Quote Items" — one section per Fleet Build (e.g. "Explorer Patrol x18")
 * listing its selected products grouped by upfit category, followed by a
 * project-wide Grouped Equipment Summary table (identical equipment combined
 * across every Fleet Build — see src/domain/fleetQuote/quoteItemGrouping.ts).
 */
import React from 'react';
import { ListOrdered } from 'lucide-react';
import SectionHeading from '@/components/product/SectionHeading';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

export default function QuoteItemsSection({ sections, groupedItems }) {
  return (
    <section style={{ marginBottom: 32 }} data-testid="quote-items-section">
      <SectionHeading icon={ListOrdered} description="Generated automatically from every Fleet Build in this project — identical equipment is grouped together below.">
        Quote Items
      </SectionHeading>

      {sections.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '24px 20px', marginBottom: 16 }}>
          <p style={{ ...FS, fontSize: 13, color: '#888', margin: 0 }}>No fleet builds in this project yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          {sections.map((section) => (
            <div key={section.buildId} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '16px 18px' }} data-testid="quote-item-vehicle-section">
              <p style={{ ...FS, fontSize: 15, fontWeight: 800, color: '#1a2744', margin: '0 0 12px' }}>{section.vehicleLabel}</p>
              {section.categories.length === 0 ? (
                <p style={{ ...FS, fontSize: 13, color: '#888', margin: 0 }}>No equipment selected yet for this vehicle.</p>
              ) : (
                <div className="quote-item-category-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.categories.map((category) => (
                    <div key={category.categoryId}>
                      <p style={{ ...FS, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#999', margin: '0 0 6px' }}>
                        {category.categoryLabel}
                      </p>
                      <ul style={{ ...FS, margin: 0, padding: '0 0 0 16px', fontSize: 13, color: '#444', lineHeight: 1.7 }}>
                        {category.products.map((product) => <li key={product.productId}>{product.label}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '18px 20px' }} data-testid="quote-items-grouped-table">
        <p style={{ ...FS, fontSize: 13, fontWeight: 700, color: '#1a2744', margin: '0 0 14px' }}>Grouped Equipment Summary</p>
        {groupedItems.length === 0 ? (
          <p style={{ ...FS, fontSize: 13, color: '#888', margin: 0 }}>No equipment selected across this project yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ ...FS, width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 420 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#999', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '6px 8px' }}>Product</th>
                  <th style={{ padding: '6px 8px' }}>Category</th>
                  <th style={{ padding: '6px 8px' }}>Quantity</th>
                  <th style={{ padding: '6px 8px' }}>Vehicle Count</th>
                </tr>
              </thead>
              <tbody>
                {groupedItems.map((item) => (
                  <tr key={item.productId} style={{ borderTop: '1px solid #f0f0f0', color: '#1a1a1a' }}>
                    <td style={{ padding: '8px' }}>{item.label}</td>
                    <td style={{ padding: '8px', color: '#666' }}>{item.categoryLabel}</td>
                    <td style={{ padding: '8px', fontWeight: 700 }}>{item.quantity}</td>
                    <td style={{ padding: '8px' }}>{item.vehicleCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
