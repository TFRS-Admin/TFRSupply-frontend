import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// crumbs: [{ label, to? }]  — last item has no `to`, rendered as plain text
export default function ProductBreadcrumb({ crumbs = [] }) {
  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-1.5 text-xs text-gray-500">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight size={10} className="text-gray-300" />}
            {c.to
              ? <Link to={c.to} className="hover:text-[#CC0000] transition-colors">{c.label}</Link>
              : <span className={i === crumbs.length - 1 ? 'text-gray-700 font-medium' : 'text-gray-400'}>{c.label}</span>
            }
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}