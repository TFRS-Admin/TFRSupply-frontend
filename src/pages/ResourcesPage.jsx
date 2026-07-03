import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '@/components/navigator/SiteHeader';
import PrototypeBanner from '@/components/PrototypeBanner';
import PrototypeFooter from '@/components/PrototypeFooter';
import { RESOURCE_CATEGORIES, RESOURCES } from '@/data/resourcesData';
import {
  FileText, Wrench, Zap, Settings, Shield, PlayCircle,
  BookOpen, Newspaper, Search, X, ExternalLink, ChevronRight
} from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const ICON_MAP = { FileText, Wrench, Zap, Settings, Shield, PlayCircle, BookOpen, Newspaper };

const TYPE_BADGE = {
  PDF:     { bg: '#fef2f2', color: '#c8102e', border: '#fecaca' },
  Video:   { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  Article: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
};

function TypeBadge({ type }) {
  const s = TYPE_BADGE[type] || TYPE_BADGE.Article;
  return (
    <span style={{ ...FS, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 2, padding: '2px 6px' }}>
      {type}
    </span>
  );
}

export default function ResourcesPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  const filtered = useMemo(() => {
    return RESOURCES.filter(r => {
      const matchCat = !activeCategory || r.category === activeCategory;
      const q = query.toLowerCase();
      const matchQ = !q || r.title.toLowerCase().includes(q) || r.tags.some(t => t.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }, [query, activeCategory]);

  const activeCat = RESOURCE_CATEGORIES.find(c => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-white" style={FS}>
      <PrototypeBanner />
      <SiteHeader />

      {/* Page Hero */}
      <div style={{ background: '#1a1a1a', borderBottom: '4px solid #c8102e' }}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>Resource Library</p>
          <h1 style={{ fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 700, color: '#fff', marginBottom: 10 }}>
            Product Resources & Documentation
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', maxWidth: 560, lineHeight: 1.65, marginBottom: 28 }}>
            Download product sheets, installation guides, wiring diagrams, compliance documents, and more for all TFR Supply product families.
          </p>

          {/* Search Bar */}
          <div style={{ position: 'relative', maxWidth: 520 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              type="text"
              placeholder="Search resources by name, product, or tag…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ ...FS, width: '100%', padding: '12px 40px 12px 40px', fontSize: 14,
                background: '#fff', border: '1px solid #ddd', outline: 'none', borderRadius: 0, color: '#1a1a1a' }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Category Grid */}
        {!activeCategory && !query && (
          <div style={{ marginBottom: 48 }}>
            <div style={{ marginBottom: 6 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Browse by Category</p>
              <div style={{ width: 40, height: 3, background: '#c8102e', marginBottom: 24 }} />
            </div>
            <div className="landing-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
              {RESOURCE_CATEGORIES.map(cat => {
                const Icon = ICON_MAP[cat.icon];
                return (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                    style={{ textAlign: 'left', background: '#fff', border: '1px solid #e0e0e0',
                      padding: '1.25rem', cursor: 'pointer', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#c8102e'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#e0e0e0'}
                  >
                    <div style={{ color: '#c8102e', marginBottom: 10 }}><Icon size={26} /></div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>{cat.name}</p>
                    <p style={{ fontSize: 12, color: '#666', lineHeight: 1.55, marginBottom: 8 }}>{cat.description}</p>
                    <p style={{ fontSize: 11, color: '#c8102e', fontWeight: 700 }}>{cat.count} items</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Active category filter pill */}
        {(activeCategory || query) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            {activeCat && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef2f2',
                border: '1px solid #fecaca', color: '#c8102e', fontSize: 12, fontWeight: 700,
                padding: '4px 10px', borderRadius: 2 }}>
                {activeCat.name}
                <button onClick={() => setActiveCategory(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c8102e', display: 'flex' }}>
                  <X size={13} />
                </button>
              </span>
            )}
            {query && (
              <span style={{ fontSize: 13, color: '#666' }}>
                {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<strong>{query}</strong>"
              </span>
            )}
            {!query && activeCat && (
              <span style={{ fontSize: 13, color: '#666' }}>{filtered.length} items</span>
            )}
          </div>
        )}

        {/* All-category browse shortcut when no filter active */}
        {!activeCategory && !query && (
          <div>
            <div style={{ marginBottom: 6 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>All Resources</p>
              <div style={{ width: 40, height: 3, background: '#c8102e', marginBottom: 24 }} />
            </div>
          </div>
        )}

        {/* Resource Results Table */}
        {(activeCategory || query || true) && (
          <div style={{ border: '1px solid #e0e0e0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#1a1a1a' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', width: '45%' }}>Title</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Type</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Size</th>
                  <th style={{ padding: '10px 14px', textAlign: 'left', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#888', fontSize: 14 }}>
                      No resources found. Try a different search term or category.
                    </td>
                  </tr>
                )}
                {filtered.map((r, i) => {
                  const cat = RESOURCE_CATEGORIES.find(c => c.id === r.category);
                  return (
                    <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9', borderBottom: '1px solid #ececec' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#eef3fb'}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#f9f9f9'}
                    >
                      <td style={{ padding: '10px 14px', color: '#1a1a1a', fontWeight: 600 }}>{r.title}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <button onClick={() => setActiveCategory(r.category)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c8102e', fontSize: 12, fontWeight: 700, padding: 0 }}>
                          {cat?.name}
                        </button>
                      </td>
                      <td style={{ padding: '10px 14px' }}><TypeBadge type={r.type} /></td>
                      <td style={{ padding: '10px 14px', color: '#888', fontSize: 12 }}>{r.size || '—'}</td>
                      <td style={{ padding: '10px 14px', color: '#888', fontSize: 12 }}>{r.date}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: 4,
                          background: '#c8102e', color: '#fff', fontSize: 11, fontWeight: 700,
                          padding: '5px 12px', textDecoration: 'none', letterSpacing: '0.05em' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#a00d24'}
                          onMouseLeave={e => e.currentTarget.style.background = '#c8102e'}
                        >
                          {r.type === 'Video' ? 'Watch' : 'Download'} <ExternalLink size={11} />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Browse all categories link */}
        {activeCategory && (
          <div style={{ marginTop: 20 }}>
            <button onClick={() => setActiveCategory(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
                color: '#c8102e', fontSize: 14, fontWeight: 700 }}>
              ← Browse All Categories
            </button>
          </div>
        )}
      </div>

      <PrototypeFooter />
    </div>
  );
}