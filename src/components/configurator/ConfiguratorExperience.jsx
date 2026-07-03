/**
 * components/configurator/ConfiguratorExperience.jsx
 *
 * Customer-facing Configurator Experience — composes the existing
 * Configurator (ConfiguratorModule), Vehicle Fitment Service, Package
 * Builder, Pricing Engine, and Commerce Foundation (Cart Workspace + Quote
 * Builder) into one polished storefront surface. This is composition, not
 * a new configurator engine: ConfiguratorModule's filtering, dead-end
 * prevention, and SKU-matching behavior are untouched. This component only
 * reads the configurator's existing quote payload (via the additive
 * onConfigurationChange callback) and renders presentation panels around it.
 */

import React, { useState } from 'react';
import ConfiguratorModule from '@/components/configurator/ConfiguratorModule';
import VehicleConfigurationSummary from '@/components/configurator/VehicleConfigurationSummary';
import ConfiguratorSummaryPanel from '@/components/configurator/ConfiguratorSummaryPanel';
import ConfiguratorPricingSummary from '@/components/configurator/ConfiguratorPricingSummary';
import ConfiguratorCommerceActions from '@/components/configurator/ConfiguratorCommerceActions';
import ConfiguratorFitmentFeedback from '@/components/configurator/ConfiguratorFitmentFeedback';
import { useVehicle } from '@/context/VehicleContext';
import { useProductFitment } from '@/hooks/vehicleFitment';
import { toFitmentVehicle } from '@/components/product/FitmentSummary';

export default function ConfiguratorExperience({ configuratorData, verticalId, categoryId, packageId }) {
  const [configState, setConfigState] = useState(null);
  const { selectedVehicle } = useVehicle();

  const vehicle = React.useMemo(() => toFitmentVehicle(selectedVehicle), [selectedVehicle]);
  const fitmentRequest = React.useMemo(
    () => (vehicle && configState?.selectedBaseSku ? { vehicle, productId: configState.configuratorId, sku: configState.selectedBaseSku } : null),
    [vehicle, configState],
  );
  const { result: fitmentResult } = useProductFitment(fitmentRequest);

  return (
    <div data-testid="configurator-experience">
      <VehicleConfigurationSummary />

      <ConfiguratorModule
        configuratorData={configuratorData}
        verticalId={verticalId}
        categoryId={categoryId}
        onConfigurationChange={setConfigState}
      />

      {configState?.selectedBaseSku && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ConfiguratorSummaryPanel
              configuratorData={configuratorData}
              configState={configState}
              fitmentResult={fitmentResult}
              packageId={packageId}
            />
            <ConfiguratorFitmentFeedback configuratorId={configState.configuratorId} sku={configState.selectedBaseSku} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ConfiguratorPricingSummary configState={configState} />
            <ConfiguratorCommerceActions configState={configState} verticalId={verticalId} categoryId={categoryId} />
          </div>
        </div>
      )}
    </div>
  );
}
