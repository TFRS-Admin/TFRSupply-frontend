/**
 * dataLoader.js
 * Central data loading utility. All templates load JSON through here.
 * Never import JSON directly in page templates.
 */

// Dynamic imports for all data modules
const verticalModules = import.meta.glob('../data/verticals/*.json', { eager: true });
const categoryModules = import.meta.glob('../data/categories/*.json', { eager: true });
const productModules  = import.meta.glob('../data/products/*.json',  { eager: true });
const vendorModules   = import.meta.glob('../data/vendors/*.json',   { eager: true });

function extractDefault(modules, id) {
  const key = Object.keys(modules).find(k => k.endsWith(`/${id}.json`));
  if (!key) return null;
  return modules[key]?.default ?? modules[key] ?? null;
}

export function loadVertical(verticalId) {
  return extractDefault(verticalModules, verticalId);
}

export function loadCategory(categoryId) {
  return extractDefault(categoryModules, categoryId);
}

export function loadProduct(productId) {
  return extractDefault(productModules, productId);
}

export function loadVendor(vendorId) {
  return extractDefault(vendorModules, vendorId);
}

export function listVerticals() {
  return Object.values(verticalModules).map(m => m?.default ?? m).filter(Boolean);
}

export function listCategories() {
  return Object.values(categoryModules).map(m => m?.default ?? m).filter(Boolean);
}

export function listProducts() {
  return Object.values(productModules).map(m => m?.default ?? m).filter(Boolean);
}