import type { ShopifyVariantAvailability } from './shopifyVariantResolver';

/**
 * The loose vehicle shape read from VehicleContext (year/make/model/trim as
 * plain display strings) — distinct from the formal `Vehicle` domain type
 * (make/model/year modeled as catalog entities) used by the Vehicle Fitment
 * Service. `toFitmentVehicle()` converts one into the other.
 */
export interface ConfiguratorVehicleSelection {
  year?: string | number;
  make?: string;
  model?: string;
  trim?: string;
}

export type ConfiguratorCommerceLineStatus = 'matched' | 'price_only' | 'unmatched';

/** A required (non-optional) package component — always part of the configuration, never toggled by the customer. */
export interface ConfiguratorRequiredComponent {
  sku: string;
  label: string;
  price: number | null;
}

export interface ConfiguratorCommerceLine {
  sku: string;
  shopifyVariantId: string | null;
  shopifyProductId: string | null;
  price: number | null;
  status: ConfiguratorCommerceLineStatus;
}

/**
 * Emitted by ConfiguratorModule's onConfigurationChange once the current
 * filter selections resolve to a single base SKU. Consumed by
 * ConfiguratorExperience and the panels it composes (Summary, Pricing,
 * Fitment Feedback, Commerce Actions) — none of them recompute it, they only
 * read it.
 */
export interface ConfiguratorQuotePayload {
  verticalId?: string;
  categoryId?: string;
  productFamily?: string;
  configuratorId?: string;
  selectedVehicle: Pick<ConfiguratorVehicleSelection, 'year' | 'make' | 'model'> | null;
  selectedBaseSku: string;
  /** stepId → selected optionId. Multi-select accessories are tracked separately in `accessorySkus`, never here. */
  selectedFilters: Record<string, string>;
  shopifyVariantId: string | null;
  availability: ShopifyVariantAvailability;
  basePrice: number | null;
  accessorySkus: string[];
  commerceLines: ConfiguratorCommerceLine[];
  reviewFlags: string[];
  checkoutReady: boolean;
  /** Required package components with a resolved SKU — always included, never customer-toggled (see Package Quote panel's "Required Components" section). */
  requiredComponents: ConfiguratorRequiredComponent[];
}
