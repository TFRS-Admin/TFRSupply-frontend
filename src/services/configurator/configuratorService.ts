import type { Configurator } from '@/types';
import {
  listTypedConfigurators,
  loadTypedConfigurator,
} from '@/data/loaders';

export interface ConfiguratorService {
  getConfigurator(configuratorId: string): Configurator | null;
  listConfigurators(): Configurator[];
}

export const configuratorService: ConfiguratorService = {
  getConfigurator(configuratorId: string): Configurator | null {
    return loadTypedConfigurator(configuratorId);
  },
  listConfigurators(): Configurator[] {
    return listTypedConfigurators();
  },
};
