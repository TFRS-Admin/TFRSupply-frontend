import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, MapPin, Menu, X, Home, ChevronDown } from 'lucide-react';
import { loadVertical } from '@/lib/dataLoader';

const VERTICALS = [
  { id: 'police',      label: 'Police',             path: '/police' },
  { id: 'fire',        label: 'Fire/EMS',           path: '/fire' },
  { id: 'work-truck',  label: 'Work Truck',         path: '/work-truck' },
  { id: 'signaling',   label: 'Signaling Devices',  path: null },
  { id: 'mass',        label: 'Mass Notification',  path: null },
];

const UTILITY_LINKS = ['Resources', 'Articles', 'Product News', 'Trade Shows'];

// Derive a category slug from a full href like "/police/light-bars" → "light-bars"
function hrefToCategoryId(href) {
  if (!href || href === '#') return null;
  const parts = href.split('/').filter(Boolean);
  return parts.length >= 2 ? parts[1] : null;
}

export default function SiteHeader({ activeVertical: activeVerticalProp = 'police', activeCategory }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Derive verticalId from URL: first path segment
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const verticalId = pathSegments[0] || activeVerticalProp;
  const urlCategoryId = pathSegments[1] || null;

  // Load categories from JSON — falls back to empty array if vertical not found
  const verticalData = loadVertical(verticalId);
  const categories = verticalData?.categories_section?.items || [];

  return (
    <header className="sticky top-0 z-40" style={{ fontFamily: "'Roboto','Inter',sans-serif" }}>

      {/* ── Row 1: Dark vertical/utility bar ───────────────────────────────── */}
      <div style={{ background: '#1c1c1c' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'stretch', justifyContent: 'space-between' }}>

          {/* Left: home icon + vertical tabs */}
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            {/* Home icon pill */}
            <Link
              to="/"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 16px', color: '#ccc',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = '#ccc'}
            >
              <Home size={14} />
            </Link>

            {/* Vertical pills */}
            {VERTICALS.map(v => {
              const isActive = v.id === verticalId;
              return (
                <button
                  key={v.id}
                  onClick={() => v.path && navigate(v.path)}
                  style={{
                    padding: '10px 18px',
                    fontSize: 12,
                    fontWeight: isActive ? 700 : 400,
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    background: isActive ? '#ffffff' : 'transparent',
                    color: isActive ? '#1c1c1c' : '#aaaaaa',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s, color 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#ffffff'; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#aaaaaa'; } }}
                >
                  {v.label}
                </button>
              );
            })}
          </div>

          {/* Right: utility links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }} className="hidden md:flex">
            {UTILITY_LINKS.map(link => (
              <button
                key={link}
                style={{ fontSize: 12, color: '#aaaaaa', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
                onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={e => e.currentTarget.style.color = '#aaaaaa'}
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 2: White main header ────────────────────────────────────────── */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e8e8e8' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 24 }}>

          {/* Logo — Fed Sig style: red mark + wordmark */}
          <button
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {/* Red F-mark badge */}
            <div style={{ width: 44, height: 44, background: '#c8102e', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 22, lineHeight: 1, letterSpacing: '-0.05em' }}>T</span>
            </div>
            {/* Wordmark */}
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 900, fontSize: 17, letterSpacing: '0.08em', color: '#1a1a1a', lineHeight: 1.1, textTransform: 'uppercase' }}>TFR SUPPLY</div>
              <div style={{ fontSize: 9, color: '#888', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>Pro Shop</div>
            </div>
          </button>

          {/* Search bar — center, flex-grow */}
          <div style={{ flex: 1, maxWidth: 560, display: 'flex', alignItems: 'stretch', border: '1.5px solid #d0d0d0', borderRadius: 2, overflow: 'hidden' }} className="hidden md:flex">
            <input
              type="text"
              placeholder="Search for products"
              style={{ flex: 1, padding: '10px 16px', fontSize: 14, color: '#333', border: 'none', outline: 'none', fontFamily: "'Roboto','Inter',sans-serif" }}
            />
            <button
              style={{ background: '#c8102e', border: 'none', padding: '0 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.background = '#a50d25'}
              onMouseLeave={e => e.currentTarget.style.background = '#c8102e'}
            >
              <Search size={17} color="#fff" />
            </button>
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
            {/* Where to Buy — red filled with pin icon */}
            <button
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#c8102e', color: '#fff',
                border: 'none', borderRadius: 3, cursor: 'pointer',
                fontWeight: 700, fontSize: 14, letterSpacing: '0.01em',
                padding: '10px 20px', whiteSpace: 'nowrap',
                fontFamily: "'Roboto','Inter',sans-serif",
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#a50d25'}
              onMouseLeave={e => e.currentTarget.style.background = '#c8102e'}
            >
              Where to Buy
              <MapPin size={15} />
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#333' }}
              className="md:hidden"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Row 3: Category nav — driven by active vertical JSON ───────────── */}
      {categories.length > 0 && (
        <div style={{ background: '#ffffff', borderBottom: '2px solid #e8e8e8' }} className="hidden md:block">
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'stretch' }}>
            {categories.map(cat => {
              const categoryId = hrefToCategoryId(cat.href);
              const isActive = urlCategoryId ? urlCategoryId === categoryId : (activeCategory === cat.label);
              const isEnabled = !!categoryId;
              return (
                <button
                  key={cat.label}
                  onClick={isEnabled ? () => navigate(`/${verticalId}/${categoryId}`) : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '14px 16px',
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? '#c8102e' : isEnabled ? '#3d3d3d' : '#bbbbbb',
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? '3px solid #c8102e' : '3px solid transparent',
                    marginBottom: -2,
                    cursor: isEnabled ? 'pointer' : 'default',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.01em',
                    fontFamily: "'Roboto','Inter',sans-serif",
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => { if (!isActive && isEnabled) e.currentTarget.style.color = '#c8102e'; }}
                  onMouseLeave={e => { if (!isActive && isEnabled) e.currentTarget.style.color = '#3d3d3d'; }}
                >
                  {cat.label}
                  {isEnabled && <ChevronDown size={12} style={{ opacity: 0.5, marginTop: 1 }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Mobile menu drawer ──────────────────────────────────────────────── */}
      {mobileOpen && (
        <div style={{ background: '#fff', borderBottom: '1px solid #e8e8e8', padding: '12px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'stretch', border: '1.5px solid #d0d0d0', borderRadius: 2, overflow: 'hidden', marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Search for products"
              style={{ flex: 1, padding: '10px 14px', fontSize: 14, color: '#333', border: 'none', outline: 'none', fontFamily: "'Roboto','Inter',sans-serif" }}
            />
            <button style={{ background: '#c8102e', border: 'none', padding: '0 16px', cursor: 'pointer' }}>
              <Search size={16} color="#fff" />
            </button>
          </div>
          {categories.map(cat => {
            const categoryId = hrefToCategoryId(cat.href);
            const isEnabled = !!categoryId;
            return (
              <button
                key={cat.label}
                onClick={isEnabled ? () => { navigate(`/${verticalId}/${categoryId}`); setMobileOpen(false); } : undefined}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 0', fontSize: 14, color: isEnabled ? '#3d3d3d' : '#bbbbbb', background: 'none', border: 'none', borderBottom: '1px solid #f0f0f0', cursor: isEnabled ? 'pointer' : 'default', fontFamily: "'Roboto','Inter',sans-serif" }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}