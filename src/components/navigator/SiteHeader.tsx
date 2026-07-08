import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, Truck, FolderKanban, Plus } from 'lucide-react';
import { useCatalogVertical } from '@/hooks/useCatalog';
import { useVehicle } from '@/context/VehicleContext';
import { useFleetProject } from '@/context/FleetProjectContext';
import VehicleSelectorModal from '@/components/navigator/VehicleSelectorModal';
import MiniCart from '@/components/cart/MiniCart';
import SavedProductsButton from '@/components/navigator/SavedProductsButton';
import WorkspaceButton from '@/components/navigator/WorkspaceButton';
import NavigationMegaMenu from '@/components/navigation/NavigationMegaMenu';
import MobileNavDrawer from '@/components/navigation/MobileNavDrawer';
import GlobalSearchOverlay from '@/components/search/GlobalSearchOverlay';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const UTILITY_LINKS = ['Resources', 'Articles', 'Product News', 'Trade Shows'];

export interface SiteHeaderProps {
  activeVertical?: string;
  activeCategory?: string;
}

export default function SiteHeader({ activeVertical: activeVerticalProp = 'police', activeCategory }: SiteHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedVehicle } = useVehicle();
  const {
    projects: fleetProjectsList,
    activeProject: activeFleetProject,
    setActiveProject: setActiveFleetProject,
    createProject: createFleetProject,
  } = useFleetProject();
  const switchableFleetProjects = fleetProjectsList.filter((project: { archived?: boolean }) => !project.archived);

  function submitSearch(query: string) {
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
    setMobileOpen(false);
    setSearchOpen(false);
  }

  function handleMobileSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submitSearch(searchQuery.trim());
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
      {/* ── Unified header bar ─────────────────────────────────────────── */}
      <div className="mx-auto flex max-w-[1280px] items-center gap-6 px-6 py-3">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          aria-label="TFR Supply — Home"
          className="tfr-focus-ring-inverse flex shrink-0 items-center gap-3 rounded p-1 transition-opacity hover:opacity-80"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-[#e21938]">
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

        {/* Right-aligned actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Utility links */}
          <div className="hidden items-center gap-6 pr-2 lg:flex">
            {UTILITY_LINKS.map((link) => (
              <button
                key={link}
                className="tfr-focus-ring-inverse whitespace-nowrap text-xs font-normal text-gray-400 transition-colors hover:text-white"
              >
                {link}
              </button>
            ))}
          </div>

          {/* Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Open search"
            className="tfr-focus-ring-inverse flex h-10 w-10 items-center justify-center rounded text-white transition-colors hover:bg-white/10"
          >
            <Search size={18} />
          </button>

          {/* Consolidated Fleet Project + Vehicle utility dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="tfr-focus-ring-inverse hidden max-w-[220px] items-center gap-2 whitespace-nowrap rounded-sm border border-white/15 bg-white/5 px-3 py-2 text-[13px] font-medium text-gray-200 transition-colors hover:bg-white/10 md:flex"
                aria-label="Fleet project and vehicle settings"
              >
                <FolderKanban size={14} className="shrink-0 text-gray-400" />
                <span className="truncate">
                  {activeFleetProject ? activeFleetProject.name : 'No Fleet Project'}
                </span>
                <ChevronDown size={12} className="shrink-0 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Fleet Project
              </DropdownMenuLabel>
              {switchableFleetProjects.map((project: { id: string; name: string }) => (
                <DropdownMenuItem
                  key={project.id}
                  onClick={() => setActiveFleetProject(project.id)}
                  className={project.id === activeFleetProject?.id ? 'font-semibold text-[#e21938]' : undefined}
                >
                  {project.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                onClick={() => {
                  const created = createFleetProject?.();
                  if (created) navigate('/workspace');
                }}
              >
                <Plus size={13} className="mr-1.5" /> New Project
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Vehicle
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setVehicleModalOpen(true)}>
                <Truck size={14} className="mr-1.5 shrink-0" />
                <span className="truncate">
                  {selectedVehicle
                    ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`
                    : 'Select Your Vehicle'}
                </span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => navigate('/workspace')}>
                Manage Projects &rarr;
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
            className="tfr-focus-ring-inverse flex min-h-11 min-w-11 items-center justify-center rounded text-white transition-colors hover:bg-white/10 md:hidden"
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
                      ? 'border-[#e21938] font-semibold text-[#e21938]'
                      : isEnabled
                        ? 'tfr-focus-ring-inverse border-transparent font-normal text-gray-300 hover:border-[#e21938]/60 hover:text-white'
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

      {/* ── Global search overlay ────────────────────────────────────────── */}
      <GlobalSearchOverlay open={searchOpen} onOpenChange={setSearchOpen} onSubmit={submitSearch} />

      {/* ── Mobile off-canvas drawer ──────────────────────────────────────── */}
      <MobileNavDrawer
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSubmitSearch={handleMobileSearchSubmit}
        selectedVehicle={selectedVehicle}
        onOpenVehicleModal={() => { setVehicleModalOpen(true); setMobileOpen(false); }}
        onNavigateWorkspace={() => { navigate('/workspace'); setMobileOpen(false); }}
        fleetProjects={fleetProjectsList.filter((project: { archived?: boolean }) => !project.archived)}
        activeFleetProject={activeFleetProject}
        onSwitchFleetProject={(projectId: string) => { setActiveFleetProject(projectId); setMobileOpen(false); }}
        activeVerticalId={verticalId}
        utilityLinks={UTILITY_LINKS}
      />
    </header>
  );
}
