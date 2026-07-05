import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, MapPin, Menu, X, ChevronDown, Truck } from 'lucide-react';
import { useCatalogVertical } from '@/hooks/useCatalog';
import { useVehicle } from '@/context/VehicleContext';
import { useFleetProject } from '@/context/FleetProjectContext';
import VehicleSelectorModal from '@/components/navigator/VehicleSelectorModal';
import MiniCart from '@/components/cart/MiniCart';
import SavedProductsButton from '@/components/navigator/SavedProductsButton';
import WorkspaceButton from '@/components/navigator/WorkspaceButton';
import FleetProjectIndicator from '@/components/fleetProjects/FleetProjectIndicator';
import NavigationMegaMenu from '@/components/navigation/NavigationMegaMenu';
import MobileNavDrawer from '@/components/navigation/MobileNavDrawer';

const UTILITY_LINKS = ['Resources', 'Articles', 'Product News', 'Trade Shows'];



export default function SiteHeader({ activeVertical: activeVerticalProp = 'police', activeCategory }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedVehicle } = useVehicle();
  const { projects: fleetProjectsList, activeProject: activeFleetProject, setActiveProject: setActiveFleetProject } = useFleetProject();

  function submitSearch(e) {
    e.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
    setMobileOpen(false);
  }

  // Derive verticalId from URL: first path segment
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const verticalId = pathSegments[0] || activeVerticalProp;
  const urlCategoryId = pathSegments[1] || null;

  // Load categories through the catalog hook — falls back to empty array if vertical not found
  const { data: verticalData } = useCatalogVertical(verticalId);
  const categories = verticalData?.categories_section?.items || [];

  return (
    <header className="sticky top-0 z-40" style={{ fontFamily: "'Roboto','Inter',sans-serif" }}>

      {/* ── Row 1: Dark vertical/utility bar ───────────────────────────────── */}
      <div style={{ background: '#1c1c1c' }}>
        <div className="site-header-row1-inner hidden md:flex" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', alignItems: 'stretch', justifyContent: 'space-between', minHeight: 40 }}>

          {/* Left: home icon + mega menu triggers */}
          <NavigationMegaMenu activeVerticalId={verticalId} />

          {/* Right: utility links */}
          <div style={{ alignItems: 'center', gap: 24 }} className="hidden md:flex">
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
        <div className="site-header-row2-inner" style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 24 }}>

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
          <form onSubmit={submitSearch} style={{ flex: 1, maxWidth: 560, alignItems: 'stretch', border: '1.5px solid #d0d0d0', borderRadius: 2, overflow: 'hidden' }} className="hidden md:flex">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for products"
              aria-label="Search products"
              style={{ flex: 1, padding: '10px 16px', fontSize: 14, color: '#333', border: 'none', outline: 'none', fontFamily: "'Roboto','Inter',sans-serif" }}
            />
            <button
              type="submit"
              aria-label="Search"
              style={{ background: '#c8102e', border: 'none', padding: '0 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.background = '#a50d25'}
              onMouseLeave={e => e.currentTarget.style.background = '#c8102e'}
            >
              <Search size={17} color="#fff" />
            </button>
          </form>

          {/* Right actions */}
          <div className="site-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>

            {/* Fleet Project indicator/switcher */}
            <FleetProjectIndicator />

            {/* Vehicle selector button */}
            <button
              onClick={() => setVehicleModalOpen(true)}
              style={{
                alignItems: 'center', gap: 8,
                background: selectedVehicle ? '#1a2744' : '#f5f5f5',
                color: selectedVehicle ? '#fff' : '#444',
                border: `1.5px solid ${selectedVehicle ? '#1a2744' : '#d0d0d0'}`,
                borderRadius: 3, cursor: 'pointer',
                fontWeight: selectedVehicle ? 700 : 500,
                fontSize: 13,
                padding: '9px 16px',
                whiteSpace: 'nowrap',
                fontFamily: "'Roboto','Inter',sans-serif",
                transition: 'all 0.15s',
                maxWidth: 260,
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = selectedVehicle ? '#0f1829' : '#ebebeb';
                e.currentTarget.style.borderColor = selectedVehicle ? '#0f1829' : '#bbb';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = selectedVehicle ? '#1a2744' : '#f5f5f5';
                e.currentTarget.style.borderColor = selectedVehicle ? '#1a2744' : '#d0d0d0';
              }}
              className="hidden md:flex"
            >
              <Truck size={14} style={{ flexShrink: 0, color: selectedVehicle ? '#94a3b8' : '#888' }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedVehicle
                  ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`
                  : 'Select Your Vehicle'}
              </span>
              {selectedVehicle && (
                <span style={{ fontSize: 9, background: '#c8102e', color: '#fff', padding: '1px 5px', borderRadius: 2, letterSpacing: '0.06em', fontWeight: 700, flexShrink: 0 }}>
                  CHANGE
                </span>
              )}
            </button>

            {/* Workspace */}
            <WorkspaceButton />

            {/* Saved products */}
            <SavedProductsButton />

            {/* Mini cart */}
            <MiniCart />

            {/* Where to Buy — red filled with pin icon */}
            <button
              className="site-header-wtb-btn"
              aria-label="Where to Buy"
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
              <span className="site-header-wtb-label">Where to Buy</span>
              <MapPin size={15} />
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', alignItems: 'center', color: '#333' }}
              className="md:hidden site-header-hamburger flex"
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
              const catId = cat.categoryId || null;
              const isActive = urlCategoryId ? urlCategoryId === catId : (activeCategory === cat.label);
              const isEnabled = !!catId;
              return (
                <button
                  key={cat.label}
                  onClick={isEnabled ? () => navigate(`/${verticalId}/${catId}`) : undefined}
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

      {/* ── Vehicle selector modal ─────────────────────────────────────────── */}
      {vehicleModalOpen && <VehicleSelectorModal onClose={() => setVehicleModalOpen(false)} />}

      {/* ── Mobile off-canvas drawer ──────────────────────────────────────── */}
      <MobileNavDrawer
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSubmitSearch={submitSearch}
        selectedVehicle={selectedVehicle}
        onOpenVehicleModal={() => { setVehicleModalOpen(true); setMobileOpen(false); }}
        onNavigateWorkspace={() => { navigate('/workspace'); setMobileOpen(false); }}
        fleetProjects={fleetProjectsList.filter((project) => !project.archived)}
        activeFleetProject={activeFleetProject}
        onSwitchFleetProject={(projectId) => { setActiveFleetProject(projectId); setMobileOpen(false); }}
        activeVerticalId={verticalId}
        utilityLinks={UTILITY_LINKS}
      />
    </header>
  );
}