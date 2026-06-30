import type { Vertical } from '@/types';
import { verticalSchema } from '@/schemas';
import { normalizeVertical } from '../validators/normalizers';
import { validateProductData } from '../validators/validateSchema';
import { collectDataFiles, findDataFile } from './moduleRegistry';

const verticalModules = import.meta.glob('../verticals/*.json', { eager: true });

function verticalContext(filename: string, raw: unknown) {
  const record = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};

  return {
    filename,
    id: typeof record.id === 'string' ? record.id : undefined,
  };
}

export function loadTypedVertical(verticalId: string): Vertical | null {
  const file = findDataFile(verticalModules, verticalId);
  if (!file) return null;

  return validateProductData(verticalSchema, normalizeVertical(file.data), verticalContext(file.filename, file.data));
}

export function listTypedVerticals(): Vertical[] {
  return collectDataFiles(verticalModules).map((file) => (
    validateProductData(verticalSchema, normalizeVertical(file.data), verticalContext(file.filename, file.data))
  ));
}
