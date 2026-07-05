import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * MetricCard — a larger rollup tile for dashboard-style summary bars
 * (e.g. Procurement Packages summary, Project Totals) that need a bigger
 * number, a short description, and an optional trend/delta indicator.
 * Where StatCard is a compact single fact, MetricCard is the "headline
 * number for this whole section" tile.
 */
export default function MetricCard({ icon: Icon, label, value, description, trend, className }) {
  const trendPositive = typeof trend === 'number' ? trend >= 0 : null;

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-5 min-w-0', className)}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-[11px] font-bold tracking-wide uppercase text-gray-500 m-0 truncate">{label}</p>
        {Icon && <Icon size={16} className="text-ink shrink-0" aria-hidden="true" />}
      </div>
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <p className="text-2xl sm:text-3xl font-black text-ink leading-none">{value}</p>
        {typeof trend === 'number' && (
          <span className={cn('inline-flex items-center gap-1 text-xs font-bold', trendPositive ? 'text-green-700' : 'text-red-700')}>
            {trendPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      {description && <p className="text-xs text-gray-500 mt-2 leading-relaxed">{description}</p>}
    </div>
  );
}
