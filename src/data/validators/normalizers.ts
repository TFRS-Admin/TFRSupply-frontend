import type { Category, Configurator, ConfiguratorOption, ConfiguratorSection, Product, Specification, Vertical } from '@/types';

interface RawRecord {
  [key: string]: unknown;
}

function asRecord(value: unknown): RawRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as RawRecord : {};
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function titleFromRaw(raw: RawRecord): string {
  return asString(raw.title, asString(raw.label, asString(raw.id)));
}


function normalizeLinkAction(value: unknown) {
  const record = asRecord(value);
  const label = asString(record.label);
  const href = asString(record.href);

  return label && href ? { label, href } : undefined;
}

function normalizeVerticalCardItem(value: unknown) {
  const record = asRecord(value);

  return {
    label: asString(record.label),
    desc: asString(record.desc, undefined),
    image: asString(record.image, undefined),
    imageAlt: asString(record.imageAlt, undefined),
    href: asString(record.href, undefined),
    icon: asString(record.icon, undefined),
    categoryId: typeof record.categoryId === 'string' ? record.categoryId : record.categoryId === null ? null : undefined,
    tagline: asString(record.tagline, undefined),
    external: typeof record.external === 'boolean' ? record.external : undefined,
  };
}

function normalizeVerticalSection(value: unknown) {
  const record = asRecord(value);
  const title = asString(record.title);
  const items = Array.isArray(record.items) ? record.items.map(normalizeVerticalCardItem) : [];

  if (!title) return undefined;

  return {
    eyebrow: asString(record.eyebrow, undefined),
    title,
    subtitle: asString(record.subtitle, undefined),
    body: asString(record.body, undefined),
    cta: normalizeLinkAction(record.cta),
    items,
  };
}

function normalizeVerticalArticle(value: unknown) {
  const record = asRecord(value);
  const title = asString(record.title);

  if (!title) return undefined;

  return {
    eyebrow: asString(record.eyebrow, undefined),
    title,
    body: asString(record.body, undefined),
    image: asString(record.image, undefined),
    imageAlt: asString(record.imageAlt, undefined),
    cta: normalizeLinkAction(record.cta),
  };
}

function normalizeVerticalHero(value: unknown) {
  const record = asRecord(value);

  if (Object.keys(record).length === 0) return undefined;

  return {
    title: asString(record.title, undefined),
    subtitle: asString(record.subtitle, undefined),
    image: asString(record.image, undefined),
    imageAlt: asString(record.imageAlt, undefined),
    cta: normalizeLinkAction(record.cta),
  };
}

export function normalizeProduct(rawValue: unknown): Product {
  const raw = asRecord(rawValue);
  const media = asRecord(raw.media);
  const marketing = asRecord(raw.marketing);
  const specifications = asRecord(raw.specifications);
  const gallery = Array.isArray(media.gallery) ? media.gallery : [];
  const features = asStringArray(marketing.features).map((feature, index) => ({
    id: `${asString(raw.id, 'product')}-feature-${index + 1}`,
    label: feature,
    sortOrder: index + 1,
  }));
  const specificationEntries: Specification[] = Object.entries(specifications).map(([key, value]) => ({
    id: key,
    label: key,
    value: Array.isArray(value) ? value.join(', ') : typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? value : String(value),
  }));

  return {
    id: asString(raw.id),
    label: titleFromRaw(raw),
    description: asString(raw.description, undefined),
    slug: asString(raw.slug, asString(raw.id)),
    sku: asString(asRecord(raw.commerce).sku_root, undefined),
    familyId: asString(raw.product_family, undefined),
    verticalIds: asStringArray(raw.verticals),
    categoryIds: asString(raw.category) ? [asString(raw.category)] : [],
    features,
    specifications: specificationEntries,
    images: gallery.map((item, index) => {
      const image = asRecord(item);
      return {
        id: `${asString(raw.id, 'product')}-image-${index + 1}`,
        src: asString(image.src, asString(media.hero)),
        alt: asString(image.alt, titleFromRaw(raw)),
      };
    }),
  };
}

export function normalizeCategory(rawValue: unknown): Category {
  const raw = asRecord(rawValue);
  const verticals = asStringArray(raw.verticals);
  const hero = asRecord(raw.hero);
  const filters = Array.isArray(raw.filters) ? raw.filters.map((filter) => {
    const filterRecord = asRecord(filter);
    return {
      id: asString(filterRecord.id),
      label: asString(filterRecord.label, asString(filterRecord.id)),
      options: asStringArray(filterRecord.options),
    };
  }) : undefined;
  const products = Array.isArray(raw.products) ? raw.products.map((product) => {
    const productRecord = asRecord(product);
    const normalized: Record<string, string | string[] | undefined> = {};

    Object.entries(productRecord).forEach(([key, value]) => {
      if (typeof value === 'string') {
        normalized[key] = value;
      } else if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
        normalized[key] = value;
      }
    });

    return {
      ...normalized,
      id: asString(productRecord.id),
      label: asString(productRecord.label, asString(productRecord.id)),
    };
  }) : undefined;
  const breadcrumbs = Array.isArray(raw.breadcrumbs) ? raw.breadcrumbs.map((crumb) => {
    const crumbRecord = asRecord(crumb);
    return {
      label: asString(crumbRecord.label),
      to: asString(crumbRecord.to, undefined),
    };
  }) : undefined;

  return {
    id: asString(raw.id),
    label: asString(raw.label, asString(raw.id)),
    description: asString(raw.description, undefined),
    slug: asString(raw.id),
    verticalId: verticals[0] ?? '',
    image: asString(hero.image) ? {
      src: asString(hero.image),
      alt: asString(hero.imageAlt, asString(raw.label, asString(raw.id))),
    } : undefined,
    hero: Object.keys(hero).length > 0 ? {
      title: asString(hero.title, undefined),
      subtitle: asString(hero.subtitle, undefined),
      image: asString(hero.image, undefined),
      imageAlt: asString(hero.imageAlt, undefined),
    } : undefined,
    filters,
    products,
    breadcrumbs,
  };
}

export function normalizeVertical(rawValue: unknown): Vertical {
  const raw = asRecord(rawValue);

  return {
    id: asString(raw.id),
    label: asString(raw.label, asString(raw.id)),
    slug: asString(raw.id),
    hero: normalizeVerticalHero(raw.hero),
    featured_article: normalizeVerticalArticle(raw.featured_article),
    featured_products_section: normalizeVerticalSection(raw.featured_products_section),
    categories_section: normalizeVerticalSection(raw.categories_section),
    configurators_section: normalizeVerticalSection(raw.configurators_section),
    contracts_section: normalizeVerticalSection(raw.contracts_section),
    resources_section: normalizeVerticalSection(raw.resources_section),
  };
}

function normalizeConfiguratorOption(rawOption: unknown, productId: string, sectionId: string, index: number): ConfiguratorOption {
  const option = asRecord(rawOption);
  const sku = asString(option.sku);

  return {
    id: asString(option.id, sku || `${sectionId}-option-${index + 1}`),
    label: asString(option.label, asString(option.description, sku || `${sectionId} option ${index + 1}`)),
    description: asString(option.description, undefined),
    skuOption: sku ? {
      id: `${productId}-${sku}`,
      label: asString(option.description, sku),
      sku,
      attributes: asRecord(option.attributes) as Record<string, string>,
    } : undefined,
  };
}

export function normalizeConfigurator(rawValue: unknown): Configurator {
  const raw = asRecord(rawValue);
  const productId = asString(raw.productId);
  const rawSections = asRecord(raw.sections);
  const sections: ConfiguratorSection[] = Object.entries(rawSections).map(([sectionId, sectionValue], sectionIndex) => {
    const section = asRecord(sectionValue);
    const stepOptions = Array.isArray(section.steps)
      ? section.steps.flatMap((step, stepIndex) => {
        const stepRecord = asRecord(step);
        const options = Array.isArray(stepRecord.options) ? stepRecord.options : [];
        return options.map((option, optionIndex) => normalizeConfiguratorOption(
          option,
          productId,
          asString(stepRecord.id, `${sectionId}-step-${stepIndex + 1}`),
          optionIndex,
        ));
      })
      : [];
    const skuOptions = sectionId === 'skuSelector' && Array.isArray(raw.skuOptions)
      ? raw.skuOptions.map((option, optionIndex) => normalizeConfiguratorOption(option, productId, sectionId, optionIndex))
      : [];

    return {
      id: sectionId,
      label: asString(section.label, sectionId),
      description: asString(section.description, undefined),
      sortOrder: sectionIndex + 1,
      options: [...skuOptions, ...stepOptions],
    };
  });

  return {
    id: asString(raw.id),
    label: asString(raw.label, asString(raw.id)),
    description: asString(raw._note, undefined),
    productId,
    verticalIds: [],
    sections,
  };
}
