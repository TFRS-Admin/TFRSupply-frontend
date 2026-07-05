import React from 'react';
import { Link } from 'react-router-dom';
import { X, GitCompare, Settings, FileText, Eye } from 'lucide-react';
import { useCompare, MAX_COMPARE_PRODUCTS } from '@/context/CompareContext';
import { catalogService } from '@/services/catalog';
import { resolveProductDetailPath } from '@/domain/catalog';
import appConfig from '@/config/appConfig';
import { PageLayout, PageHeader, EmptyState, CTAButton } from '@/components/design-system';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

function humanize(value) {
  return value ? String(value).replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : value;
}

function buildQuoteHref(product) {
  const label = product.title ?? product.label ?? '';
  return `mailto:${appConfig.quoteRecipientEmail}?subject=${encodeURIComponent(`Quote Request: ${label}`)}`;
}

function buildConfigureHref(product, detailHref) {
  if (product.configuratorId && detailHref) return `${detailHref}#build-configure`;
  return product.actions?.configuratorUrl ?? product.cta?.configurator_url ?? null;
}

function toCompareRow(product) {
  const detailHref = resolveProductDetailPath(product);
  const specEntries = Object.entries(product.specifications ?? {}).slice(0, 6);
  const features = product.marketing?.features?.slice(0, 5) ?? [];
  const applications = Array.from(new Set(product.marketing?.applications ?? []));

  return {
    id: product.id,
    name: product.title ?? product.label ?? product.id,
    image: product.media?.hero || product.images?.[0]?.src || null,
    brand: product.vendor ?? null,
    sku: product.sku ?? product.commerce?.sku_root ?? null,
    category: humanize(product.category) ?? null,
    availability: product.commerce?.availability ?? null,
    msrp: product.commerce?.msrp_display ?? null,
    specLines: specEntries.length
      ? specEntries.map(([key, value]) => `${humanize(key)}: ${Array.isArray(value) ? value.join(', ') : value}`)
      : features,
    fitment: applications.length ? applications.join(', ') : null,
    detailHref,
    configureHref: buildConfigureHref(product, detailHref),
    quoteHref: buildQuoteHref(product),
  };
}

const FIELDS = [
  { key: 'brand', label: 'Brand', render: (row) => row.brand ?? '—' },
  { key: 'sku', label: 'SKU', render: (row) => row.sku ?? '—' },
  { key: 'category', label: 'Category', render: (row) => row.category ?? '—' },
  { key: 'availability', label: 'Availability', render: (row) => row.availability ?? '—' },
  { key: 'msrp', label: 'MSRP', render: (row) => row.msrp ?? '—' },
  {
    key: 'specs',
    label: 'Major Specifications',
    render: (row) => (row.specLines.length
      ? <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>{row.specLines.map((line) => <li key={line}>{line}</li>)}</ul>
      : 'Not specified'),
  },
  { key: 'fitment', label: 'Fitment Summary', render: (row) => row.fitment ?? 'Not specified' },
];

function ProductActions({ row }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {row.configureHref && (
        <CTAButton variant="primary" href={row.configureHref} icon={Settings} iconPosition="leading">
          Configure
        </CTAButton>
      )}
      {row.detailHref ? (
        <CTAButton variant="outline" to={row.detailHref} icon={Eye} iconPosition="leading">
          View Details
        </CTAButton>
      ) : (
        <span style={{ ...FS, fontSize: 12, fontWeight: 700, color: '#aaa', border: '2px solid #eee', padding: '7px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <Eye size={13} /> Details Unavailable
        </span>
      )}
      <CTAButton variant="outline" href={row.quoteHref} icon={FileText} iconPosition="leading">
        Request Quote
      </CTAButton>
    </div>
  );
}

export function ComparePageView({ rows, onRemove, onClear }) {
  return (
    <PageLayout background="white" crumbs={[{ label: 'Home', to: '/' }, { label: 'Compare Products' }]}>
      {rows.length === 0 ? (
        <EmptyState
          headingLevel="h1"
          icon={GitCompare}
          title="No products selected for comparison"
          description={`Browse the catalog and select up to ${MAX_COMPARE_PRODUCTS} products to compare specifications, fitment, and pricing side by side.`}
          primaryAction={{ label: 'Browse Products', to: '/search' }}
        />
      ) : (
        <>
          <PageHeader
            title="Compare Products"
            description={`${rows.length} of ${MAX_COMPARE_PRODUCTS} products selected`}
            actions={<CTAButton variant="outline" onClick={onClear}>Clear Comparison</CTAButton>}
          />

          {/* Desktop: side-by-side sticky comparison table */}
          <div className="hidden md:block" style={{ border: '1px solid #e5e7eb', overflow: 'auto', maxHeight: 'calc(100vh - 220px)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `160px repeat(${rows.length}, minmax(200px, 1fr))` }}>
              <div style={{ position: 'sticky', top: 0, left: 0, zIndex: 3, background: '#fff', borderBottom: '2px solid #1a2744' }} />
              {rows.map((row) => (
                <div key={`${row.id}-head`} style={{ position: 'sticky', top: 0, zIndex: 2, background: '#fff', borderBottom: '2px solid #1a2744', borderLeft: '1px solid #e5e7eb', padding: 16 }}>
                  <button type="button" onClick={() => onRemove(row.id)} aria-label={`Remove ${row.name} from comparison`}
                    style={{ float: 'right', border: 'none', background: 'none', color: '#888', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                  {row.image ? (
                    <img src={row.image} alt={row.name} style={{ width: '100%', height: 110, objectFit: 'contain', marginBottom: 10 }} />
                  ) : (
                    <div style={{ width: '100%', height: 110, background: '#f2f2f2', marginBottom: 10 }} />
                  )}
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 10, minHeight: 34 }}>{row.name}</p>
                  <ProductActions row={row} />
                </div>
              ))}

              {FIELDS.map((field) => (
                <React.Fragment key={field.key}>
                  <div style={{ position: 'sticky', left: 0, zIndex: 1, background: '#fafafa', borderBottom: '1px solid #e5e7eb', padding: '12px 16px', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#888' }}>
                    {field.label}
                  </div>
                  {rows.map((row) => (
                    <div key={`${row.id}-${field.key}`} style={{ borderBottom: '1px solid #e5e7eb', borderLeft: '1px solid #e5e7eb', padding: '12px 16px', fontSize: 13, color: '#333', lineHeight: 1.6 }}>
                      {field.render(row)}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Mobile: stacked comparison cards */}
          <div className="md:hidden" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {rows.map((row) => (
              <div key={row.id} style={{ border: '1px solid #e5e7eb' }}>
                <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb', position: 'relative' }}>
                  <button type="button" onClick={() => onRemove(row.id)} aria-label={`Remove ${row.name} from comparison`}
                    style={{ position: 'absolute', top: 12, right: 12, border: 'none', background: 'none', color: '#888', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                  {row.image ? (
                    <img src={row.image} alt={row.name} style={{ width: '100%', maxWidth: 220, height: 140, objectFit: 'contain', marginBottom: 10 }} />
                  ) : (
                    <div style={{ width: '100%', maxWidth: 220, height: 140, background: '#f2f2f2', marginBottom: 10 }} />
                  )}
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 12, paddingRight: 24 }}>{row.name}</p>
                  <ProductActions row={row} />
                </div>
                <dl style={{ margin: 0 }}>
                  {FIELDS.map((field, i) => (
                    <div key={field.key} style={{ padding: '10px 16px', background: i % 2 === 0 ? '#fafafa' : '#fff', borderBottom: '1px solid #eee' }}>
                      <dt style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#888', marginBottom: 4 }}>{field.label}</dt>
                      <dd style={{ fontSize: 13, color: '#333', margin: 0, lineHeight: 1.6 }}>{field.render(row)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </>
      )}
    </PageLayout>
  );
}

export default function ComparePage() {
  const { productIds, removeFromCompare, clearCompare } = useCompare();

  const rows = productIds
    .map((id) => catalogService.getProduct(id))
    .filter(Boolean)
    .map(toCompareRow);

  return <ComparePageView rows={rows} onRemove={removeFromCompare} onClear={clearCompare} />;
}

export { toCompareRow };
