import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, Truck } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-[#002a3a] font-montserrat">
      {/* ── Unified header bar — single navy row, no more 3-row split ───── */}
      <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-6 py-3">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          aria-label="TFR Supply — Home"
          className="flex shrink-0 items-center gap-3 rounded p-1 transition-opacity hover:opacity-80"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-[#c8102e]">
            <span className="text-2xl font-black leading-none tracking-tighter text-white">T</span>
          </div>
          <div className="text-left">
            <div className="text-[17px] font-black uppercase leading-tight tracking-widest text-white">TFR SUPPLY</div>
            <div className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-gray-400">Pro Shop</div>
          </div>
        </button>

        {/* Main navigation — desktop only */}
        <div className="hidden h-11 md:flex">
          <NavigationMegaMenu activeVerticalId={verticalId} />
        </div>

        {/* Search — desktop only */}
        <form onSubmit={submitSearch} className="ml-2 hidden max-w-xs flex-1 items-stretch overflow-hidden rounded-md border border-white/20 bg-white/5 lg:flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products"
            aria-label="Search products"
            className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-gray-500 outline-none"
          />
          <button type="submit" aria-label="Search" className="shrink-0 px-3 text-gray-300 hover:text-white">
            <Search size={16} />
          </button>
        </form>

        {/* Right-aligned actions */}
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-5 pr-1 lg:flex">
            {UTILITY_LINKS.map((link) => (
              <button key={link} className="whitespace-nowrap text-xs font-normal text-gray-400 transition-colors hover:text-white">
                {link}
              </button>
            ))}
          </div>

          {/* Fleet Project indicator/switcher */}
          <FleetProjectIndicator />

          {/* Vehicle selector button */}
          <button
            onClick={() => setVehicleModalOpen(true)}
            className="hidden items-center gap-2 whitespace-nowrap rounded-md border border-white/20 bg-white/5 px-3 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/10 md:flex"
          >
            <Truck size={14} className="shrink-0 text-gray-300" />
            <span className="whitespace-nowrap">
              {selectedVehicle
                ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`
                : 'Select Your Vehicle'}
            </span>
            {selectedVehicle && (
              <span className="shrink-0 rounded-sm bg-[#c8102e] px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-white">
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

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-haspopup="dialog"
            className="flex min-h-11 min-w-11 items-center justify-center rounded text-white transition-colors hover:bg-white/10 md:hidden"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Category row — driven by active vertical JSON ───────────────── */}
      {categories.length > 0 && (
        <div className="hidden border-t border-white/10 md:block">
          <div className="mx-auto flex max-w-[1280px] items-stretch px-6">
            {categories.map((cat) => {
              const catId = cat.categoryId || null;
              const isActive = urlCategoryId ? urlCategoryId === catId : (activeCategory === cat.label);
              const isEnabled = !!catId;
              return (
                <button
                  key={cat.label}
                  className={`flex items-center gap-1 whitespace-nowrap border-b-[3px] px-4 py-3 text-[13px] tracking-wide transition-colors ${
                    isActive
                      ? 'border-[#c8102e] font-semibold text-[#c8102e]'
                      : isEnabled
                        ? 'border-transparent font-normal text-gray-300 hover:border-[#c8102e]/60 hover:text-white'
                        : 'cursor-default border-transparent font-normal text-gray-600'
                  }`}
                  onClick={isEnabled ? () => navigate(`/${verticalId}/${catId}`) : undefined}
                >
                  {cat.label}
                  {isEnabled && <ChevronDown size={12} className="mt-px opacity-50" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Vehicle selector modal ─────────────────────────────────────── */}
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
