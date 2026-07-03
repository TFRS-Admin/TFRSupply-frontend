/**
 * pages/AdminLoginPage.jsx
 * Issue 49 — Admin Authentication Workspace.
 *
 * Mock administrator sign-in at /admin/login. Consumes useAdminAuthentication
 * only — no identity provider, password, or backend call is made anywhere on
 * this page.
 */
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, LogOut, ShieldCheck, UserCircle2 } from 'lucide-react';
import { useAdminAuthentication } from '@/hooks/adminAuth';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const ROLE_LABEL = {
  'super-admin': 'Super Admin',
  'ops-admin': 'Ops Admin',
  'sales-admin': 'Sales Admin',
  viewer: 'Viewer',
};

function StatusBadge({ status }) {
  const map = {
    idle: { bg: '#f3f4f6', text: '#6b7280', label: 'Idle' },
    authenticating: { bg: '#fef3c7', text: '#92400e', label: 'Signing In…' },
    authenticated: { bg: '#dcfce7', text: '#15803d', label: 'Authenticated' },
    unauthenticated: { bg: '#f3f4f6', text: '#6b7280', label: 'Unauthenticated' },
    error: { bg: '#fee2e2', text: '#b91c1c', label: 'Error' },
  };
  const c = map[status] || map.idle;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
      padding: '3px 10px', borderRadius: 2, background: c.bg, color: c.text,
    }}>
      {c.label}
    </span>
  );
}

export default function AdminLoginPage() {
  const { status, session, demoUsers, error, signIn, signOut } = useAdminAuthentication();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/admin/shopify-sync';

  const handleSignIn = async (demoUserId) => {
    const result = await signIn(demoUserId);
    if (result.status === 'authenticated') navigate(redirectTo, { replace: true });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', ...FS }}>
      <div style={{ background: '#1a2744', color: '#fff', padding: '0 32px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
          <div>
            <p style={{ margin: 0, fontWeight: 900, fontSize: 18, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              TFR Supply — Admin
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.06em' }}>
              ADMIN AUTHENTICATION WORKSPACE (DEMO IDENTITIES)
            </p>
          </div>
          <Link to="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>← Store</Link>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 32px' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1a2744' }}>Authentication Status</p>
            <StatusBadge status={status} />
          </div>
          <p style={{ fontSize: 12, color: '#888', margin: 0 }}>
            No password, OAuth provider, or backend is contacted here. Sign-in issues a mock, in-memory session
            token for one of the deterministic demo administrators below.
          </p>

          {error && status === 'error' && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', fontSize: 12 }}>
              {error.message || 'Sign-in failed.'}
            </div>
          )}
        </div>

        {status === 'authenticated' && session ? (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <ShieldCheck size={20} style={{ color: '#15803d' }} />
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1a2744' }}>Signed In</p>
            </div>
            <dl style={{ display: 'grid', gridTemplateColumns: '140px 1fr', rowGap: 8, fontSize: 13, margin: 0 }}>
              <dt style={{ color: '#888' }}>Name</dt>
              <dd style={{ margin: 0 }}>{session.user.label}</dd>
              <dt style={{ color: '#888' }}>Email</dt>
              <dd style={{ margin: 0 }}>{session.user.email}</dd>
              <dt style={{ color: '#888' }}>Role</dt>
              <dd style={{ margin: 0 }}>{ROLE_LABEL[session.user.role] || session.user.role}</dd>
              <dt style={{ color: '#888' }}>Permissions</dt>
              <dd style={{ margin: 0 }}>{session.user.permissions.length ? session.user.permissions.join(', ') : 'None'}</dd>
              <dt style={{ color: '#888' }}>Session Token</dt>
              <dd style={{ margin: 0, fontFamily: 'monospace', fontSize: 12, color: '#555' }}>{session.sessionToken}</dd>
              <dt style={{ color: '#888' }}>Issued At</dt>
              <dd style={{ margin: 0 }}>{session.issuedAt}</dd>
            </dl>

            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <Link to="/admin/shopify-sync" style={{ fontSize: 12, color: '#c8102e', fontWeight: 700, textDecoration: 'none' }}>Go to Shopify Sync →</Link>
              <Link to="/admin/quote-builder" style={{ fontSize: 12, color: '#c8102e', fontWeight: 700, textDecoration: 'none' }}>Go to Quote Builder →</Link>
            </div>

            <button
              onClick={signOut}
              style={{ marginTop: 18, background: '#1a2744', border: 'none', color: '#fff', padding: '8px 16px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 2 }}
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: 24 }}>
            <p style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#1a2744' }}>Select a Demo Administrator</p>
            {demoUsers.length === 0 && (
              <p style={{ fontSize: 12, color: '#888' }}>No demo administrators are available.</p>
            )}
            {demoUsers.map((user) => (
              <div
                key={user.id}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #f0f0f0', padding: '12px 14px', marginBottom: 8 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <UserCircle2 size={22} style={{ color: '#1a2744' }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1a2744' }}>{user.label}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#888' }}>{ROLE_LABEL[user.role] || user.role} — {user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSignIn(user.id)}
                  disabled={status === 'authenticating'}
                  style={{ background: '#c8102e', border: 'none', color: '#fff', padding: '7px 14px', fontSize: 12, cursor: status === 'authenticating' ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 2 }}
                >
                  <CheckCircle2 size={13} /> Sign In
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
