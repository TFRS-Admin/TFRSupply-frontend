import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'vite';

let server;
let modules;

const vehicle = {
  id: '2024-ford-f150-xl',
  label: '2024 Ford F-150 XL',
  title: '2024 Ford F-150 XL',
  make: { id: 'ford', label: 'Ford', title: 'Ford', slug: 'ford' },
  model: { id: 'f150', label: 'F-150', title: 'F-150', makeId: 'ford', slug: 'f-150' },
  year: { value: 2024 },
  trim: 'XL',
  chassis: 'crew-cab',
};

before(async () => {
  server = await createServer({ logLevel: 'error' });
  modules = {
    service: await server.ssrLoadModule('/src/services/vehicleFitment/vehicleFitmentService.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/vehicle.schema.ts'),
  };
});

after(async () => {
  await server?.close();
});

describe('vehicleFitmentService', () => {
  it('returns an unknown product compatibility result through the default adapter', async () => {
    const { vehicleFitmentService } = modules.service;

    const result = await vehicleFitmentService.evaluateProductCompatibility({ vehicle, productId: 'navigator' });

    assert.equal(result.status, 'unknown');
    assert.equal(result.compatible, false);
    assert.equal(result.vehicleId, vehicle.id);
    assert.deepEqual(result.subject, { type: 'product', id: 'navigator' });
    assert.equal(result.issues[0].code, 'VEHICLE_FITMENT_UNAVAILABLE');
  });

  it('maps package compatibility requests to the shared adapter boundary', async () => {
    const { createVehicleFitmentService } = modules.service;
    const service = createVehicleFitmentService({
      async evaluateFitment(request) {
        return {
          status: 'compatible',
          compatible: true,
          vehicleId: request.vehicle.id,
          subject: request.subject,
          requiredOptionIds: request.requestedOptionIds,
          issues: [],
        };
      },
    });

    const result = await service.evaluatePackageCompatibility({ vehicle, packageId: 'upfit-basic', requestedOptionIds: ['mount-kit'] });

    assert.equal(result.status, 'compatible');
    assert.equal(result.compatible, true);
    assert.deepEqual(result.subject, { type: 'package', id: 'upfit-basic' });
    assert.deepEqual(result.requiredOptionIds, ['mount-kit']);
  });

  it('validates fitment request and result payloads at runtime', () => {
    const { fitmentRequestSchema, fitmentResultSchema } = modules.schemas;

    assert.throws(() => fitmentRequestSchema.parse({ vehicle: { ...vehicle, year: { value: 1800 } }, subject: { type: 'product', id: 'navigator' } }));
    assert.throws(() => fitmentResultSchema.parse({ status: 'compatible', compatible: true, subject: { type: 'product', id: 'navigator' }, issues: [{ code: '', severity: 'info', message: 'bad' }] }));
  });
});
