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
    catalog: await server.ssrLoadModule('/src/services/catalog/catalogService.ts'),
    hooks: await server.ssrLoadModule('/src/hooks/useCatalog.ts'),
    vertical: await server.ssrLoadModule('/src/pages/VerticalLandingTemplate.jsx'),
    router: await server.ssrLoadModule('/node_modules/react-router-dom/dist/index.js'),
    vehicle: await server.ssrLoadModule('/src/context/VehicleContext.jsx'),
    configurator: await server.ssrLoadModule('/src/context/ConfiguratorContext.jsx'),
    savedProducts: await server.ssrLoadModule('/src/context/SavedProductsContext.jsx'),
  };
});

after(async () => {
  await server?.close();
});

function renderWithProviders(element) {
  const { MemoryRouter } = modules.router;
  const { VehicleProvider } = modules.vehicle;
  const { ConfiguratorProvider } = modules.configurator;
  const { SavedProductsProvider } = modules.savedProducts;

  return renderToString(
    React.createElement(MemoryRouter, { initialEntries: ['/police'] },
      React.createElement(VehicleProvider, null,
        React.createElement(SavedProductsProvider, null,
          React.createElement(ConfiguratorProvider, null, element),
        ),
      ),
    ),
  );
}

describe('catalogService vertical methods', () => {
  it('lists verticals and gets a vertical by id', () => {
    const { catalogService } = modules.catalog;

    const verticals = catalogService.listVerticals();
    const police = catalogService.getVertical('police');

    assert.equal(verticals.length, 3);
    assert.equal(police?.id, 'police');
    assert.equal(police?.hero?.title, 'Police Vehicle Safety Devices');
  });
});

describe('useCatalogVertical', () => {
  it('exposes loading state before effects resolve', () => {
    const { useCatalogVertical } = modules.hooks;

    function HookProbe() {
      const state = useCatalogVertical('police');
      return React.createElement('span', {
        'data-loading': String(state.loading),
        'data-has-data': String(Boolean(state.data)),
      });
    }

    const html = renderToString(React.createElement(HookProbe));

    assert.match(html, /data-loading="true"/);
    assert.match(html, /data-has-data="false"/);
  });
});

describe('VerticalLandingTemplateView', () => {
  it('renders nothing during loading state', () => {
    const { VerticalLandingTemplateView } = modules.vertical;
    const html = renderWithProviders(
      React.createElement(VerticalLandingTemplateView, {
        verticalId: 'police',
        data: null,
        loading: true,
        error: null,
      }),
    );

    assert.equal(html, '');
  });

  it('throws during error state', () => {
    const { VerticalLandingTemplateView } = modules.vertical;
    const error = new Error('vertical failed');

    assert.throws(() => renderWithProviders(
      React.createElement(VerticalLandingTemplateView, {
        verticalId: 'police',
        data: null,
        loading: false,
        error,
      }),
    ), /vertical failed/);
  });

  it('renders a vertical successfully', () => {
    const { catalogService } = modules.catalog;
    const { VerticalLandingTemplateView } = modules.vertical;
    const data = catalogService.getVertical('police');

    const html = renderWithProviders(
      React.createElement(VerticalLandingTemplateView, {
        verticalId: 'police',
        data,
        loading: false,
        error: null,
      }),
    );

    assert.match(html, /Police Vehicle Safety Devices/);
    assert.match(html, /Risk-Reducing Police Vehicle Equipment/);
  });
});
