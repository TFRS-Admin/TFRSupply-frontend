import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadProduct } from '@/lib/dataLoader';
import SiteHeader from '@/components/navigator/SiteHeader';
import PrototypeBanner from '@/components/PrototypeBanner';
import PrototypeFooter from '@/components/PrototypeFooter';
import DebugToggle from '@/components/DebugToggle';
import DebugPanel from '@/components/DebugPanel';
import NavigatorTabs from '@/components/navigator/NavigatorTabs';
import NotFound from '@/components/templates/NotFound';
import { ChevronRight, ExternalLink, FileDown, Phone, Settings } from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

function Breadcrumbs({ crumbs = [] }) {
  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center gap-1" style={{ ...FS, fontSize: 12, color: '#888' }}>
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight size={12} />}
            {c.to ? <Link to={c.to} style={{ color: '#c8102e', textDecoration: 'none' }}>{c.label}</Link> : <span style={{ color: '#444' }}>{c.label}</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function ImageGallery({ gallery = [], hero }) {
  const images = gallery.length > 0 ? gallery : hero ? [{ src: hero, alt: 'Product image' }] : [];
  const [active, setActive] = useState(0);
  if (!images.length) return null;

  return (
    <div>
      <div className="border border-gray-200 overflow-hidden flex items-center justify-center bg-white" style={{ height: 380 }}>
        <img src={images[active]?.src} alt={images[active]?.alt || ''} className="max-h-full max-w-full object-contain" />
      </div>
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {images.map((img, i) => (
            <button key={i} onClick={() => setActive(i)}
              style={{ width: 64, height: 64, border: `2px solid ${active === i ? '#c8102e' : '#e5e7eb'}`, background: '#fff', overflow: 'hidden', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
              <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CTAPanel({ cta = {}, commerce = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
      {cta.configurator_url && (
        <a href={cta.configurator_url} target="_blank" rel="noopener noreferrer"
          style={{ ...FS, fontSize: 14, fontWeight: 700, color: '#fff', background: '#c8102e', padding: '11px 20px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <Settings size={16} /> Configure This Product
        </a>
      )}
      {cta.where_to_buy_url && (
        <a href={cta.where_to_buy_url} target="_blank" rel="noopener noreferrer"
          style={{ ...FS, fontSize: 14, fontWeight: 700, color: '#1a2744', background: '#fff', border: '2px solid #1a2744', padding: '10px 20px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
          <ExternalLink size={16} /> Where to Buy
        </a>
      )}
      {cta.request_info_url && (
        <a href={cta.request_info_url}
          style={{ ...FS, fontSize: 14, fontWeight: 700, color: '#c8102e', border: '2px solid #c8102e', padding: '10px 20px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', background: '#fff' }}>
          <Phone size={16} /> Request Information
        </a>
      )}
      {cta.manual_url && (
        <a href={cta.manual_url}
          style={{ ...FS, fontSize: 13, color: '#555', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', paddingTop: 4 }}>
          <FileDown size={14} /> Download Manual
        </a>
      )}
    </div>
  );
}

export default function ProductDetailTemplate() {
  const { verticalId, categoryId, productId } = useParams();
  const data = loadProduct(productId);

  if (!data) return <NotFound type="product" backTo={`/${verticalId}/${categoryId}`} backLabel="Return to Category" />;

  const { title, subtitle, breadcrumbs, media, marketing, commerce, cta } = data;

  return (
    <div className="min-h-screen bg-white text-gray-900" style={FS}>
      <PrototypeBanner />
      <SiteHeader activeVertical={verticalId || data.verticals?.[0]} activeCategory={data.category} />
      <Breadcrumbs crumbs={breadcrumbs || [{ label: 'Home', to: '/' }, { label: title }]} />

      {/* Product Hero */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 style={{ fontSize: 'clamp(1.4rem,2.5vw,1.9rem)', fontWeight: 700, color: '#1a1a1a', textAlign: 'center', marginBottom: '2rem' }}>{title}</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'flex-start' }}>
          <ImageGallery gallery={media?.gallery} hero={media?.hero} />

          <div>
            {subtitle && <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, marginBottom: '1.25rem' }}>{subtitle}</p>}
            {marketing?.features?.length > 0 && (
              <ul style={{ fontSize: 15, color: '#333', lineHeight: 1.8, paddingLeft: '1.25rem', marginBottom: '0.5rem' }}>
                {marketing.features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            )}
            <CTAPanel cta={cta || {}} commerce={commerce || {}} />
          </div>
        </div>
      </div>

      {/* Tabbed Content — reuse NavigatorTabs for Navigator; generic tabs for others */}
      {productId === 'navigator' ? (
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <NavigatorTabs />
          </div>
        </div>
      ) : (
        /* Generic tabbed specs/docs for any product */
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-10">
            {data.specifications && Object.keys(data.specifications).length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a2744', borderBottom: '2px solid #1a2744', paddingBottom: 6, marginBottom: 12 }}>Specifications</p>
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <tbody>
                    {Object.entries(data.specifications).map(([k, v], i) => (
                      <tr key={k} style={{ background: i % 2 === 0 ? '#f7f8fa' : '#fff' }}>
                        <td style={{ padding: '7px 12px', fontWeight: 600, color: '#1a1a1a', width: '35%', textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</td>
                        <td style={{ padding: '7px 12px', color: '#444' }}>{Array.isArray(v) ? v.join(', ') : String(v)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {commerce?.sku_table?.length > 0 && (
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a2744', borderBottom: '2px solid #1a2744', paddingBottom: 6, marginBottom: 12 }}>Available SKUs</p>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#1a2744', color: '#fff' }}>
                        {Object.keys(commerce.sku_table[0]).map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, textTransform: 'capitalize', letterSpacing: '0.04em' }}>{h.replace(/_/g, ' ')}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {commerce.sku_table.map((row, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? '#f7f8fa' : '#fff' }}>
                          {Object.values(row).map((val, j) => (
                            <td key={j} style={{ padding: '7px 12px', color: '#333', fontFamily: j === 0 ? 'monospace' : 'inherit' }}>{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <PrototypeFooter />
      <DebugToggle />
      <DebugPanel />
    </div>
  );
}