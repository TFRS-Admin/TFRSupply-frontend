import type { Configurator } from '@/types';

export interface ConfiguratorService {
  getConfigurator(configuratorId: string): Promise<Configurator | null>;
  listConfigurators(): Promise<Configurator[]>;
}

export const configuratorService: ConfiguratorService = {
  async getConfigurator(): Promise<Configurator | null> {
    throw new Error('Not implemented');
  },
  async listConfigurators(): Promise<Configurator[]> {
    throw new Error('Not implemented');
  },
};
