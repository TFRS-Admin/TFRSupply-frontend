import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

let server;
let modules;

before(async () => {
  server = await createServer({ logLevel: 'error' });
  modules = {
    service: await server.ssrLoadModule('/src/services/packageBuilder/packageBuilderService.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/packageBuilder/usePackageBuilder.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/package.schema.ts'),
  };
});

after(async () => {
  await server?.close();
});

const accessory = { id: 'acc-bracket', label: 'Mounting Bracket', sku: 'BRACKET-1', requirement: 'required', quantity: 1 };
const packageDefinition = {
  id: 'pkg-installer-1',
  label: 'Installer Package',
  verticalIds: ['police'],
  vehicleIds: ['vehicle-1'],
  metadata: { packageType: 'installer', revision: '1' },
  lines: [{ id: 'line-1', product: accessory, quantity: 1, required: true, itemType: 'accessory', sku: 'BRACKET-1' }],
  requiredAccessories: [accessory],
  optionalAccessories: [{ ...accessory, id: 'acc-trim', label: 'Trim Ring', requirement: 'optional' }],
};

function renderHookProbe(useHook, arg) {
  function HookProbe() {
    const state = useHook(arg);
    return React.createElement('span', {
      'data-loading': String(state.loading),
      'data-has-data': String(Boolean(state.data)),
      'data-has-error': String(Boolean(state.error)),
    });
  }
  return renderToString(React.createElement(HookProbe));
}

describe('package builder foundation service', () => {
  it('returns inert pending assembly and validation until package data is connected', async () => {
    const { packageBuilderService } = modules.service;

    const definition = await packageBuilderService.getPackageDefinition('pkg-installer-1');
    const assembly = await packageBuilderService.assemblePackage({ packageId: 'pkg-installer-1' });
    const validation = await packageBuilderService.validatePackage({ packageId: 'pkg-installer-1' });

    assert.equal(definition, null);
    assert.equal(assembly.status, 'pending');
    assert.equal(assembly.package, null);
    assert.equal(assembly.compatibility.status, 'unknown');
    assert.equal(validation.valid, false);
  });

  it('validates package assembly input before invoking injected adapters', async () => {
    const { createPackageBuilderService } = modules.service;
    const service = createPackageBuilderService({
      async getPackageDefinition() { return packageDefinition; },
      async assemblePackage(input) {
        return {
          status: 'assembled',
          package: input.definition,
          compatibility: { status: 'compatible', compatible: true, issues: [] },
          selectedOptionalAccessories: input.definition.optionalAccessories,
          requiredAccessories: input.definition.requiredAccessories,
        };
      },
      async validatePackage() { return { valid: true, issues: [] }; },
    });

    assert.throws(() => service.assemblePackage({ definition: { ...packageDefinition, lines: [] } }), /Array must contain at least 1/);
    const result = await service.assemblePackage({ definition: packageDefinition, selectedOptionalAccessoryIds: ['acc-trim'] });
    assert.equal(result.status, 'assembled');
    assert.equal(result.requiredAccessories[0].id, 'acc-bracket');
  });
});

describe('package builder schemas and hooks', () => {
  it('validates package definitions, optional accessories, required accessories, metadata, and compatibility issues', () => {
    const { packageDefinitionSchema, packageCompatibilityResultSchema } = modules.schemas;

    const parsed = packageDefinitionSchema.parse(packageDefinition);
    const compatibility = packageCompatibilityResultSchema.parse({
      status: 'requires-review',
      compatible: false,
      issues: [{ code: 'FITMENT_REVIEW', severity: 'review-required', message: 'Vehicle fitment requires review.', vehicleId: 'vehicle-1' }],
    });

    assert.equal(parsed.metadata.packageType, 'installer');
    assert.equal(parsed.requiredAccessories?.[0].requirement, 'required');
    assert.equal(parsed.optionalAccessories?.[0].requirement, 'optional');
    assert.equal(compatibility.issues[0].severity, 'review-required');
  });

  it('exposes typed package builder hooks without requiring connected package data', () => {
    const { usePackageAssembly, usePackageDefinition, usePackageValidation } = modules.hooks;

    assert.match(renderHookProbe(usePackageDefinition, null), /data-loading="false"/);
    assert.match(renderHookProbe(usePackageAssembly, null), /data-has-data="false"/);
    assert.match(renderHookProbe(usePackageValidation, null), /data-has-error="false"/);
  });
});
