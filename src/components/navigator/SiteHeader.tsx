import React, { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, Truck, Home as HomeIcon } from 'lucide-react';
import { useCatalogVertical } from '@/hooks/useCatalog';
import { useVehicle } from '@/context/VehicleContext';
import { useFleetProject } from '@/context/FleetProjectContext';
import { NAV_VERTICALS } from '@/config/navigationVerticals';
import VehicleSelectorModal from '@/components/navigator/VehicleSelectorModal';
import MiniCart from '@/components/cart/MiniCart';
import SavedProductsButton from '@/components/navigator/SavedProductsButton';
import WorkspaceButton from '@/components/navigator/WorkspaceButton';
import FleetProjectIndicator from '@/components/fleetProjects/FleetProjectIndicator';
import MobileNavDrawer from '@/components/navigation/MobileNavDrawer';
import type { VerticalCardItem } from '@/types';

const FONT = "'Montserrat', sans-serif";
const NAVY = '#002a3a';
const RED = '#c8102e';

const UTILITY_LINKS: { label: string; to: string }[] = [
  { label: 'Resources', to: '/resources' },
  { label: 'About', to: '/about' },
  { label: 'Support', to: '/support' },
  { label: 'Contact', to: '/contact' },
];

const verticalLabelStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  padding: '13px 18px',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
};

interface SiteHeaderProps {
  activeVertical?: string | null;
  activeCategory?: string;
}

export default function SiteHeader({ activeVertical: activeVerticalProp = 'police', activeCategory }: SiteHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchFocused, setSearchFocused] = useState<boolean>(false);
  const { selectedVehicle } = useVehicle();
  const { projects: fleetProjectsList, activeProject: activeFleetProject, setActiveProject: setActiveFleetProject } = useFleetProject();

  function submitSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
    setMobileOpen(false);
  }

  // Derive verticalId from URL: first path segment
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const verticalId: string | null = pathSegments[0] || activeVerticalProp || null;
  const urlCategoryId: string | null = pathSegments[1] || null;

  // Load categories through the catalog hook — falls back to empty array if vertical not found
  const { data: verticalData } = useCatalogVertical(verticalId);
  const categories: VerticalCardItem[] = verticalData?.categories_section?.items || [];

  return (
    <header className="sticky top-0 z-40" style={{ fontFamily: FONT }}>

      {/* ── Row 1: White utility row — logo, search, utility links, vehicle selector ── */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e8e8e8' }}>
        <div className="site-header-row1-inner hidden md:flex" style={{ maxWidth: 1280, margin: '0 auto', padding: '16px 24px', alignItems: 'center', gap: 24 }}>

          {/* Logo — Fed Sig style: red mark + wordmark */}
          <button
            onClick={() => navigate('/')}
            aria-label="TFR Supply — Home"
            className="tfr-focus-ring"
            style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 6, margin: -6, borderRadius: 4, transition: 'opacity 0.15s ease' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {/* Red F-mark badge */}
            <div style={{ width: 44, height: 44, background: RED, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: 22, lineHeight: 1 }}>T</span>
            </div>
            {/* Wordmark */}
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: '0.06em', color: '#1a1a1a', lineHeight: 1.1, textTransform: 'uppercase' }}>TFR Supply</div>
              <div style={{ fontSize: 9, color: '#888', letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: 2 }}>Pro Shop</div>
            </div>
          </button>

          {/* Search bar — large, centered */}
          <form
            onSubmit={submitSearch}
            style={{
              flex: 1, maxWidth: 640, margin: '0 auto', display: 'flex', alignItems: 'stretch',
              border: `1.5px solid ${searchFocused ? RED : '#d0d0d0'}`,
              borderRadius: 6, overflow: 'hidden',
              transition: 'border-color 0.15s ease',
            }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search for products"
              aria-label="Search products"
              style={{ flex: 1, padding: '13px 18px', fontSize: 14, color: '#333', border: 'none', outline: 'none', fontFamily: FONT }}
            />
            <button
              type="submit"
              aria-label="Search"
              style={{ background: RED, border: 'none', padding: '0 22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.background = '#a50d25'}
              onMouseLeave={e => e.currentTarget.style.background = RED}
            >
              <Search size={17} color="#fff" />
            </button>
          </form>

          {/* Utility links — Title Case */}
          <nav aria-label="Utility" style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
            {UTILITY_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="tfr-focus-ring"
                style={{ fontSize: 13, fontWeight: 600, color: '#3d3d3d', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'color 0.15s ease' }}
                onMouseEnter={e => e.currentTarget.style.color = RED}
                onMouseLeave={e => e.currentTarget.style.color = '#3d3d3d'}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="site-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>

            {/* Fleet Project indicator/switcher */}
            <FleetProjectIndicator />

            {/* Vehicle selector — dark navy rounded-md, "Where to Buy" style */}
            <button
              onClick={() => setVehicleModalOpen(true)}
              className="hidden md:flex tfr-focus-ring"
              style={{
                alignItems: 'center', gap: 8,
                background: NAVY,
                color: '#fff',
                border: 'none',
                borderRadius: 6, cursor: 'pointer',
                fontWeight: 700,
                fontSize: 13,
                padding: '10px 16px',
                whiteSpace: 'nowrap',
                fontFamily: FONT,
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#001b26'}
              onMouseLeave={e => e.currentTarget.style.background = NAVY}
            >
              <Truck size={14} style={{ flexShrink: 0 }} />
              <span style={{ whiteSpace: 'nowrap' }}>
                {selectedVehicle
                  ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`
                  : 'Select Your Vehicle'}
              </span>
            </button>

            {/* Workspace */}
            <WorkspaceButton />

            {/* Saved products */}
            <SavedProductsButton />

            {/* Mini cart */}
            <MiniCart />

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-haspopup="dialog"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                alignItems: 'center', justifyContent: 'center', color: '#333',
                minWidth: 44, minHeight: 44, borderRadius: 4,
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              className="md:hidden site-header-hamburger flex tfr-focus-ring"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Row 2: Dark navy vertical navigation blocks ─────────────────────── */}
      <div style={{ background: NAVY }} className="hidden md:block">
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'stretch' }}>
          <Link
            to="/"
            aria-label="Home"
            className="tfr-focus-ring-inverse"
            style={{ display: 'flex', alignItems: 'center', padding: '0 18px', color: '#cfd8dc', transition: 'color 0.15s ease' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = '#cfd8dc'}
          >
            <HomeIcon size={15} />
          </Link>

          {NAV_VERTICALS.map(vertical => {
            const isActive = vertical.id === verticalId;
            const isEnabled = Boolean(vertical.path);
            const label = (
              <span
                style={{
                  ...verticalLabelStyle,
                  color: isEnabled ? '#ffffff' : '#5f7480',
                  borderBottom: `3px solid ${isActive ? RED : 'transparent'}`,
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                }}
              >
                {vertical.label}
              </span>
            );
            return isEnabled ? (
              <Link key={vertical.id} to={vertical.path as string} className="tfr-focus-ring-inverse">
                {label}
              </Link>
            ) : (
              <span key={vertical.id} aria-disabled="true">{label}</span>
            );
          })}
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
                  className={isEnabled ? 'tfr-focus-ring' : undefined}
                  onClick={isEnabled ? () => navigate(`/${verticalId}/${catId}`) : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '14px 16px',
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? RED : isEnabled ? '#3d3d3d' : '#bbbbbb',
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? `3px solid ${RED}` : '3px solid transparent',
                    marginBottom: -2,
                    cursor: isEnabled ? 'pointer' : 'default',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.01em',
                    transition: 'color 0.15s, background-color 0.15s',
                  }}
                  onMouseEnter={e => { if (!isActive && isEnabled) { e.currentTarget.style.color = RED; e.currentTarget.style.background = '#fafafa'; } }}
                  onMouseLeave={e => { if (!isActive && isEnabled) { e.currentTarget.style.color = '#3d3d3d'; e.currentTarget.style.background = 'transparent'; } }}
                  onFocus={e => { if (!isActive && isEnabled) { e.currentTarget.style.color = RED; e.currentTarget.style.background = '#fafafa'; } }}
                  onBlur={e => { if (!isActive && isEnabled) { e.currentTarget.style.color = '#3d3d3d'; e.currentTarget.style.background = 'transparent'; } }}
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
        fleetProjects={fleetProjectsList.filter((project: { archived?: boolean }) => !project.archived)}
        activeFleetProject={activeFleetProject}
        onSwitchFleetProject={(projectId: string) => { setActiveFleetProject(projectId); setMobileOpen(false); }}
        activeVerticalId={verticalId}
        utilityLinks={UTILITY_LINKS.map(link => link.label)}
      />
    </header>
  );
}
