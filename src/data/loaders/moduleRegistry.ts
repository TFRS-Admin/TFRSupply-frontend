export interface JsonModule {
  default?: unknown;
}

export interface DataFile<T = unknown> {
  id: string;
  filename: string;
  data: T;
}

export function moduleValue(module: JsonModule | unknown): unknown {
  return module && typeof module === 'object' && 'default' in module
    ? (module as JsonModule).default
    : module;
}

export function idFromFilename(filename: string): string {
  return filename.split('/').pop()?.replace(/\.json$/, '') ?? filename;
}

export function collectDataFiles(modules: Record<string, JsonModule | unknown>): DataFile[] {
  return Object.entries(modules).map(([filename, module]) => ({
    id: idFromFilename(filename),
    filename,
    data: moduleValue(module),
  }));
}

export function findDataFile(modules: Record<string, JsonModule | unknown>, id: string): DataFile | null {
  return collectDataFiles(modules).find((file) => file.id === id) ?? null;
}
