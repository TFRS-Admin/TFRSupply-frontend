import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * Large "front door" tiles routing to the 3 live verticals (Police, Fire,
 * Work Truck). `comingSoon` verticals from NAV_VERTICALS render in a smaller
 * strip beneath so that data stays the single source of truth without
 * competing for space with the primary routing tiles.
 */
export default function VerticalRoutingGrid({ verticals = [] }) {
  const live = verticals.filter((v) => v.path);
  const comingSoon = verticals.filter((v) => !v.path);

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {live.map((vertical) => (
          <Link
            key={vertical.id}
            to={vertical.path}
            className="group relative flex flex-col overflow-hidden rounded-md border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-[#c8102e] hover:shadow-lg"
          >
            <div className="relative h-56 overflow-hidden bg-gray-100 md:h-64">
              <img
                src={vertical.image}
                alt={vertical.imageAlt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <p className="font-heading absolute bottom-4 left-5 text-2xl font-bold uppercase tracking-tight text-white">
                {vertical.label}
              </p>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <p className="font-body mb-4 flex-1 text-sm leading-relaxed text-gray-600">{vertical.description}</p>
              <span className="font-heading inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-[#c8102e]">
                Shop {vertical.label} <ArrowRight size={15} className="transition-transform duration-150 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {comingSoon.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {comingSoon.map((vertical) => (
            <div
              key={vertical.id}
              className="flex items-center gap-4 rounded-md border border-gray-100 bg-gray-50 p-4 opacity-70"
            >
              <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-sm bg-gray-200">
                <img src={vertical.image} alt={vertical.imageAlt} className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="font-heading text-sm font-bold uppercase tracking-tight text-[#0f0f0f]">{vertical.label}</p>
                <p className="font-body text-xs font-semibold uppercase tracking-wide text-gray-400">Coming Soon</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
