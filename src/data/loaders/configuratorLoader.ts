import type { Configurator } from '@/types';
import { configuratorSchema } from '@/schemas';
import { normalizeConfigurator } from '../validators/normalizers';
import { validateProductData } from '../validators/validateSchema';
import { collectDataFiles, findDataFile } from './moduleRegistry';

const configuratorModules = import.meta.glob('../configurators/*.json', { eager: true });

function configuratorContext(filename: string, raw: unknown) {
  const record = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const skuOptions = Array.isArray(record.skuOptions) ? record.skuOptions : [];
  const firstSku = skuOptions.find((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object');

  return {
    filename,
    productId: typeof record.productId === 'string' ? record.productId : undefined,
    id: typeof record.id === 'string' ? record.id : undefined,
    sku: typeof firstSku?.sku === 'string' ? firstSku.sku : undefined,
  };
}

export function loadTypedConfigurator(configuratorId: string): Configurator | null {
  const file = findDataFile(configuratorModules, configuratorId);
  if (!file) return null;

  return validateProductData(
    configuratorSchema,
    normalizeConfigurator(file.data),
    configuratorContext(file.filename, file.data),
  );
}

export function listTypedConfigurators(): Configurator[] {
  return collectDataFiles(configuratorModules).map((file) => (
    validateProductData(
      configuratorSchema,
      normalizeConfigurator(file.data),
      configuratorContext(file.filename, file.data),
    )
  ));
}
