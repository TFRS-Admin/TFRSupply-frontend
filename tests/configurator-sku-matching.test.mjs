import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'vite';

let server;
let modules;

before(async () => {
  server = await createServer({ logLevel: 'error' });
  modules = {
    configuratorModule: await server.ssrLoadModule('/src/components/configurator/ConfiguratorModule.tsx'),
  };
});

after(async () => {
  await server?.close();
});

describe('filterSkus', () => {
  // A confirmed step (length) strictly filters on an exact attribute match.
  // A non-confirmed step (color) only filters when at least one known SKU
  // actually carries the selected attribute value — otherwise it passes
  // through unfiltered, per filterSkus's `anyMatch` fallback.
  const steps = [
    {
      id: 'step-length',
      label: 'Length',
      skuSegmentKey: 'length',
      _verification: 'confirmed',
      options: [
        { id: 'len-45', label: '45"', skuSegment: '45' },
        { id: 'len-53', label: '53"', skuSegment: '53' },
      ],
    },
    {
      id: 'step-color',
      label: 'Color',
      skuSegmentKey: 'color',
      options: [
        { id: 'color-red', label: 'Red', skuSegment: 'red' },
        { id: 'color-blue', label: 'Blue', skuSegment: 'blue' },
        { id: 'color-green', label: 'Green', skuSegment: 'green' },
      ],
    },
  ];

  const skuOptions = [
    { sku: 'SKU-45-RED', attributes: { length: '45', color: 'red' } },
    { sku: 'SKU-45-BLUE', attributes: { length: '45', color: 'blue' } },
    { sku: 'SKU-53-RED', attributes: { length: '53', color: 'red' } },
  ];

  it('returns every SKU when no selections have been made', () => {
    const { filterSkus } = modules.configuratorModule;
    const result = filterSkus(skuOptions, {}, steps);
    assert.deepEqual(result.map(s => s.sku), ['SKU-45-RED', 'SKU-45-BLUE', 'SKU-53-RED']);
  });

  it('strictly filters on a confirmed step', () => {
    const { filterSkus } = modules.configuratorModule;
    const result = filterSkus(skuOptions, { 'step-length': 'len-45' }, steps);
    assert.deepEqual(result.map(s => s.sku).sort(), ['SKU-45-BLUE', 'SKU-45-RED']);
  });

  it('filters on a non-confirmed step once a matching SKU exists for that value', () => {
    const { filterSkus } = modules.configuratorModule;
    const result = filterSkus(skuOptions, { 'step-color': 'color-red' }, steps);
    assert.deepEqual(result.map(s => s.sku).sort(), ['SKU-45-RED', 'SKU-53-RED']);
  });

  it('passes every SKU through a non-confirmed step when no SKU carries that value', () => {
    const { filterSkus } = modules.configuratorModule;
    const result = filterSkus(skuOptions, { 'step-color': 'color-green' }, steps);
    assert.deepEqual(result.map(s => s.sku).sort(), ['SKU-45-BLUE', 'SKU-45-RED', 'SKU-53-RED']);
  });

  it('ignores a selection whose option id is not recognized by the step', () => {
    const { filterSkus } = modules.configuratorModule;
    const result = filterSkus(skuOptions, { 'step-color': 'not-a-real-option' }, steps);
    assert.deepEqual(result.map(s => s.sku).sort(), ['SKU-45-BLUE', 'SKU-45-RED', 'SKU-53-RED']);
  });

  it('narrows correctly when a confirmed and a non-confirmed selection combine', () => {
    const { filterSkus } = modules.configuratorModule;
    const result = filterSkus(
      skuOptions,
      { 'step-length': 'len-45', 'step-color': 'color-red' },
      steps,
    );
    assert.deepEqual(result.map(s => s.sku), ['SKU-45-RED']);
  });
});

describe('wouldHaveMatches', () => {
  const steps = [
    {
      id: 'step-length',
      label: 'Length',
      skuSegmentKey: 'length',
      _verification: 'confirmed',
      options: [
        { id: 'len-45', label: '45"', skuSegment: '45' },
        { id: 'len-53', label: '53"', skuSegment: '53' },
      ],
    },
  ];

  const skuOptions = [
    { sku: 'SKU-45', attributes: { length: '45' } },
  ];

  it('returns true when the hypothetical selection still leaves at least one match', () => {
    const { wouldHaveMatches } = modules.configuratorModule;
    assert.equal(wouldHaveMatches(skuOptions, {}, steps, 'step-length', 'len-45'), true);
  });

  it('returns false when the hypothetical selection would leave zero matches', () => {
    const { wouldHaveMatches } = modules.configuratorModule;
    assert.equal(wouldHaveMatches(skuOptions, {}, steps, 'step-length', 'len-53'), false);
  });
});

describe('findMatchingHkbKit', () => {
  const kits = [
    { sku: 'HKB-FORD-F150-A', vehicle: 'Ford F-150', roof_width: 'std', compatible_lengths: ['44"', '48"'] },
    { sku: 'HKB-FORD-F150-B', vehicle: 'Ford F-150', roof_width: 'std', compatible_lengths: ['51"', '53"'] },
    { sku: 'HKB-CHEVY-TAHOE', vehicle: 'Chevrolet Tahoe PPV / SSV', roof_width: 'std', compatible_lengths: ['45"'] },
  ];

  it('returns null when no vehicle is selected', () => {
    const { findMatchingHkbKit } = modules.configuratorModule;
    assert.equal(findMatchingHkbKit(kits, null, '45'), null);
  });

  it('returns null when the vehicle is missing a model', () => {
    const { findMatchingHkbKit } = modules.configuratorModule;
    assert.equal(findMatchingHkbKit(kits, { make: 'Ford' }, '45'), null);
  });

  it('returns null when there is no resolved length attribute yet', () => {
    const { findMatchingHkbKit } = modules.configuratorModule;
    assert.equal(findMatchingHkbKit(kits, { make: 'Ford', model: 'F-150' }, null), null);
  });

  it('matches the kit whose compatible_lengths includes the resolved length', () => {
    const { findMatchingHkbKit } = modules.configuratorModule;
    const kit = findMatchingHkbKit(kits, { make: 'Ford', model: 'F-150' }, '44');
    assert.equal(kit?.sku, 'HKB-FORD-F150-A');
  });

  it('disambiguates between two kits for the same vehicle by length', () => {
    const { findMatchingHkbKit } = modules.configuratorModule;
    const kit = findMatchingHkbKit(kits, { make: 'Ford', model: 'F-150' }, '53');
    assert.equal(kit?.sku, 'HKB-FORD-F150-B');
  });

  it('matches using only the first word of a multi-word model', () => {
    const { findMatchingHkbKit } = modules.configuratorModule;
    const kit = findMatchingHkbKit(kits, { make: 'Chevrolet', model: 'Tahoe PPV / SSV' }, '45');
    assert.equal(kit?.sku, 'HKB-CHEVY-TAHOE');
  });

  it('returns null when the vehicle has no matching kit at all', () => {
    const { findMatchingHkbKit } = modules.configuratorModule;
    assert.equal(findMatchingHkbKit(kits, { make: 'Toyota', model: 'Tundra' }, '45'), null);
  });

  it('returns null when the vehicle matches but the length does not', () => {
    const { findMatchingHkbKit } = modules.configuratorModule;
    assert.equal(findMatchingHkbKit(kits, { make: 'Ford', model: 'F-150' }, '99'), null);
  });
});
