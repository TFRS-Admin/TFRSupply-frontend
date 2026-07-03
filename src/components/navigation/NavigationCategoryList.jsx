import React from 'react';
import { Link } from 'react-router-dom';
import {
  Layers, Volume2, Lightbulb, ArrowRight, Shield, AlertTriangle,
  Zap, Settings, Phone, FileDown, BarChart2, Tag, Radio,
} from 'lucide-react';

const ICON_MAP = {
  Layers, Volume2, Lightbulb, ArrowRight, Shield, AlertTriangle,
  Zap, Settings, Phone, FileDown, BarChart2, Tag, Radio,
};

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

/**
 * "Browse Categories" list for a vertical's mega menu panel / mobile
 * accordion section. Renders catalog category items reused as-is from
 * useCatalogVertical() — categories without a categoryId are disabled,
 * matching the existing SiteHeader row-3 behavior.
 */
export default function NavigationCategoryList({ categories = [], verticalId, title = 'Browse Categories', onNavigate }) {
  if (categories.length === 0) return null;

  return (
    <div>
      <p style={{ ...FS, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#999', marginBottom: 10 }}>
        {title}
      </p>
      <ul className="flex flex-col gap-y-1">
        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Tag;
          const isEnabled = !!cat.categoryId;
          const item = (
            <span
              className="flex items-center gap-2 py-1.5"
              style={{ ...FS, fontSize: 13, color: isEnabled ? '#333' : '#bbb', transition: 'color 0.15s' }}
            >
              <Icon size={14} style={{ flexShrink: 0, color: isEnabled ? '#c8102e' : '#ccc' }} />
              {cat.label}
            </span>
          );
          return (
            <li key={cat.label}>
              {isEnabled ? (
                <Link
                  to={`/${verticalId}/${cat.categoryId}`}
                  onClick={onNavigate}
                  className="block rounded-sm hover:underline"
                  style={{ textDecoration: 'none' }}
                >
                  {item}
                </Link>
              ) : (
                <span style={{ cursor: 'default' }}>{item}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
