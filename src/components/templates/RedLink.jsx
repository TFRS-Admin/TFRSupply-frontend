import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };
const style = { ...FS, fontSize: 14, fontWeight: 700, color: '#c8102e', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 };

export default function RedLink({ href = '#', to, children, external }) {
  const hover = e => { e.currentTarget.style.textDecoration = 'underline'; };
  const leave = e => { e.currentTarget.style.textDecoration = 'none'; };

  if (to) {
    return (
      <Link to={to} style={style} onMouseEnter={hover} onMouseLeave={leave}>
        {children} <ChevronRight size={14} />
      </Link>
    );
  }
  return (
    <a href={href} style={style} onMouseEnter={hover} onMouseLeave={leave}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {children} <ChevronRight size={14} />
    </a>
  );
}