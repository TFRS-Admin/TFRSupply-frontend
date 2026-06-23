import React, { useState } from 'react';
import { EffectCard } from '../ShowcaseCategoryPage';

function StickyNav() {
  const [active, setActive] = useState('Home');
  return (
    <div className="bg-white border border-gray-200 rounded-xl w-full max-w-sm shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="font-black text-gray-900 text-sm">MyApp</div>
        <div className="hidden sm:flex gap-1">
          {['Home','Products','About'].map(item => (
            <button key={item} onClick={() => setActive(item)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${active === item ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'}`}>
              {item}
            </button>
          ))}
        </div>
        <button className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded">Sign Up</button>
      </div>
    </div>
  );
}

function MobileDrawer() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="bg-gray-900 text-white p-2 rounded-lg">
        {open ? '✕' : '☰'}
      </button>
      {open && (
        <div className="absolute top-10 left-0 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-10 py-2">
          {['Dashboard','Products','Settings','Help'].map(item => (
            <button key={item} onClick={() => setOpen(false)}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-semibold">{item}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function BreadcrumbNav() {
  const path = ['Home', 'Products', 'Electronics', 'Headphones'];
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {path.map((item, i) => (
        <React.Fragment key={item}>
          <button className={`text-xs font-semibold ${i === path.length - 1 ? 'text-gray-900' : 'text-blue-500 hover:underline'}`}>{item}</button>
          {i < path.length - 1 && <span className="text-gray-400 text-xs">/</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

function TabNav() {
  const [active, setActive] = useState(0);
  const tabs = ['Overview', 'Specs', 'Reviews', 'Install'];
  return (
    <div className="w-full max-w-xs">
      <div className="flex border-b border-gray-200">
        {tabs.map((tab, i) => (
          <button key={tab} onClick={() => setActive(i)}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors ${active === i ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {tab}
          </button>
        ))}
      </div>
      <div className="p-3 text-xs text-gray-600">{tabs[active]} content goes here.</div>
    </div>
  );
}

function PillTabs() {
  const [active, setActive] = useState('All');
  return (
    <div className="flex gap-1.5 flex-wrap">
      {['All','Visual','Buttons','Admin','Marketing'].map(t => (
        <button key={t} onClick={() => setActive(t)}
          className={`text-xs font-bold px-4 py-1.5 rounded-full transition-colors ${active === t ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          {t}
        </button>
      ))}
    </div>
  );
}

function SidebarNav() {
  const [active, setActive] = useState('Dashboard');
  const items = [{ icon: '📊', label: 'Dashboard' }, { icon: '👤', label: 'Users' }, { icon: '📦', label: 'Products' }, { icon: '⚙️', label: 'Settings' }];
  return (
    <div className="bg-gray-900 rounded-xl p-3 w-44">
      {items.map(item => (
        <button key={item.label} onClick={() => setActive(item.label)}
          className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg mb-0.5 text-xs font-semibold transition-colors ${active === item.label ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
          <span>{item.icon}</span> {item.label}
        </button>
      ))}
    </div>
  );
}

export default function NavigationEffects() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <EffectCard title="Sticky Nav Bar" desc="Header with logo, links, and CTA" whenToUse="All pages — desktop primary navigation." prompt="Create a sticky top nav bar with logo left, 3 navigation links center (active = dark bg), and a blue Sign Up button right." code={`<nav className="bg-white border-b shadow-sm sticky top-0">\n  <div className="flex items-center justify-between px-4 py-3">\n    <div className="font-black">MyApp</div>\n    <div className="flex gap-1">\n      {navItems.map(item => (\n        <button onClick={() => setActive(item)}\n          className={\`px-3 py-1.5 rounded text-xs font-semibold \${active === item ? 'bg-gray-900 text-white' : 'text-gray-500'}\`}>\n          {item}\n        </button>\n      ))}\n    </div>\n    <button className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded">Sign Up</button>\n  </div>\n</nav>`}><StickyNav /></EffectCard>

      <EffectCard title="Mobile Hamburger Drawer" desc="Menu icon reveals dropdown nav" whenToUse="Mobile navigation, compact headers." prompt="Create a hamburger menu button that toggles a dropdown nav with smooth appearance. Icon switches between ☰ and ✕." code={`function MobileNav() {\n  const [open, setOpen] = useState(false);\n  return (\n    <div className="relative">\n      <button onClick={() => setOpen(o => !o)}>{open ? '✕' : '☰'}</button>\n      {open && (\n        <div className="absolute top-10 w-44 bg-white border rounded-xl shadow-xl py-2">\n          {['Dashboard','Products','Settings'].map(item => (\n            <button className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50">{item}</button>\n          ))}\n        </div>\n      )}\n    </div>\n  );\n}`}><MobileDrawer /></EffectCard>

      <EffectCard title="Breadcrumb Navigation" desc="Path trail with / separators" whenToUse="Product pages, nested settings, multi-level categories." prompt="Create a breadcrumb navigation showing the current page path with / separators. All items except the last are blue links." code={`const path = ['Home', 'Products', 'Electronics', 'Headphones'];\n<div className="flex items-center gap-1">\n  {path.map((item, i) => (\n    <React.Fragment key={item}>\n      <button className={\`text-xs font-semibold \${i === path.length-1 ? 'text-gray-900' : 'text-blue-500 hover:underline'}\`}>{item}</button>\n      {i < path.length-1 && <span className="text-gray-400">/</span>}\n    </React.Fragment>\n  ))}\n</div>`}><BreadcrumbNav /></EffectCard>

      <EffectCard title="Tab Navigation" desc="Underline tabs with content panels" whenToUse="Product pages, settings, dashboards." prompt="Create horizontal underline tabs. Active tab has border-b-2 border-blue-500 text-blue-600. Each tab shows different content in the panel below." code={`function TabNav() {\n  const [active, setActive] = useState(0);\n  const tabs = ['Overview', 'Specs', 'Reviews', 'Install'];\n  return (\n    <div>\n      <div className="flex border-b border-gray-200">\n        {tabs.map((tab, i) => (\n          <button onClick={() => setActive(i)}\n            className={\`py-2 text-xs font-semibold border-b-2 \${active === i ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500'}\`}>\n            {tab}\n          </button>\n        ))}\n      </div>\n      <div className="p-3 text-xs text-gray-600">{tabs[active]} content</div>\n    </div>\n  );\n}`}><TabNav /></EffectCard>

      <EffectCard title="Pill Filter Tabs" desc="Rounded pill toggles for filtering" whenToUse="Category filters, content browsing." prompt="Create pill-shaped filter buttons where the active one is dark (bg-gray-900 text-white) and others are light gray. Clicking switches the active pill." code={`const [active, setActive] = useState('All');\n<div className="flex gap-1.5 flex-wrap">\n  {['All','Visual','Buttons','Admin'].map(t => (\n    <button onClick={() => setActive(t)}\n      className={\`text-xs font-bold px-4 py-1.5 rounded-full \${active === t ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}\`}>\n      {t}\n    </button>\n  ))}\n</div>`}><PillTabs /></EffectCard>

      <EffectCard title="Sidebar with Icons" desc="Icon + label vertical navigation" whenToUse="Admin panels, dashboards, app shells." prompt="Create a dark sidebar nav where each item has an emoji icon and label. Active item is highlighted in blue-600." code={`const items = [\n  { icon: '📊', label: 'Dashboard' },\n  { icon: '👤', label: 'Users' },\n  { icon: '📦', label: 'Products' },\n  { icon: '⚙️', label: 'Settings' }\n];\n<div className="bg-gray-900 rounded-xl p-3 w-44">\n  {items.map(item => (\n    <button className={\`w-full flex items-center gap-2 px-3 py-2 rounded-lg font-semibold \${active === item.label ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}\`}>\n      <span>{item.icon}</span> {item.label}\n    </button>\n  ))}\n</div>`}><SidebarNav /></EffectCard>
    </div>
  );
}