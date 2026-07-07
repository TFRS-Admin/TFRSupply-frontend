import React from 'react';
import { Check } from 'lucide-react';

/**
 * Reusable filter sidebar for product discovery. Each group is
 * single-select (matching the existing CategoryTemplate filter UX) with an
 * "All" option and a reset-all action.
 */
function FilterOption({ label, checked, onClick }) {
  return (
    <button
      onClick={onClick}
      className="font-body flex w-full items-center gap-2.5 py-1 text-left text-[13px] text-gray-600 transition-colors hover:text-[#0f0f0f]"
    >
      <span
        className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-sm border transition-colors ${
          checked ? 'border-[#c8102e] bg-[#c8102e]' : 'border-gray-300 bg-white'
        }`}
      >
        {checked && <Check size={11} strokeWidth={3} className="text-white" />}
      </span>
      <span className={checked ? 'font-semibold text-[#0f0f0f]' : ''}>{label}</span>
    </button>
  );
}

export default function ProductFilterPanel({ groups = [], active = {}, onChange, onReset }) {
  const hasActive = Object.values(active).some(Boolean);

  return (
    <div className="pd-filter-panel flex-shrink-0 rounded-md border border-gray-200 bg-white p-4" style={{ width: 240 }}>
      <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
        <p className="font-heading text-xs font-bold uppercase tracking-[0.1em] text-[#0f0f0f]">Filter By</p>
        {hasActive && (
          <button
            onClick={onReset}
            className="font-heading text-[11px] font-bold uppercase tracking-wide text-[#c8102e] hover:text-[#a50d25]"
          >
            Reset All
          </button>
        )}
      </div>
      {groups.map((group) => (
        <div key={group.id} className="mb-5 last:mb-0">
          <p className="font-heading mb-2 text-xs font-bold uppercase tracking-wide text-[#0f0f0f]">{group.label}</p>
          <div className="flex flex-col">
            <FilterOption label="All" checked={!active[group.id]} onClick={() => onChange(group.id, null)} />
            {group.options.map((option) => {
              const value = typeof option === 'string' ? option : option.value;
              const label = typeof option === 'string' ? option : option.label;
              return (
                <FilterOption
                  key={value}
                  label={label}
                  checked={active[group.id] === value}
                  onClick={() => onChange(group.id, value)}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
