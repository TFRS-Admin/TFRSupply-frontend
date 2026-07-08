import React from 'react';
import { Search, Truck, LayoutDashboard } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { NAV_VERTICALS } from '@/config/navigationVerticals';
import NavigationVerticalCard from './NavigationVerticalCard';
import type { NavVertical } from './NavigationMegaMenu';

interface SelectedVehicle {
  year: string | number;
  make: string;
  model: string;
}

interface FleetProject {
  id: string;
  name: string;
  archived?: boolean;
}

export interface MobileNavDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSubmitSearch: (e: React.FormEvent<HTMLFormElement>) => void;
  selectedVehicle: SelectedVehicle | null;
  onOpenVehicleModal: () => void;
  onNavigateWorkspace: () => void;
  fleetProjects?: FleetProject[];
  activeFleetProject?: FleetProject | null;
  onSwitchFleetProject: (projectId: string) => void;
  activeVerticalId: string;
  utilityLinks?: string[];
}

/**
 * Mobile off-canvas drawer: search, vehicle selector, and an accordion of
 * nav verticals (each expands into image + browse categories + featured
 * products via NavigationVerticalCard). Built on the vaul-backed Drawer
 * primitive (left direction) for a native, swipe-to-close mobile feel.
 */
export default function MobileNavDrawer({
  open,
  onOpenChange,
  searchQuery,
  onSearchQueryChange,
  onSubmitSearch,
  selectedVehicle,
  onOpenVehicleModal,
  onNavigateWorkspace,
  fleetProjects = [],
  activeFleetProject = null,
  onSwitchFleetProject,
  activeVerticalId,
  utilityLinks = [],
}: MobileNavDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="left">
      <DrawerContent className="w-[88%] max-w-sm flex-col gap-0 border-none bg-[#002a3a] p-0 text-gray-200 font-montserrat">
        <DrawerTitle className="border-b border-white/10 px-5 py-4 text-xs font-bold uppercase tracking-widest text-white">
          Menu
        </DrawerTitle>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <form
            onSubmit={onSubmitSearch}
            className="mb-4 flex items-stretch overflow-hidden rounded-sm border border-white/20 bg-[#001c28] focus-within:border-[#e21938]"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search for products"
              aria-label="Search products"
              className="min-h-11 flex-1 bg-transparent px-3.5 py-3 text-[15px] text-white placeholder:text-gray-400 outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="min-w-11 border-none bg-[#e21938] px-4"
            >
              <Search size={18} className="text-white" />
            </button>
          </form>

          <button
            onClick={onOpenVehicleModal}
            className="mb-5 flex min-h-11 w-full items-center gap-2 rounded-sm border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
          >
            <Truck size={15} className="shrink-0 text-gray-300" />
            {selectedVehicle
              ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`
              : 'Select Your Vehicle'}
          </button>

          <button
            onClick={onNavigateWorkspace}
            className="mb-5 flex min-h-11 w-full items-center gap-2 rounded-sm border border-white/20 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
          >
            <LayoutDashboard size={15} className="shrink-0 text-gray-300" />
            My Workspace
          </button>

          <Accordion type="single" collapsible defaultValue={activeVerticalId}>
            {fleetProjects.length > 0 && (
              <AccordionItem value="fleet-project" className="border-white/10">
                <AccordionTrigger className="min-h-11 text-[15px] font-bold text-white hover:no-underline">
                  {`Fleet Project: ${activeFleetProject?.name ?? 'None'}`}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-1">
                    {fleetProjects.map((project) => {
                      const isActive = project.id === activeFleetProject?.id;
                      return (
                        <button
                          key={project.id}
                          onClick={() => onSwitchFleetProject(project.id)}
                          className={`min-h-11 rounded-sm px-3 py-2.5 text-left text-sm ${
                            isActive ? 'bg-[#e21938]/10 font-bold text-[#e21938]' : 'font-medium text-gray-200'
                          }`}
                        >
                          {project.name}
                        </button>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
            {(NAV_VERTICALS as NavVertical[]).map((vertical) => (
              <AccordionItem key={vertical.id} value={vertical.id} className="border-white/10">
                <AccordionTrigger className="min-h-11 text-[15px] font-bold text-white hover:no-underline">
                  <span className="flex items-center gap-3">
                    <img
                      src={vertical.image}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-sm object-cover"
                    />
                    {vertical.label}
                    {!vertical.path && (
                      <span className="text-[9px] font-bold uppercase tracking-wide text-gray-400">
                        Coming Soon
                      </span>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="rounded-sm bg-white p-4 text-[#1c1c1c]">
                    <NavigationVerticalCard vertical={vertical} layout="column" onNavigate={() => onOpenChange(false)} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {utilityLinks.length > 0 && (
            <div className="mt-6 flex flex-col border-t border-white/10 pt-4">
              {utilityLinks.map((link) => (
                <button
                  key={link}
                  className="min-h-11 py-2.5 text-left text-sm text-gray-300 hover:text-white"
                >
                  {link}
                </button>
              ))}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
