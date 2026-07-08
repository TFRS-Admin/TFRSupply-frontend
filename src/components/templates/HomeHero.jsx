import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';

/**
 * Homepage-only hero — distinct from templates/VerticalHero (single vertical,
 * data-driven from data/verticals/*.json). This one is fed a plain object of
 * copy/CTAs from StoreLanding so the front door isn't coupled to any one
 * vertical's JSON shape.
 */
export default function HomeHero({ eyebrow, title, subtitle, images = [], primaryCta, secondaryCta }) {
  return (
    <div className="relative overflow-hidden bg-[#0f0f0f]">
      <div className="absolute inset-0 grid grid-cols-3 opacity-25">
        {images.map((img) => (
          <img key={img} src={img} alt="" className="h-full w-full object-cover" />
        ))}
      </div>
      <div className="absolute inset-0 bg-black/80" />
      <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
        {eyebrow && (
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-block h-[3px] w-8 bg-[#c8102e]" />
            <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#F5B942]">{eyebrow}</p>
          </div>
        )}
        <h1 className="font-heading mb-5 max-w-2xl text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-white md:text-6xl">
          {title}
        </h1>
        {subtitle && (
          <p className="font-body mb-8 max-w-xl text-base leading-relaxed text-gray-300 md:text-lg">
            {subtitle}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4">
          {primaryCta && (
            <Link
              to={primaryCta.to}
              style={{ borderRadius: '20px 2px 20px 2px' }}
              className="font-heading inline-flex items-center gap-2 bg-[#e21938] px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors duration-150 hover:bg-[#ec0025]"
            >
              {primaryCta.label} › <ArrowRight size={16} />
            </Link>
          )}
          {secondaryCta && (
            <Link
              to={secondaryCta.to}
              style={{ borderRadius: '20px 2px 20px 2px' }}
              className="font-heading inline-flex items-center gap-2 border border-white/30 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-colors duration-150 hover:bg-white/10"
            >
              {secondaryCta.label} <ChevronRight size={16} />
            </Link>
          )}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-[#c8102e]" />
    </div>
  );
}
