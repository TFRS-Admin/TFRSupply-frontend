import { useMemo } from 'react';
import { configuratorService } from '@/services/configurator';
import type { Configurator } from '@/types';

export interface ConfiguratorResourceState {
  data: Configurator | null;
  loading: false;
  error: null;
}

export interface ConfiguratorListResourceState {
  data: Configurator[];
  loading: false;
  error: null;
}

export function useConfiguratorData(configuratorId: string | null | undefined): ConfiguratorResourceState {
  return useMemo(() => ({
    data: configuratorId ? configuratorService.getConfigurator(configuratorId) : null,
    loading: false,
    error: null,
  }), [configuratorId]);
}

export function useConfiguratorList(): ConfiguratorListResourceState {
  return useMemo(() => ({
    data: configuratorService.listConfigurators(),
    loading: false,
    error: null,
  }), []);
}
