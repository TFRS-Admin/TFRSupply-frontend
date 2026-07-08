import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { NAV_VERTICALS } from '@/config/navigationVerticals';
import NavigationVerticalCard from './NavigationVerticalCard';

export interface NavVertical {
  id: string;
  label: string;
  path: string | null;
  image: string;
  imageAlt: string;
  tagline: string;
  description: string;
}

export interface NavigationMegaMenuProps {
  activeVerticalId: string;
}

/**
 * Desktop mega menu: one Radix NavigationMenu trigger per vertical, opening
 * a mega panel (image + browse categories + featured products) on hover or
 * keyboard focus. Radix handles hover-intent timing, Escape-to-close, and
 * arrow-key/Home/End navigation between triggers for free.
 */
export default function NavigationMegaMenu({ activeVerticalId }: NavigationMegaMenuProps) {
  const navigate = useNavigate();

  return (
    <NavigationMenu className="max-w-none h-full justify-start">
      <NavigationMenuList className="h-full justify-start">
        <NavigationMenuItem>
          <Link
            to="/"
            className="flex h-full items-center justify-center px-4 text-gray-300 tfr-focus-ring-inverse transition-colors hover:text-white"
            aria-label="Home"
          >
            <Home size={14} />
          </Link>
        </NavigationMenuItem>

        {(NAV_VERTICALS as NavVertical[]).map((vertical) => {
          const isActive = vertical.id === activeVerticalId;
          return (
            <NavigationMenuItem key={vertical.id}>
              <NavigationMenuTrigger
                className={`tfr-focus-ring-inverse h-full whitespace-nowrap rounded-none px-[18px] font-montserrat text-xs uppercase tracking-wide border-b-[3px] transition-colors ${
                  isActive
                    ? 'font-semibold text-white bg-white/10 border-[#e21938]'
                    : 'font-normal text-gray-300 bg-transparent border-transparent hover:text-white hover:bg-white/5 hover:border-[#e21938]/60'
                }`}
                onClick={() => vertical.path && navigate(vertical.path)}
              >
                {vertical.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-[720px] max-w-[90vw] border-t-2 border-[#e21938] bg-white p-7 shadow-lg font-montserrat">
                  <NavigationVerticalCard vertical={vertical} layout="row" />
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
