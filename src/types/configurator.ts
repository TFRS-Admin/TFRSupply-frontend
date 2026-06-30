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
}

export interface ConfiguratorSection extends BaseEntity {
  sortOrder: number;
  options: ConfiguratorOption[];
}

export interface Configurator extends BaseEntity {
  productId: string;
  verticalIds: string[];
  sections: ConfiguratorSection[];
  dependencyRules?: DependencyRule[];
  compatibilityRules?: CompatibilityRule[];
}
