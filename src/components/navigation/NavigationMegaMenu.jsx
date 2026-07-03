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

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const triggerStyle = (isActive) => ({
  padding: '10px 18px',
  height: '100%',
  fontSize: 12,
  fontWeight: isActive ? 700 : 400,
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
  background: isActive ? '#ffffff' : 'transparent',
  color: isActive ? '#1c1c1c' : '#aaaaaa',
  borderRadius: 0,
  whiteSpace: 'nowrap',
});

/**
 * Desktop mega menu: one Radix NavigationMenu trigger per vertical, opening
 * a mega panel (image + browse categories + featured products) on hover or
 * keyboard focus. Radix handles hover-intent timing, Escape-to-close, and
 * arrow-key/Home/End navigation between triggers for free.
 */
export default function NavigationMegaMenu({ activeVerticalId }) {
  const navigate = useNavigate();

  return (
    <NavigationMenu className="max-w-none justify-start" style={{ height: '100%' }}>
      <NavigationMenuList className="justify-start" style={{ height: '100%' }}>
        <NavigationMenuItem>
          <Link
            to="/"
            className="flex items-center justify-center h-full"
            style={{ padding: '0 16px', color: '#ccc' }}
            aria-label="Home"
          >
            <Home size={14} />
          </Link>
        </NavigationMenuItem>

        {NAV_VERTICALS.map((vertical) => {
          const isActive = vertical.id === activeVerticalId;
          return (
            <NavigationMenuItem key={vertical.id}>
              <NavigationMenuTrigger
                style={triggerStyle(isActive)}
                onClick={() => vertical.path && navigate(vertical.path)}
              >
                {vertical.label}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div
                  className="bg-white shadow-lg border-t-2"
                  style={{ ...FS, borderColor: '#c8102e', padding: '28px 32px', width: 720, maxWidth: '90vw' }}
                >
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
