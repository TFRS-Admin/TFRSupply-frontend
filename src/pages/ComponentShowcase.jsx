import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Search, Copy, Check, ChevronRight, Star, Zap, Package, ArrowRight, RefreshCw, Loader2, AlertCircle, CheckCircle2, BarChart3, Users, TrendingUp, Filter, Grid, List, Play, Volume2, Bell, Menu, X, Phone, Mail, MapPin } from 'lucide-react';
import ShowcaseButtonEffects from '@/components/showcase/ShowcaseButtonEffects';
import ShowcaseCardLayouts from '@/components/showcase/ShowcaseCardLayouts';
import ShowcaseProductCards from '@/components/showcase/ShowcaseProductCards';
import ShowcaseNavEffects from '@/components/showcase/ShowcaseNavEffects';
import ShowcaseLoadingStates from '@/components/showcase/ShowcaseLoadingStates';
import ShowcasePageSections from '@/components/showcase/ShowcasePageSections';
import ShowcaseMediaSections from '@/components/showcase/ShowcaseMediaSections';
import ShowcaseAdminLayouts from '@/components/showcase/ShowcaseAdminLayouts';
import ShowcaseForms from '@/components/showcase/ShowcaseForms';
import ShowcaseCTABanners from '@/components/showcase/ShowcaseCTABanners';

const CATEGORIES = [
  { id: 'buttons',    label: 'Button Effects',        icon: Zap,        count: 6,  component: ShowcaseButtonEffects },
  { id: 'cards',      label: 'Card Layouts',           icon: Grid,       count: 4,  component: ShowcaseCardLayouts },
  { id: 'products',   label: 'Product Cards',          icon: Package,    count: 4,  component: ShowcaseProductCards },
  { id: 'nav',        label: 'Navigation Effects',     icon: Menu,       count: 3,  component: ShowcaseNavEffects },
  { id: 'loading',    label: 'Loading States',         icon: Loader2,    count: 5,  component: ShowcaseLoadingStates },
  { id: 'sections',   label: 'Page Section Layouts',   icon: BarChart3,  count: 4,  component: ShowcasePageSections },
  { id: 'media',      label: 'Video / Media Sections', icon: Play,       count: 3,  component: ShowcaseMediaSections },
  { id: 'admin',      label: 'Admin Dashboard',        icon: TrendingUp, count: 4,  component: ShowcaseAdminLayouts },
  { id: 'forms',      label: 'Form Styling',           icon: Filter,     count: 4,  component: ShowcaseForms },
  { id: 'cta',        label: 'CTA Banners',            icon: Bell,       count: 4,  component: ShowcaseCTABanners },
];

export default function ComponentShowcase() {
  const [active, setActive] = useState('buttons');
  const [search, setSearch] = useState('');

  const filtered = search
    ? CATEGORIES.filter(c => c.label.toLowerCase().includes(search.toLowerCase()))
    : CATEGORIES;

  const current = CATEGORIES.find(c => c.id === active);
  const ActiveComponent = current?.component;

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">

      {/* Top bar */}
      <div className="bg-[#003580] px-6 py-2 flex items-center justify-between text-xs text-blue-200">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
            <Shield size={11} className="text-white" />
          </div>
          <span className="font-bold text-white">TFR Supply</span>
          <span className="text-blue-300">/ Component Showcase</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="hover:text-white transition-colors">← Back to Store</Link>
          <Link to="/admin/debug" className="hover:text-white transition-colors">Debug Panel</Link>
        </div>
      </div>

      {/* Hero */}
      <div className="border-b border-white/10 bg-gradient-to-b from-[#001f52] to-[#0D1B2A] px-6 py-10 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-1.5 text-xs font-bold text-blue-300 mb-4">
          <Zap size={11} /> {CATEGORIES.length * 4}+ Reusable UI Patterns
        </div>
        <h1 className="text-4xl font-black mb-3">Component Showcase</h1>
        <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
          Live previews of reusable UI patterns for TFR Supply. Click "Use This Style" to copy the prompt.
        </p>
        {/* Search */}
        <div className="max-w-sm mx-auto relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search components..."
            className="w-full bg-white/[0.06] border border-white/15 rounded-full pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-200px)]">

        {/* Sidebar */}
        <aside className="w-56 shrink-0 border-r border-white/[0.08] bg-[#080F18] py-4 sticky top-0 h-screen overflow-y-auto">
          <div className="px-4 mb-3 text-[10px] font-bold tracking-widest text-gray-600 uppercase">Categories</div>
          {filtered.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActive(cat.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all text-left ${
                  active === cat.id
                    ? 'bg-[#003580] text-white font-semibold border-r-2 border-blue-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon size={14} className={active === cat.id ? 'text-blue-300' : ''} />
                <span className="flex-1 leading-tight">{cat.label}</span>
                <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-bold ${active === cat.id ? 'bg-blue-500/30 text-blue-200' : 'bg-white/[0.06] text-gray-600'}`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {current && (
            <div className="mb-6">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
                <span>Showcase</span><ChevronRight size={11} /><span className="text-white font-medium">{current.label}</span>
              </div>
              <h2 className="text-2xl font-black">{current.label}</h2>
              <p className="text-gray-500 text-sm mt-1">{current.count} reusable patterns — click "Use This Style" to copy the design prompt.</p>
            </div>
          )}
          {ActiveComponent && <ActiveComponent />}
        </main>
      </div>
    </div>
  );
}