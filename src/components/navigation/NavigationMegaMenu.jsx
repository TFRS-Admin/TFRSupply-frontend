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
  ...FS,
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
  borderBottom: `3px solid ${isActive ? '#c8102e' : 'transparent'}`,
  transition: 'color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease',
});

// Hover/focus feedback for inactive triggers is applied via direct style
// mutation (matching the rest of the header) rather than className, since
// the inline `style` above already wins specificity over any Tailwind hover
// classes. Active triggers keep their steady white/red state on hover.
function handleTriggerHover(e, isActive, hovered) {
  if (isActive) return;
  e.currentTarget.style.color = hovered ? '#ffffff' : '#aaaaaa';
  e.currentTarget.style.background = hovered ? '#2a2a2a' : 'transparent';
  e.currentTarget.style.borderBottomColor = hovered ? '#d97706' : 'transparent';
}

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
            className="flex items-center justify-center h-full tfr-focus-ring-inverse"
            style={{ padding: '0 16px', color: '#ccc', transition: 'color 0.15s ease' }}
            aria-label="Home"
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = '#ccc'}
            onFocus={e => e.currentTarget.style.color = '#ffffff'}
            onBlur={e => e.currentTarget.style.color = '#ccc'}
          >
            <Home size={14} />
          </Link>
        </NavigationMenuItem>

        {NAV_VERTICALS.map((vertical) => {
          const isActive = vertical.id === activeVerticalId;
          return (
            <NavigationMenuItem key={vertical.id}>
              <NavigationMenuTrigger
                className="tfr-focus-ring-inverse"
                style={triggerStyle(isActive)}
                onClick={() => vertical.path && navigate(vertical.path)}
                onMouseEnter={e => handleTriggerHover(e, isActive, true)}
                onMouseLeave={e => handleTriggerHover(e, isActive, false)}
                onFocus={e => handleTriggerHover(e, isActive, true)}
                onBlur={e => handleTriggerHover(e, isActive, false)}
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
