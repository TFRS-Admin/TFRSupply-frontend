import type { Category } from '@/types';
import { categorySchema } from '@/schemas';
import { normalizeCategory } from '../validators/normalizers';
import { validateProductData } from '../validators/validateSchema';
import { collectDataFiles, findDataFile } from './moduleRegistry';

const categoryModules = import.meta.glob('../categories/*.json', { eager: true });

function categoryContext(filename: string, raw: unknown) {
  const record = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};

  return {
    filename,
    id: typeof record.id === 'string' ? record.id : undefined,
  };
}

export function loadTypedCategory(categoryId: string): Category | null {
  const file = findDataFile(categoryModules, categoryId);
  if (!file) return null;

  return validateProductData(categorySchema, normalizeCategory(file.data), categoryContext(file.filename, file.data));
}

export function listTypedCategories(): Category[] {
  return collectDataFiles(categoryModules).map((file) => (
    validateProductData(categorySchema, normalizeCategory(file.data), categoryContext(file.filename, file.data))
  ));
}
