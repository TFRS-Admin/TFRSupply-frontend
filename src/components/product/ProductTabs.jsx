/**
 * components/product/ProductTabs.jsx
 *
 * Generic, data-driven product tabs component.
 * Renders tabs defined in product JSON → tabs[] array.
 * The "Build & Configure" tab loads ConfiguratorModule via the product's configuratorId.
 *
 * Tab types supported (via tab.content_type):
 *   - features     : marketing.features list + marketing.applications
 *   - specifications: specifications object table
 *   - documentation : documentation.manuals + documentation.brochures
 *   - configurator  : ConfiguratorModule (uses product.configuratorId)
 */

import React, { useState } from 'react';
import { FileDown, ExternalLink } from 'lucide-react';
import ConfiguratorModule from '@/components/configurator/ConfiguratorModule';
import { useConfiguratorData } from '@/hooks/useConfiguratorData';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

// ── Tab content renderers ─────────────────────────────────────────────────────

function FeaturesContent({ marketing = {} }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div>
        <h3 style={{ ...FS, fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>Key Features</h3>
        {marketing.features?.length > 0 && (
          <ul style={{ ...FS, fontSize: 13, color: '#444', lineHeight: 1.8, paddingLeft: '1.25rem', margin: 0 }}>
            {marketing.features.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        )}
      </div>
      {(marketing.applications?.length > 0 || marketing.benefits?.length > 0) && (
        <div>
          {marketing.applications?.length > 0 && (
            <>
              <h3 style={{ ...FS, fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>Applications</h3>
              <ul style={{ ...FS, fontSize: 13, color: '#444', lineHeight: 1.8, paddingLeft: '1.25rem', margin: 0 }}>
                {marketing.applications.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SpecificationsContent({ specifications = {} }) {
  const entries = Object.entries(specifications);
  if (!entries.length) return <p style={{ ...FS, fontSize: 13, color: '#888' }}>No specifications available.</p>;
  return (
    <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', ...FS }}>
      <tbody>
        {entries.map(([k, v], i) => (
          <tr key={k} style={{ background: i % 2 === 0 ? '#f7f8fa' : '#fff' }}>
            <td style={{ padding: '8px 12px', fontWeight: 600, color: '#1a1a1a', width: '35%', textTransform: 'capitalize', borderBottom: '1px solid #e5e7eb' }}>
              {k.replace(/_/g, ' ')}
            </td>
            <td style={{ padding: '8px 12px', color: '#444', borderBottom: '1px solid #e5e7eb' }}>
              {Array.isArray(v) ? v.join(', ') : String(v)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DocumentationContent({ documentation = {} }) {
  const allDocs = [
    ...(documentation.manuals ?? []).map(d => ({ ...d, category: 'Manuals' })),
    ...(documentation.brochures ?? []).map(d => ({ ...d, category: 'Brochures' })),
    ...(documentation.certifications ?? []).map(d => ({ ...d, category: 'Certifications' })),
  ];
  if (!allDocs.length) return <p style={{ ...FS, fontSize: 13, color: '#888' }}>No documents available.</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {allDocs.map((d, i) => (
        <a
          key={i}
          href={d.url || '#'}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px', background: '#f8fafc', border: '1px solid #e5e7eb',
            textDecoration: 'none', cursor: 'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f0f4ff'}
          onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
        >
          <div style={{
            width: 32, height: 32, background: '#fef2f2', border: '1px solid #fecaca',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <span style={{ fontSize: 9, fontWeight: 900, color: '#c8102e' }}>
              {(d.type ?? 'PDF').toUpperCase()}
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ ...FS, fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{d.label}</div>
            <div style={{ ...FS, fontSize: 10, color: '#888', marginTop: 1 }}>{d.category}</div>
          </div>
          <ExternalLink size={13} style={{ color: '#9ca3af', flexShrink: 0 }} />
        </a>
      ))}
    </div>
  );
}

function ConfiguratorContent({ configuratorId, verticalId, categoryId }) {
  const { data: configuratorData } = useConfiguratorData(configuratorId);
  if (!configuratorData) return (
    <p style={{ ...FS, fontSize: 13, color: '#888' }}>Configurator data not found for: {configuratorId}</p>
  );
  return (
    <ConfiguratorModule
      configuratorData={configuratorData}
      verticalId={verticalId}
      categoryId={categoryId}
    />
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ProductTabs({ productData, verticalId, categoryId }) {
  const tabs = productData?.tabs ?? [];
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? '');

  if (!tabs.length) return null;

  const activeTabDef = tabs.find(t => t.id === activeTab);

  const renderContent = () => {
    if (!activeTabDef) return null;
    switch (activeTabDef.content_type) {
      case 'features':
        return <FeaturesContent marketing={productData.marketing} />;
      case 'specifications':
        return <SpecificationsContent specifications={productData.specifications} />;
      case 'documentation':
        return <DocumentationContent documentation={productData.documentation} />;
      case 'configurator':
        return (
          <ConfiguratorContent
            configuratorId={productData.configuratorId}
            verticalId={verticalId}
            categoryId={categoryId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Tab bar — identical style to NavigatorTabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-4 text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#CC0000] text-[#CC0000]'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="py-8 text-gray-700">
        {renderContent()}
      </div>
    </div>
  );
}
