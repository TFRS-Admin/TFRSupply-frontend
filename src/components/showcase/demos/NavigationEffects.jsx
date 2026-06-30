import React, { useState, useRef } from 'react';
import { EffectCard } from '../ShowcaseCategoryPage';

function ShrinkingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef();
  const onScroll = () => setScrolled(ref.current?.scrollTop > 30);
  return (
    <EffectCard title="Shrinking Header" desc="Compresses on scroll" whenToUse="Long pages where you want persistent navigation without taking up space."
      prompt="Create a header that shrinks its padding and font size when the user scrolls down using onScroll + state"
      code={`const [scrolled, setScrolled] = useState(false);\n<div onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 30)}>\n  <header className={\`transition-all \${scrolled ? 'py-2 text-sm shadow' : 'py-4 text-base'}\`}>\n    <span className="font-bold">Brand</span>\n  </header>\n</div>`}>
      <div className="w-full max-w-xs overflow-hidden rounded-xl border border-gray-200" style={{ height: 120 }}>
        <div ref={ref} onScroll={onScroll} className="overflow-y-auto h-full">
          <header className={`sticky top-0 bg-white border-b border-gray-100 flex items-center justify-between transition-all duration-300 ${scrolled ? 'px-4 py-2 shadow-sm' : 'px-4 py-4'}`}>
            <span className={`font-black text-gray-900 transition-all ${scrolled ? 'text-sm' : 'text-base'}`}>Brand</span>
            <div className="flex gap-3 text-xs text-gray-600">
              <span>Home</span><span>About</span><span>Contact</span>
            </div>
          </header>
          {Array.from({length:8},(_,i) => <div key={i} className="px-4 py-3 text-xs text-gray-500 border-b border-gray-50">Content {i+1}</div>)}
        </div>
      </div>
    </EffectCard>
  );
}

function TransparentToSolid() {
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef();
  return (
    <EffectCard title="Transparent to Solid" desc="Background appears on scroll" whenToUse="Hero sections with image backgrounds where nav shouldn't block the view."
      prompt="Create a nav that starts transparent and transitions to a solid white background with shadow on scroll"
      code={`<header className={\`fixed top-0 transition-all duration-300 \${scrolled ? 'bg-white shadow-md' : 'bg-transparent'}\`}>`}>
      <div className="w-full max-w-xs overflow-hidden rounded-xl border border-gray-200 relative" style={{ height: 120 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600 to-blue-400" />
        <div ref={ref} onScroll={() => setScrolled(ref.current?.scrollTop > 30)} className="overflow-y-auto h-full relative">
          <header className={`sticky top-0 flex items-center justify-between px-4 py-3 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
            <span className={`font-black text-sm transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>Logo</span>
            <div className={`flex gap-3 text-xs transition-colors ${scrolled ? 'text-gray-600' : 'text-white/90'}`}>
              <span>Home</span><span>Shop</span><span>Blog</span>
            </div>
          </header>
          {Array.from({length:6},(_,i) => <div key={i} className="px-4 py-5 text-xs text-white/60">Section {i+1}</div>)}
        </div>
      </div>
    </EffectCard>
  );
}

function HideOnScroll() {
  const [visible, setVisible] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  const ref = useRef();
  const onScroll = () => {
    const curr = ref.current?.scrollTop || 0;
    setVisible(curr < lastScroll || curr < 20);
    setLastScroll(curr);
  };
  return (
    <EffectCard title="Hide on Scroll" desc="Disappears when scrolling down" whenToUse="Mobile interfaces to maximize reading area while content is being consumed."
      prompt="Track scroll direction. Hide header when scrolling down, show when scrolling up."
      code={`const [lastScroll, setLastScroll] = useState(0);\nconst [visible, setVisible] = useState(true);\nconst onScroll = (e) => {\n  const curr = e.currentTarget.scrollTop;\n  setVisible(curr < lastScroll || curr < 20);\n  setLastScroll(curr);\n};`}>
      <div className="w-full max-w-xs overflow-hidden rounded-xl border border-gray-200" style={{ height: 120 }}>
        <div ref={ref} onScroll={onScroll} className="overflow-y-auto h-full relative">
          <header className={`sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between transition-all duration-300 ${visible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
            <span className="font-black text-sm text-gray-900">Header</span>
            <span className="text-xs text-gray-400">Scroll to hide ↓</span>
          </header>
          {Array.from({length:8},(_,i) => <div key={i} className="px-4 py-3 text-xs text-gray-500 border-b border-gray-50">Content {i+1}</div>)}
        </div>
      </div>
    </EffectCard>
  );
}

function AnimatedUnderline() {
  const [active, setActive] = useState('Home');
  const items = ['Home', 'About', 'Services', 'Contact'];
  return (
    <EffectCard title="Animated Underline" desc="Sliding indicator" whenToUse="Tab bars, nav menus, section switchers."
      prompt="Create a nav with a sliding underline indicator that moves between tabs on click"
      code={`<div className="flex">\n  {items.map(item => (\n    <button key={item} onClick={() => setActive(item)}\n      className={\`relative pb-2 px-4 text-sm font-medium transition-colors\n        \${active===item ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-800'}\`}>\n      {item}\n    </button>\n  ))}\n</div>`}>
      <div className="flex border-b border-gray-200 w-full max-w-xs">
        {items.map(item => (
          <button key={item} onClick={() => setActive(item)}
            className={`pb-2 px-3 text-xs font-semibold transition-all border-b-2 -mb-px ${active===item ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-800'}`}>
            {item}
          </button>
        ))}
      </div>
    </EffectCard>
  );
}

function GlassHeader() {
  return (
    <EffectCard title="Glass Header" desc="Frosted glass effect" whenToUse="Apps with colorful or image backgrounds."
      prompt="Create a glassmorphism header using backdrop-filter:blur and rgba background"
      code={`<header style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)' }}>`}>
      <div className="w-full max-w-xs rounded-xl overflow-hidden relative" style={{ height: 80 }}>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500" />
        <header className="relative flex items-center justify-between px-4 py-3 h-full"
          style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
          <span className="font-black text-white text-sm">Glass</span>
          <div className="flex gap-3 text-white/90 text-xs">
            <span>Home</span><span>About</span><span>Contact</span>
          </div>
        </header>
      </div>
    </EffectCard>
  );
}

function MobileBottomNav() {
  const [active, setActive] = useState('home');
  const tabs = [{id:'home',icon:'🏠',label:'Home'},{id:'search',icon:'🔍',label:'Search'},{id:'saved',icon:'🔖',label:'Saved'},{id:'profile',icon:'👤',label:'Profile'}];
  return (
    <EffectCard title="Mobile Bottom Nav" desc="iOS/Android style" whenToUse="Mobile-first apps that need thumb-friendly navigation."
      prompt="Create a bottom navigation bar with icons and labels, active state highlighted in blue"
      code={`<nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex">\n  {tabs.map(tab => (\n    <button key={tab.id} onClick={() => setActive(tab.id)}\n      className={\`flex-1 flex flex-col items-center py-2 \${active===tab.id ? 'text-blue-600' : 'text-gray-400'}\`}>\n      <span>{tab.icon}</span>\n      <span className="text-xs">{tab.label}</span>\n    </button>\n  ))}\n</nav>`}>
      <div className="w-full max-w-xs border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 h-16 flex items-center justify-center text-xs text-gray-400">Home Screen</div>
        <nav className="bg-white border-t border-gray-200 flex">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActive(tab.id)} className={`flex-1 flex flex-col items-center py-2 transition-colors ${active===tab.id ? 'text-blue-600' : 'text-gray-400'}`}>
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[9px] font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </EffectCard>
  );
}

function AnimatedTabBar() {
  const [active, setActive] = useState(0);
  const tabs = ['Overview', 'Analytics', 'Reports', 'Settings'];
  return (
    <EffectCard title="Animated Tab Bar" desc="Sliding pill indicator" whenToUse="Dashboard sections, settings pages, content switchers."
      prompt="Create a tab bar with a sliding pill background that moves to the active tab using CSS translate"
      code={`<div className="relative flex bg-gray-100 rounded-full p-1">\n  <div className="absolute bg-white rounded-full shadow transition-all duration-300"\n    style={{ width: \`\${100/tabs.length}%\`, transform: \`translateX(\${active*100}%)\` }} />\n  {tabs.map((t,i) => <button key={t} onClick={() => setActive(i)}>{t}</button>)}\n</div>`}>
      <div className="w-full max-w-xs">
        <div className="relative flex bg-gray-100 rounded-full p-1">
          <div className="absolute top-1 bottom-1 bg-white rounded-full shadow transition-all duration-300"
            style={{ width: `${100/tabs.length}%`, left: `calc(${active * (100/tabs.length)}% + 4px)` }} />
          {tabs.map((t, i) => (
            <button key={t} onClick={() => setActive(i)} className={`relative flex-1 text-[10px] font-bold py-1.5 rounded-full z-10 transition-colors ${active===i ? 'text-gray-900' : 'text-gray-500'}`}>{t}</button>
          ))}
        </div>
      </div>
    </EffectCard>
  );
}

function CollapsibleSidebar() {
  const [open, setOpen] = useState(true);
  const items = [{ icon: '🏠', label: 'Home' }, { icon: '👤', label: 'Profile' }, { icon: '⚙️', label: 'Settings' }];
  return (
    <EffectCard title="Collapsible Sidebar" desc="Expandable side nav" whenToUse="Admin panels, dashboards, desktop apps."
      prompt="Create a sidebar that collapses to show only icons and expands to show icons+labels on toggle"
      code={`<aside className={\`transition-all duration-300 \${open ? 'w-40' : 'w-12'}\`}>\n  {items.map(item => (\n    <div key={item.label} className="flex items-center gap-2 p-2">\n      <span>{item.icon}</span>\n      {open && <span className="text-sm">{item.label}</span>}\n    </div>\n  ))}\n</aside>`}>
      <div className="flex border border-gray-200 rounded-xl overflow-hidden w-full max-w-xs" style={{ height: 100 }}>
        <aside className={`bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 ${open ? 'w-28' : 'w-12'}`}>
          <button onClick={() => setOpen(o => !o)} className="p-2 text-gray-400 hover:text-gray-600 text-sm self-end">
            {open ? '◀' : '▶'}
          </button>
          {items.map(item => (
            <div key={item.label} className={`flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 ${!open ? 'justify-center px-0' : ''}`}>
              <span>{item.icon}</span>
              {open && <span className="truncate">{item.label}</span>}
            </div>
          ))}
        </aside>
        <div className="flex-1 bg-white flex items-center justify-center text-xs text-gray-400">Main content</div>
      </div>
    </EffectCard>
  );
}

function ExpandingSearch() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef();
  const toggle = () => { setOpen(o => !o); if (!open) setTimeout(() => inputRef.current?.focus(), 100); };
  return (
    <EffectCard title="Expanding Search" desc="Search bar expands on click" whenToUse="Navbars where space is limited but search is important."
      prompt="Create an expanding search input that animates from an icon button to a full text field on click"
      code={`const [open, setOpen] = useState(false);\n<div className={\`flex items-center transition-all overflow-hidden \${open ? 'w-48' : 'w-8'}\`}>\n  <button onClick={toggle}>{open ? '✕' : '🔍'}</button>\n  {open && <input autoFocus className="flex-1" placeholder="Search..." />}\n</div>`}>
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 w-full max-w-xs">
        <span className="font-bold text-sm text-gray-900">Site</span>
        <div className="flex-1 flex justify-end">
          <div className={`flex items-center transition-all duration-300 overflow-hidden ${open ? 'w-36 border border-gray-200 rounded-lg' : 'w-8'}`}>
            {open && <input ref={inputRef} className="flex-1 px-2 py-0.5 text-xs outline-none" placeholder="Search..." />}
            <button onClick={toggle} className="w-8 h-6 flex items-center justify-center text-gray-500 hover:text-gray-800 text-sm flex-shrink-0">
              {open ? '✕' : '🔍'}
            </button>
          </div>
        </div>
      </div>
    </EffectCard>
  );
}

function BreadcrumbNav() {
  const [depth, setDepth] = useState(1);
  const path = ['Home', 'Products', 'Electronics', 'Laptops'];
  return (
    <EffectCard title="Breadcrumb" desc="Path navigation" whenToUse="Deep page hierarchies, e-commerce categories, file browsers."
      prompt="Create a breadcrumb navigation that grows as user navigates deeper"
      code={`<nav className="flex items-center gap-1 text-sm">\n  {path.slice(0, depth+1).map((p, i, arr) => (\n    <React.Fragment key={p}>\n      <span className={i === arr.length-1 ? 'text-gray-900 font-bold' : 'text-blue-600 hover:underline cursor-pointer'}>{p}</span>\n      {i < arr.length-1 && <span className="text-gray-400">/</span>}\n    </React.Fragment>\n  ))}\n</nav>`}>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <nav className="flex items-center gap-1 text-xs flex-wrap">
          {path.slice(0, depth + 1).map((p, i, arr) => (
            <React.Fragment key={p}>
              <span className={i === arr.length - 1 ? 'text-gray-900 font-bold' : 'text-blue-600 hover:underline cursor-pointer'} onClick={() => i < arr.length - 1 && setDepth(i)}>{p}</span>
              {i < arr.length - 1 && <span className="text-gray-400">/</span>}
            </React.Fragment>
          ))}
        </nav>
        {depth < 3 && <button onClick={() => setDepth(d => Math.min(3, d+1))} className="text-xs font-bold text-blue-600 hover:underline self-start">Go Deeper →</button>}
      </div>
    </EffectCard>
  );
}

export default function NavigationEffects() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <ShrinkingHeader />
      <TransparentToSolid />
      <HideOnScroll />
      <AnimatedUnderline />
      <GlassHeader />
      <MobileBottomNav />
      <AnimatedTabBar />
      <CollapsibleSidebar />
      <ExpandingSearch />
      <BreadcrumbNav />
    </div>
  );
}