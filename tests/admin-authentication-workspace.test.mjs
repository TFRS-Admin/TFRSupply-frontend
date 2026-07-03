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
    types: await server.ssrLoadModule('/src/types/adminAuth.ts'),
    schemas: await server.ssrLoadModule('/src/schemas/adminAuth.schema.ts'),
    adapters: await server.ssrLoadModule('/src/adapters/adminAuth/index.ts'),
    service: await server.ssrLoadModule('/src/services/adminAuth/index.ts'),
    guard: await server.ssrLoadModule('/src/components/AdminAuthGuard.jsx'),
    loginPage: await server.ssrLoadModule('/src/pages/AdminLoginPage.jsx'),
    router: await server.ssrLoadModule('/node_modules/react-router-dom/dist/index.js'),
  };
});

after(async () => { await server?.close(); });

function renderWithRouter(element, initialEntries = ['/admin/login']) {
  const { MemoryRouter } = modules.router;
  return renderToString(React.createElement(MemoryRouter, { initialEntries }, element));
}

describe('admin auth schemas', () => {
  it('validates a well-formed admin user and session contract', () => {
    const { adminUserSchema, adminSessionSchema } = modules.schemas;
    const user = adminUserSchema.parse({
      id: 'demo-super-admin',
      label: 'Ava Chen',
      email: 'ava.chen@tfrsupply-demo.test',
      role: 'super-admin',
      permissions: ['admin.shopify-sync.view', 'admin.quote-builder.view'],
    });
    const session = adminSessionSchema.parse({
      sessionToken: 'mock-admin-session-demo-super-admin-1',
      user,
      issuedAt: '2026-07-02T00:00:00.000Z',
      expiresAt: null,
    });
    assert.equal(session.user.role, 'super-admin');
  });

  it('rejects an unknown role or permission value', () => {
    const { adminUserSchema } = modules.schemas;
    assert.throws(() => adminUserSchema.parse({
      id: 'x', label: 'X', email: 'x@example.com', role: 'root', permissions: [],
    }));
    assert.throws(() => adminUserSchema.parse({
      id: 'x', label: 'X', email: 'x@example.com', role: 'viewer', permissions: ['admin.everything.view'],
    }));
  });
});

describe('mockAdminAuthAdapter', () => {
  it('lists the deterministic demo users', async () => {
    const { createMockAdminAuthAdapter } = modules.adapters;
    const adapter = createMockAdminAuthAdapter();
    const users = await adapter.listDemoUsers();
    assert.ok(users.length >= 4);
    assert.ok(users.some((user) => user.role === 'super-admin'));
    assert.ok(users.some((user) => user.role === 'viewer'));
  });

  it('signs in a known demo user and issues a lookup-able session', async () => {
    const { createMockAdminAuthAdapter } = modules.adapters;
    const adapter = createMockAdminAuthAdapter();
    const result = await adapter.signIn({ demoUserId: 'demo-ops-admin', requestId: 'req-1' });
    assert.equal(result.status, 'authenticated');
    assert.ok(result.session.sessionToken);

    const restored = await adapter.getSession(result.session.sessionToken);
    assert.equal(restored.user.id, 'demo-ops-admin');
  });

  it('fails sign-in for an unknown demo user id', async () => {
    const { createMockAdminAuthAdapter } = modules.adapters;
    const adapter = createMockAdminAuthAdapter();
    const result = await adapter.signIn({ demoUserId: 'not-a-real-demo-user', requestId: 'req-2' });
    assert.equal(result.status, 'failed');
    assert.equal(result.error.code, 'unknown-demo-user');
    assert.equal(result.session, null);
  });

  it('removes the session on sign-out so it can no longer be looked up', async () => {
    const { createMockAdminAuthAdapter } = modules.adapters;
    const adapter = createMockAdminAuthAdapter();
    const { session } = await adapter.signIn({ demoUserId: 'demo-sales-admin', requestId: 'req-3' });
    await adapter.signOut(session.sessionToken);
    const lookedUp = await adapter.getSession(session.sessionToken);
    assert.equal(lookedUp, null);
  });
});

describe('unavailableAdminAuthAdapter', () => {
  it('never returns a session and reports adapter-unavailable on every method', async () => {
    const { unavailableAdminAuthAdapter } = modules.adapters;
    assert.deepEqual(await unavailableAdminAuthAdapter.listDemoUsers(), []);

    const result = await unavailableAdminAuthAdapter.signIn({ demoUserId: 'demo-super-admin', requestId: 'req-4' });
    assert.equal(result.status, 'adapter-unavailable');
    assert.equal(result.error.code, 'adapter-unavailable');
    assert.equal(result.session, null);

    assert.equal(await unavailableAdminAuthAdapter.getSession('any-token'), null);
    await assert.doesNotReject(() => unavailableAdminAuthAdapter.signOut('any-token'));
  });
});

describe('adminAuthenticationService', () => {
  it('signs in, looks up the restored session, then signs out (full login/logout/restore lifecycle)', async () => {
    const { createAdminAuthenticationService } = modules.service;
    const { createMockAdminAuthAdapter } = modules.adapters;
    const service = createAdminAuthenticationService(createMockAdminAuthAdapter());

    const signInResult = await service.signIn({ demoUserId: 'demo-super-admin', requestId: 'req-5' });
    assert.equal(signInResult.status, 'authenticated');

    const restored = await service.getSession(signInResult.session.sessionToken);
    assert.equal(restored.user.id, 'demo-super-admin');

    await service.signOut(signInResult.session.sessionToken);
    const afterSignOut = await service.getSession(signInResult.session.sessionToken);
    assert.equal(afterSignOut, null);
  });

  it('returns null session lookup for an empty or unknown token without throwing', async () => {
    const { createAdminAuthenticationService } = modules.service;
    const { createMockAdminAuthAdapter } = modules.adapters;
    const service = createAdminAuthenticationService(createMockAdminAuthAdapter());
    assert.equal(await service.getSession(''), null);
    assert.equal(await service.getSession('never-issued-token'), null);
  });

  it('never calls an external provider through the unavailable adapter binding', async () => {
    const { createAdminAuthenticationService } = modules.service;
    const { unavailableAdminAuthAdapter } = modules.adapters;
    const service = createAdminAuthenticationService(unavailableAdminAuthAdapter);
    const result = await service.signIn({ demoUserId: 'demo-super-admin', requestId: 'req-6' });
    assert.equal(result.status, 'adapter-unavailable');
  });

  describe('permission and role evaluation (drives route protection for /admin/shopify-sync and /admin/quote-builder)', () => {
    async function sessionFor(demoUserId) {
      const { createAdminAuthenticationService } = modules.service;
      const { createMockAdminAuthAdapter } = modules.adapters;
      const service = createAdminAuthenticationService(createMockAdminAuthAdapter());
      const result = await service.signIn({ demoUserId, requestId: `req-${demoUserId}` });
      return { service, session: result.session };
    }

    it('grants the super-admin every guarded route permission', async () => {
      const { service, session } = await sessionFor('demo-super-admin');
      assert.equal(service.hasPermission(session, 'admin.shopify-sync.view'), true);
      assert.equal(service.hasPermission(session, 'admin.quote-builder.view'), true);
      assert.equal(service.hasRole(session, 'super-admin'), true);
    });

    it('grants the ops-admin only the shopify-sync route permission', async () => {
      const { service, session } = await sessionFor('demo-ops-admin');
      assert.equal(service.hasPermission(session, 'admin.shopify-sync.view'), true);
      assert.equal(service.hasPermission(session, 'admin.quote-builder.view'), false);
    });

    it('grants the sales-admin only the quote-builder route permission', async () => {
      const { service, session } = await sessionFor('demo-sales-admin');
      assert.equal(service.hasPermission(session, 'admin.quote-builder.view'), true);
      assert.equal(service.hasPermission(session, 'admin.shopify-sync.view'), false);
    });

    it('grants the viewer no guarded route permissions', async () => {
      const { service, session } = await sessionFor('demo-viewer');
      assert.equal(service.hasPermission(session, 'admin.shopify-sync.view'), false);
      assert.equal(service.hasPermission(session, 'admin.quote-builder.view'), false);
      assert.equal(service.hasRole(session, 'viewer'), true);
    });

    it('denies every permission and role check for a null (unauthenticated) session', () => {
      const { createAdminAuthenticationService } = modules.service;
      const { createMockAdminAuthAdapter } = modules.adapters;
      const service = createAdminAuthenticationService(createMockAdminAuthAdapter());
      assert.equal(service.hasPermission(null, 'admin.shopify-sync.view'), false);
      assert.equal(service.hasRole(null, 'viewer'), false);
    });
  });
});

describe('AdminAuthGuard (route protection)', () => {
  it('renders a checking state on first paint instead of the guarded page, before any session restoration effect runs', () => {
    const { default: AdminAuthGuard } = modules.guard;
    const html = renderWithRouter(
      React.createElement(AdminAuthGuard, { requiredPermission: 'admin.shopify-sync.view' },
        React.createElement('div', null, 'GUARDED PAGE CONTENT')),
      ['/admin/shopify-sync'],
    );
    assert.doesNotMatch(html, /GUARDED PAGE CONTENT/);
    assert.match(html, /Checking admin session/);
  });
});

describe('AdminLoginPage', () => {
  it('renders the demo administrator selector on first paint', () => {
    const { default: AdminLoginPage } = modules.loginPage;
    const html = renderWithRouter(React.createElement(AdminLoginPage));
    assert.match(html, /Select a Demo Administrator/);
    assert.match(html, /Authentication Status/);
  });
});
