import React from 'react';
import { ChevronRight } from 'lucide-react';

export default function VerticalHero({ hero }) {
  if (!hero) return null;
  return (
    <div className="relative min-h-[440px] overflow-hidden bg-[#111111]">
      {hero.image && (
        <img
          src={hero.image}
          alt={hero.imageAlt || ''}
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/10" />
      <div className="relative mx-auto flex min-h-[440px] max-w-7xl flex-col justify-center px-6 py-24">
        {hero.eyebrow && (
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-block h-[3px] w-8 bg-[#C8102E]" />
            <span className="font-heading text-xs font-bold uppercase tracking-wide text-[#F5B942]">
              {hero.eyebrow}
            </span>
          </div>
        )}
        <h1 className="font-heading mb-[1.1rem] max-w-2xl text-[clamp(2.2rem,4.6vw,3.2rem)] font-bold uppercase leading-tight tracking-tight text-white drop-shadow-lg">
          {hero.title}
        </h1>
        {hero.subtitle && (
          <p className="font-body mb-7 max-w-xl text-[17px] leading-relaxed text-white/90 drop-shadow">
            {hero.subtitle}
          </p>
        )}
        {hero.cta && (
          <a
            href={hero.cta.href || '#'}
            className="vlt-hero-cta font-heading inline-flex w-fit items-center gap-1.5 rounded-md bg-white px-6 py-3 text-sm font-bold uppercase tracking-wide text-[#C8102E]"
          >
            {hero.cta.label} <ChevronRight size={15} />
          </a>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#C8102E]" />
    </div>
  );
}
