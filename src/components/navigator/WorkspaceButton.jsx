import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

/**
 * Reusable header "My Workspace" entry point. Navigates to /workspace,
 * mirroring MiniCart/SavedProductsButton's imperative navigate() pattern.
 * It does not own any workspace state — every section on /workspace reads
 * its own existing context (SavedProducts, RecentlyViewed, Compare,
 * Vehicle, Configurator, Cart Workspace).
 *
 * Desktop-only (`hidden md:flex`), matching the header's vehicle-selector
 * button — the mobile off-canvas drawer (MobileNavDrawer) carries its own
 * "My Workspace" entry point so the icon row on small screens doesn't grow
 * past 4 buttons and overflow.
 */
export default function WorkspaceButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/workspace')}
      aria-label="Open my workspace"
      className="hidden md:flex"
      style={{
        alignItems: 'center', gap: 8,
        background: '#f5f5f5', color: '#1a1a1a',
        border: '1.5px solid #d0d0d0', borderRadius: 3, cursor: 'pointer',
        fontSize: 13, fontWeight: 600, padding: '8px 14px', whiteSpace: 'nowrap',
        fontFamily: "'Roboto','Inter',sans-serif",
      }}
    >
      <LayoutDashboard size={16} />
    </button>
  );
}
