/**
 * components/navigator/VehicleSelectorModal.jsx
 * Fed Sig / TFR-styled vehicle selector modal — now a two-tab shopping
 * control:
 *   1. Shop by Vehicle — the pre-existing single-vehicle selection behavior
 *      (year/make/model against the global VehicleContext), unchanged.
 *   2. Fleet Builds — a client-side, localStorage-backed workspace for
 *      planning upfits across several vehicle builds at once.
 * Opens from the SiteHeader vehicle button, the Workspace "Select/Change
 * Vehicle" actions, ConfiguratorModule, and VehicleConfigurationSummary —
 * every existing call site keeps working unchanged via the `onClose`-only
 * API; `initialTab` is optional and additive so new entry points (Finish
 * Your Upfit, the Workspace Fleet Builds section) can deep-link into the
 * Fleet Builds tab.
 */
import React, { useEffect, useState } from 'react';
import { X, Truck } from 'lucide-react';
import ShopByVehiclePanel from '@/components/fleetBuilds/ShopByVehiclePanel';
import FleetBuildsPanel from '@/components/fleetBuilds/FleetBuildsPanel';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const TABS = [
  { id: 'shop', label: 'Shop by Vehicle' },
  { id: 'fleet', label: 'Fleet Builds' },
];

export default function VehicleSelectorModal({ onClose, initialTab = 'shop' }) {
  const [activeTab, setActiveTab] = useState(initialTab === 'fleet' ? 'fleet' : 'shop');

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 999 }}
      />

      {/* Modal */}
      <div className="vehicle-selector-modal" style={{
        ...FS,
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        background: '#fff',
        width: 'calc(100% - 32px)',
        maxWidth: 640,
        maxHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        borderRadius: 3,
        overflow: 'hidden',
      }}>

        {/* Header bar */}
        <div style={{ background: '#1a2744', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: '#c8102e', borderRadius: 2, padding: '5px 7px', display: 'flex', alignItems: 'center' }}>
              <Truck size={14} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Vehicle &amp; Fleet Shopping
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>
                Shop one vehicle, or plan upfits across a small fleet
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 4 }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={isActive}
                style={{
                  ...FS,
                  flex: 1,
                  padding: '13px 12px',
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  color: isActive ? '#c8102e' : '#888',
                  background: isActive ? '#fff' : '#f7f8fa',
                  border: 'none',
                  borderBottom: isActive ? '3px solid #c8102e' : '3px solid transparent',
                  marginBottom: -1,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div style={{ padding: '24px 20px', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'shop' ? <ShopByVehiclePanel onClose={onClose} /> : <FleetBuildsPanel />}
        </div>
      </div>
    </>
  );
}
