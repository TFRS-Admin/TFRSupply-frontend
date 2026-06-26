/**
 * components/configurator/ConfiguratorLayout.jsx
 * Responsive wrapper that stacks ConfigurationSummary and QuoteRequestPanel.
 * Single-column below 900px, two-column above.
 */

import React from 'react';
import ConfigurationSummary from './ConfigurationSummary';
import QuoteRequestPanel from './QuoteRequestPanel';
import AddToCartPanel from './AddToCartPanel';

export default function ConfiguratorLayout({ productMeta, shopifyMap }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: '2rem',
      alignItems: 'flex-start',
    }}>
      <ConfigurationSummary />
      <div>
        <QuoteRequestPanel productMeta={productMeta} />
        <AddToCartPanel productMeta={productMeta} shopifyMap={shopifyMap} />
      </div>
    </div>
  );
}