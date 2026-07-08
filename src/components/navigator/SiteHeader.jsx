import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Menu,
  X,
  ChevronDown,
  Truck,
  User,
  Heart,
  LayoutDashboard,
  Plus,
  Settings,
  UserCircle,
  LogOut,
  ShoppingCart,
} from 'lucide-react';
import { useCatalogVertical } from '@/hooks/useCatalog';
import { useVehicle } from '@/context/VehicleContext';
import { useFleetProject } from '@/context/FleetProjectContext';
import { useSavedProducts } from '@/context/SavedProductsContext';
import { useMiniCart } from '@/hooks/cartWorkspace';
import { useAuth } from '@/lib/AuthContext';
import VehicleSelectorModal from '@/components/navigator/VehicleSelectorModal';
import NavigationMegaMenu from '@/components/navigation/NavigationMegaMenu';
import MobileNavDrawer from '@/components/navigation/MobileNavDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const UTILITY_LINKS = ['Resources', 'Articles', 'Product News', 'Trade Shows'];

export default function SiteHeader({ activeVertical: activeVerticalProp = 'police', activeCategory }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedVehicle } = useVehicle();
  const {
    projects: fleetProjectsList,
    activeProject: activeFleetProject,
    setActiveProject: setActiveFleetProject,
    createProject: createFleetProject,
  } = useFleetProject();
  const { productIds: savedProductIds } = useSavedProducts();
  const { summary: cartSummary } = useMiniCart();
  const { isAuthenticated, logout } = useAuth();

  const switchableFleetProjects = fleetProjectsList.filter((project) => !project.archived);
  const cartItemCount = cartSummary?.itemCount ?? 0;

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
        <form onSubmit={submitSearch} className="ml-2 hidden max-w-xs flex-1 items-center gap-2 lg:flex">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products"
            aria-label="Search products"
            className="h-9 border-white/20 bg-white/5 text-white placeholder:text-gray-500 focus-visible:ring-[#c8102e]"
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            aria-label="Search"
            className="h-9 w-9 shrink-0 text-white hover:bg-white/10 hover:text-white"
          >
            <Search size={16} />
          </Button>
        </form>

        {/* Right-aligned actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Resources — tucked-away utility links */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="hidden items-center gap-1 text-gray-300 hover:bg-white/10 hover:text-white lg:flex"
              >
                Resources
                <ChevronDown size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {UTILITY_LINKS.map((link) => (
                <DropdownMenuItem key={link}>{link}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Vehicle selector — kept active and prominent, a tactical tool readout */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setVehicleModalOpen(true)}
            className="hidden items-center gap-2 rounded-md border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white md:flex"
          >
            <Truck size={14} className="shrink-0 text-gray-300" />
            <span className="whitespace-nowrap">
              {selectedVehicle
                ? `[ ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model} ]`
                : '[ Select Vehicle ]'}
            </span>
          </Button>

          {/* User menu — consolidates Workspace, Favorites, Fleet Projects, Account */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Account menu"
                className="h-10 w-10 text-white hover:bg-white/10 hover:text-white"
              >
                <User size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuItem onClick={() => navigate('/workspace')}>
                <LayoutDashboard size={14} className="mr-2" /> My Workspace
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/saved-products')}>
                <Heart size={14} className="mr-2" />
                Favorites{savedProductIds.length > 0 ? ` (${savedProductIds.length})` : ''}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Fleet Projects
              </DropdownMenuLabel>
              {isAuthenticated ? (
                <>
                  {switchableFleetProjects.map((project) => (
                    <DropdownMenuItem
                      key={project.id}
                      onClick={() => setActiveFleetProject(project.id)}
                      className={project.id === activeFleetProject?.id ? 'font-semibold text-[#c8102e]' : undefined}
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
                    <Plus size={13} className="mr-2" /> New Project
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={() => navigate('/login')}>
                  Login to access Fleet Projects
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => navigate('/account/settings')}>
                <Settings size={14} className="mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/account')}>
                <UserCircle size={14} className="mr-2" /> Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut size={14} className="mr-2" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cart — simple icon with a red badge notification */}
          <Button
            variant="ghost"
            size="icon"
            aria-label={`View cart, ${cartItemCount} item${cartItemCount === 1 ? '' : 's'}`}
            onClick={() => navigate('/cart')}
            className="relative h-10 w-10 text-white hover:bg-white/10 hover:text-white"
          >
            <ShoppingCart size={18} />
            {cartItemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c8102e] px-1 text-[10px] font-bold leading-none text-white">
                {cartItemCount}
              </span>
            )}
          </Button>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-haspopup="dialog"
            className="h-11 w-11 text-white hover:bg-white/10 hover:text-white md:hidden"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </Button>
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
