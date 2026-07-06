import type { BaseEntity, Money } from './common';
import type { Fitment } from './vehicle';

export interface DependencyRule {
  sourceOptionId: string;
  targetOptionId: string;
  condition: string;
  message?: string;
}

export interface CompatibilityRule {
  id: string;
  optionIds: string[];
  fitment?: Fitment;
  compatible: boolean;
  message?: string;
}

export interface SKUOption extends BaseEntity {
  sku: string;
  attributes?: Record<string, string>;
  priceAdjustment?: Money;
}

export interface ConfiguratorOption extends BaseEntity {
  skuOption?: SKUOption;
  selectedByDefault?: boolean;
  dependencyRules?: DependencyRule[];
  compatibilityRules?: CompatibilityRule[];
  skuSegment?: string;
  _verification?: string;
  /** Accessory IDs (from a sibling accessories section) automatically included when this option is selected. */
  auto_bundle?: string[];
  warning?: string;
}

export interface ConfiguratorStep extends BaseEntity {
  required?: boolean;
  skuSegmentKey?: string;
  _verification?: string;
  options: ConfiguratorOption[];
  /** Keyed by a restricting option's label (from this or a prior step); value is the option labels this step allows when that key is selected. */
  dependencies?: Record<string, string[]>;
}

export interface ConfiguratorAccessoryItem extends BaseEntity {
  sku?: string;
  price?: number;
  type?: string;
  _note?: string;
}

export interface ConfiguratorSection extends BaseEntity {
  sortOrder: number;
  options: ConfiguratorOption[];
  steps?: ConfiguratorStep[];
  items?: ConfiguratorAccessoryItem[];
}

export interface ConfiguratorSkuOption {
  sku: string;
  description?: string;
  price?: number;
  attributes: Record<string, string>;
}

export interface ConfiguratorVehicleRule {
  vehicleId?: string;
  displayName?: string;
  recommendedLength?: string;
}

export interface DependencyMatrixCondition {
  step: string;
  option: string[];
}

export interface DependencyMatrixEffect {
  step?: string;
  limitOptionsTo?: string[];
  disables?: string[];
  disableOptionsUnless?: {
    option: string;
    exceptionStep: string;
    exceptionOption: string;
  };
  warn?: boolean;
}

export interface DependencyMatrixRule {
  id: string;
  if: DependencyMatrixCondition;
  then: DependencyMatrixEffect;
  message?: string;
}

export interface Configurator extends BaseEntity {
  productId: string;
  verticalIds: string[];
  sections: ConfiguratorSection[];
  sectionMap?: Record<string, ConfiguratorSection>;
  skuOptions?: ConfiguratorSkuOption[];
  vehicleRules?: ConfiguratorVehicleRule[];
  productFamily?: string;
  priceDisplay?: string;
  dependencyRules?: DependencyRule[];
  compatibilityRules?: CompatibilityRule[];
  /** Dependency-driven configurator extensions (TFRSupplyConfiguratorSettings spec). */
  family?: string;
  collection?: string;
  pricing_model?: string;
  dependencyMatrix?: DependencyMatrixRule[];
}
