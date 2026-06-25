import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

export default function NotFound({ type = 'page', backTo = '/', backLabel = 'Return Home' }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center" style={FS}>
      <div className="text-center max-w-md px-6">
        <AlertTriangle size={48} color="#c8102e" className="mx-auto mb-6" />
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.75rem' }}>
          {type.charAt(0).toUpperCase() + type.slice(1)} Not Found
        </h1>
        <p style={{ fontSize: 14, color: '#666', lineHeight: 1.65, marginBottom: '2rem' }}>
          The {type} you're looking for doesn't exist or hasn't been configured yet.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={backTo}
            style={{ fontSize: 14, fontWeight: 700, color: '#fff', background: '#c8102e', padding: '10px 20px', textDecoration: 'none' }}>
            {backLabel}
          </Link>
          <Link to="/"
            style={{ fontSize: 14, fontWeight: 700, color: '#c8102e', border: '2px solid #c8102e', padding: '10px 20px', textDecoration: 'none' }}>
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}