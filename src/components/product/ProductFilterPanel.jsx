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
      className="font-body flex w-full items-center gap-2.5 py-1 text-left text-sm text-gray-700 transition-colors hover:text-[#0F0F0F]"
    >
      <span
        className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-sm border transition-colors ${
          checked ? 'border-[#C8102E] bg-[#C8102E]' : 'border-gray-300 bg-white'
        }`}
      >
        {checked && <Check size={11} strokeWidth={3} className="text-white" />}
      </span>
      <span className={checked ? 'font-semibold text-[#0F0F0F]' : ''}>{label}</span>
    </button>
  );
}

export default function ProductFilterPanel({ groups = [], active = {}, onChange, onReset }) {
  const hasActive = Object.values(active).some(Boolean);

  return (
    <div className="pd-filter-panel flex-shrink-0 rounded-md border border-gray-200 bg-gray-50 p-5" style={{ width: 240 }}>
      <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-2">
        <p className="font-heading text-sm font-bold uppercase tracking-wide text-[#0F0F0F]">Filter By</p>
        {hasActive && (
          <button
            onClick={onReset}
            className="font-heading text-[11px] font-bold uppercase tracking-wide text-[#C8102E] hover:text-[#A50D25]"
          >
            Reset All
          </button>
        )}
      </div>
      {groups.map((group) => (
        <div key={group.id} className="mb-5 last:mb-0">
          <p className="font-heading mb-3 border-b border-gray-200 pb-2 text-sm font-bold uppercase tracking-wide text-[#0F0F0F]">{group.label}</p>
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
