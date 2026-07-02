/**
 * components/AdminAuthGuard.jsx
 * Issue 49 — Admin Authentication Workspace.
 *
 * Route-level gate for /admin/* pages that require a signed-in demo
 * administrator. Wraps useAdminAuthentication (session restoration,
 * sign-in status) and adminAuthenticationService.hasPermission (permission
 * evaluation) — it contains no authentication logic of its own.
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import { useAdminAuthentication } from '@/hooks/adminAuth';
import { adminAuthenticationService } from '@/services/adminAuth';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

function CenteredMessage({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', ...FS }}>
      {children}
    </div>
  );
}

export default function AdminAuthGuard({ requiredPermission, children }) {
  const { status, session } = useAdminAuthentication();
  const location = useLocation();

  if (status === 'idle' || status === 'authenticating') {
    return <CenteredMessage><p style={{ fontSize: 14, color: '#888' }}>Checking admin session…</p></CenteredMessage>;
  }

  if (status !== 'authenticated' || !session) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (requiredPermission && !adminAuthenticationService.hasPermission(session, requiredPermission)) {
    return (
      <CenteredMessage>
        <div style={{ background: '#fff', border: '1px solid #fecaca', maxWidth: 440, width: '100%', padding: 32, textAlign: 'center' }}>
          <ShieldOff size={36} style={{ color: '#dc2626', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>Access Restricted</p>
          <p style={{ fontSize: 13, color: '#555' }}>
            {session.user.label} ({session.user.role}) does not have the "{requiredPermission}" permission.
          </p>
        </div>
      </CenteredMessage>
    );
  }

  return children;
}
