import type { Product } from '@/types';
import { productSchema } from '@/schemas';
import { normalizeProduct } from '../validators/normalizers';
import { validateProductData } from '../validators/validateSchema';
import { collectDataFiles, findDataFile } from './moduleRegistry';

const productModules = import.meta.glob('../products/*.json', { eager: true });

function productContext(filename: string, raw: unknown) {
  const record = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const commerce = record.commerce && typeof record.commerce === 'object' ? record.commerce as Record<string, unknown> : {};
  const skuTable = Array.isArray(commerce.sku_table) ? commerce.sku_table : [];
  const firstSku = skuTable.find((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object');

  return {
    filename,
    productId: typeof record.id === 'string' ? record.id : undefined,
    id: typeof record.id === 'string' ? record.id : undefined,
    sku: typeof commerce.sku_root === 'string' ? commerce.sku_root : typeof firstSku?.sku === 'string' ? firstSku.sku : undefined,
  };
}

export function loadTypedProduct(productId: string): Product | null {
  const file = findDataFile(productModules, productId);
  if (!file) return null;

  return validateProductData(productSchema, normalizeProduct(file.data), productContext(file.filename, file.data));
}

export function listTypedProducts(): Product[] {
  return collectDataFiles(productModules).map((file) => (
    validateProductData(productSchema, normalizeProduct(file.data), productContext(file.filename, file.data))
  ));
}
