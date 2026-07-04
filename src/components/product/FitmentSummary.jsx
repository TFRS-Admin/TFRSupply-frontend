import React, { useMemo } from 'react';
import { Box, CheckCircle2, Gauge, HelpCircle, ShieldAlert, Truck } from 'lucide-react';
import { useVehicle } from '@/context/VehicleContext';
import { useProductFitment } from '@/hooks/vehicleFitment';
import { usePackageDefinition } from '@/hooks/packageBuilder';
import SectionHeading from '@/components/product/SectionHeading';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const STATUS_META = {
  compatible: { icon: CheckCircle2, color: '#16a34a', label: 'Compatible with your selected vehicle' },
  incompatible: { icon: ShieldAlert, color: '#c8102e', label: 'Not compatible with your selected vehicle' },
  unknown: { icon: HelpCircle, color: '#888', label: 'Vehicle compatibility not yet confirmed' },
};

/**
 * Builds a schema-valid Vehicle record from the lightweight selection stored
 * in VehicleContext (vehicleId/year/make/model strings), so the existing
 * Vehicle Fitment Service can validate and evaluate it.
 */
function toFitmentVehicle(selectedVehicle) {
  if (!selectedVehicle?.vehicleId) return null;
  const yearValue = Number.parseInt(selectedVehicle.year, 10);
  if (!Number.isFinite(yearValue)) return null;

  return {
    id: selectedVehicle.vehicleId,
    label: `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`,
    make: { id: selectedVehicle.make, label: selectedVehicle.make, slug: selectedVehicle.make.toLowerCase() },
    model: {
      id: selectedVehicle.vehicleId,
      label: selectedVehicle.model,
      slug: selectedVehicle.vehicleId.toLowerCase(),
      makeId: selectedVehicle.make,
    },
    year: { value: yearValue, label: selectedVehicle.year },
  };
}

function RelatedPackageLabel({ packageId }) {
  const { data } = usePackageDefinition(packageId);
  return <li style={{ fontSize: 13, color: '#3d3d3d', lineHeight: 1.7 }}>{data?.label ?? packageId}</li>;
}

/**
 * Fitment Summary — composes the Vehicle Fitment Service and Package Builder
 * Foundation to show supported vehicle types, compatible packages, and a
 * live compatibility summary against the customer's selected vehicle.
 */
export default function FitmentSummary({ product }) {
  const { selectedVehicle } = useVehicle();
  const vehicle = useMemo(() => toFitmentVehicle(selectedVehicle), [selectedVehicle]);

  const fitmentRequest = useMemo(
    () => (vehicle ? { vehicle, productId: product.id, sku: product.sku } : null),
    [vehicle, product.id, product.sku],
  );
  const { result: fitmentResult, loading: fitmentLoading } = useProductFitment(fitmentRequest);

  const vehicleTypes = useMemo(() => {
    const applications = product.marketing?.applications ?? [];
    return Array.from(new Set(applications));
  }, [product.marketing]);

  const packageIds = product.commerce?.related_packages ?? [];

  if (!vehicleTypes.length && !packageIds.length) return null;

  const statusMeta = fitmentResult ? STATUS_META[fitmentResult.status] ?? STATUS_META.unknown : null;
  const StatusIcon = statusMeta?.icon;

  return (
    <div className="border-t border-gray-200 bg-white" id="fitment">
      <div className="max-w-7xl mx-auto px-6 py-8 sm:py-10">
        <SectionHeading description="Confirm which vehicles this product supports and check it against your selected fleet vehicle.">
          Vehicle Fitment
        </SectionHeading>

        <div className="pd-fitment-grid grid grid-cols-1 md:grid-cols-3 gap-10" style={FS}>
          {vehicleTypes.length > 0 && (
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Truck size={16} style={{ color: '#c8102e' }} /> Supported Vehicle Types
              </h3>
              <ul style={{ fontSize: 13, color: '#444', lineHeight: 1.8, paddingLeft: '1.25rem', margin: 0 }}>
                {vehicleTypes.map((type) => <li key={type}>{type}</li>)}
              </ul>
            </div>
          )}

          {packageIds.length > 0 && (
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Box size={16} style={{ color: '#c8102e' }} /> Compatible Packages
              </h3>
              <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                {packageIds.map((packageId) => <RelatedPackageLabel key={packageId} packageId={packageId} />)}
              </ul>
            </div>
          )}

          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Gauge size={16} style={{ color: '#c8102e' }} /> Vehicle Compatibility Summary
            </h3>
            {!selectedVehicle && (
              <p style={{ fontSize: 13, color: '#888', lineHeight: 1.7 }}>
                Select a vehicle from the header to check compatibility with your fleet.
              </p>
            )}
            {selectedVehicle && fitmentLoading && (
              <p style={{ fontSize: 13, color: '#888' }}>Checking compatibility…</p>
            )}
            {selectedVehicle && !fitmentLoading && fitmentResult && (
              <div>
                <p style={{ fontSize: 13, color: statusMeta.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  {StatusIcon && <StatusIcon size={15} />} {statusMeta.label}
                </p>
                <p style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>
                  {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                </p>
                {fitmentResult.issues?.map((issue) => (
                  <p key={issue.code} style={{ fontSize: 12, color: '#999' }}>{issue.message}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { toFitmentVehicle };
