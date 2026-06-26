import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadCategory } from '@/lib/dataLoader';
import SiteHeader from '@/components/navigator/SiteHeader';
import PrototypeBanner from '@/components/PrototypeBanner';
import PrototypeFooter from '@/components/PrototypeFooter';
import SectionLabel from '@/components/templates/SectionLabel';
import NotFound from '@/components/templates/NotFound';
import { ChevronRight } from 'lucide-react';

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

export default function CategoryTemplate() {
  const { verticalId, categoryId } = useParams();
  const data = loadCategory(categoryId);
  const [activeFilter, setActiveFilter] = useState({});

  if (!data) return <NotFound type="category" backTo={`/${verticalId}`} backLabel="Return to Vertical" />;

  const { hero, description, filters = [], products = [], breadcrumbs } = data;

  const filtered = products.filter(p => {
    return Object.entries(activeFilter).every(([key, val]) => {
      if (!val) return true;
      return p[key] === val || (Array.isArray(p[key]) && p[key].includes(val));
    });
  });

  return (
    <div className="min-h-screen bg-white" style={FS}>
      <PrototypeBanner />
      <SiteHeader activeVertical={verticalId} />
      <Breadcrumbs crumbs={[
        { label: 'Home', to: '/' },
        { label: verticalId.charAt(0).toUpperCase() + verticalId.slice(1).replace(/-/g, ' '), to: `/${verticalId}` },
        { label: data.label }
      ]} />

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: '#1a2744', minHeight: 220 }}>
        {hero?.image && <img src={hero.image} alt={hero.imageAlt || ''} className="absolute inset-0 w-full h-full object-cover opacity-25" />}
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>{hero?.title || data.label}</h1>
          {hero?.subtitle && <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', maxWidth: 540, lineHeight: 1.65 }}>{hero.subtitle}</p>}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: '#c8102e' }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

          {/* Sidebar Filters */}
          {filters.length > 0 && (
            <div style={{ width: 220, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', margin: 0 }}>Filter By</p>
                {Object.values(activeFilter).some(Boolean) && (
                  <button onClick={() => setActiveFilter({})} style={{ fontSize: 11, color: '#c8102e', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
                    Reset All
                  </button>
                )}
              </div>
              {filters.map(f => (
                <div key={f.id} style={{ marginBottom: '1.25rem' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', marginBottom: '0.4rem' }}>{f.label}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <button
                      onClick={() => setActiveFilter(prev => ({ ...prev, [f.id]: null }))}
                      style={{ textAlign: 'left', fontSize: 13, color: !activeFilter[f.id] ? '#c8102e' : '#555', fontWeight: !activeFilter[f.id] ? 700 : 400, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}>
                      All
                    </button>
                    {f.options.map(opt => (
                      <button key={opt}
                        onClick={() => setActiveFilter(prev => ({ ...prev, [f.id]: opt }))}
                        style={{ textAlign: 'left', fontSize: 13, color: activeFilter[f.id] === opt ? '#c8102e' : '#555', fontWeight: activeFilter[f.id] === opt ? 700 : 400, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Product Grid */}
          <div style={{ flex: 1 }}>
            {description && <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: '1.5rem' }}>{description}</p>}
            <p style={{ fontSize: 12, color: '#999', marginBottom: '1.25rem' }}>{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem' }}>
              {filtered.map(p => (
                <Link key={p.id} to={`/${verticalId}/${categoryId}/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="border border-gray-200 overflow-hidden h-full flex flex-col"
                    style={{ transition: 'border-color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#c8102e'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
                    {p.image && <img src={p.image} alt={p.label} className="w-full object-cover" style={{ height: 180 }} />}
                    <div className="p-4 flex flex-col flex-1">
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>{p.label}</p>
                      {p.tagline && <p style={{ fontSize: 12, color: '#c8102e', fontStyle: 'italic', marginBottom: 6 }}>{p.tagline}</p>}
                      {p.specs && (
                        <ul style={{ fontSize: 12, color: '#777', paddingLeft: '1rem', flex: 1 }}>
                          {p.specs.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      )}
                      {p.badges && (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                          {p.badges.map(b => (
                            <span key={b} style={{ fontSize: 10, fontWeight: 700, background: '#f0f4ff', color: '#1a2744', padding: '2px 6px', letterSpacing: '0.05em' }}>{b}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p style={{ fontSize: 14, color: '#999' }}>No products match the selected filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <PrototypeFooter />
    </div>
  );
}