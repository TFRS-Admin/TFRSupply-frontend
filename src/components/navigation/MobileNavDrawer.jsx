import React from 'react';
import { Search, Truck, LayoutDashboard } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { NAV_VERTICALS } from '@/config/navigationVerticals';
import NavigationVerticalCard from './NavigationVerticalCard';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

/**
 * Mobile off-canvas drawer: search, vehicle selector, and an accordion of
 * nav verticals (each expands into image + browse categories + featured
 * products via NavigationVerticalCard). Built on the existing Sheet
 * (Radix Dialog) primitive for focus trap, Escape-to-close, and animation.
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
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[88%] max-w-sm p-0 flex flex-col gap-0 bg-white text-[#333]"
        style={FS}
      >
        <SheetTitle
          className="px-5 py-4 border-b"
          style={{ borderColor: '#e8e8e8', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1c1c1c' }}
        >
          Menu
        </SheetTitle>

        <div className="overflow-y-auto flex-1 px-5 py-4">
            <form
              onSubmit={onSubmitSearch}
              className="flex items-stretch border rounded-sm overflow-hidden mb-4"
              style={{ borderColor: '#d0d0d0' }}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="Search for products"
                aria-label="Search products"
                style={{ flex: 1, padding: '12px 14px', fontSize: 15, color: '#333', border: 'none', outline: 'none', minHeight: 44 }}
              />
              <button
                type="submit"
                aria-label="Search"
                style={{ background: '#c8102e', border: 'none', padding: '0 18px', minWidth: 44 }}
              >
                <Search size={18} color="#fff" />
              </button>
            </form>

            <button
              onClick={onOpenVehicleModal}
              className="flex items-center gap-2 w-full rounded-sm mb-5"
              style={{
                background: selectedVehicle ? '#1a2744' : '#f5f5f5',
                color: selectedVehicle ? '#fff' : '#444',
                border: `1.5px solid ${selectedVehicle ? '#1a2744' : '#d0d0d0'}`,
                fontSize: 14,
                fontWeight: 600,
                padding: '12px 16px',
                minHeight: 44,
              }}
            >
              <Truck size={15} style={{ flexShrink: 0 }} />
              {selectedVehicle
                ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`
                : 'Select Your Vehicle'}
            </button>

            <button
              onClick={onNavigateWorkspace}
              className="flex items-center gap-2 w-full rounded-sm mb-5"
              style={{
                background: '#f5f5f5', color: '#1a1a1a',
                border: '1.5px solid #d0d0d0',
                fontSize: 14, fontWeight: 600,
                padding: '12px 16px', minHeight: 44,
              }}
            >
              <LayoutDashboard size={15} style={{ flexShrink: 0 }} />
              My Workspace
            </button>

            <Accordion type="single" collapsible defaultValue={activeVerticalId}>
              {fleetProjects.length > 0 && (
                <AccordionItem value="fleet-project" style={{ borderColor: '#eee' }}>
                  <AccordionTrigger
                    className="hover:no-underline"
                    style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', minHeight: 44 }}
                  >
                    {`Fleet Project: ${activeFleetProject?.name ?? 'None'}`}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-1">
                      {fleetProjects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => onSwitchFleetProject(project.id)}
                          className="text-left rounded-sm"
                          style={{
                            fontSize: 14, padding: '10px 12px', minHeight: 44,
                            fontWeight: project.id === activeFleetProject?.id ? 700 : 500,
                            color: project.id === activeFleetProject?.id ? '#c8102e' : '#333',
                            background: project.id === activeFleetProject?.id ? '#fff5f5' : 'transparent',
                          }}
                        >
                          {project.name}
                        </button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
              {NAV_VERTICALS.map((vertical) => (
                <AccordionItem key={vertical.id} value={vertical.id} style={{ borderColor: '#eee' }}>
                  <AccordionTrigger
                    className="hover:no-underline"
                    style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', minHeight: 44 }}
                  >
                    <span className="flex items-center gap-3">
                      <img
                        src={vertical.image}
                        alt=""
                        className="rounded-sm object-cover flex-shrink-0"
                        style={{ width: 36, height: 36 }}
                      />
                      {vertical.label}
                      {!vertical.path && (
                        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: '#999', letterSpacing: '0.04em' }}>
                          Coming Soon
                        </span>
                      )}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <NavigationVerticalCard vertical={vertical} layout="column" onNavigate={() => onOpenChange(false)} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {utilityLinks.length > 0 && (
              <div className="mt-6 pt-4 border-t flex flex-col" style={{ borderColor: '#eee' }}>
                {utilityLinks.map((link) => (
                  <button
                    key={link}
                    className="text-left"
                    style={{ fontSize: 14, color: '#666', padding: '10px 0', minHeight: 44 }}
                  >
                    {link}
                  </button>
                ))}
              </div>
            )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
