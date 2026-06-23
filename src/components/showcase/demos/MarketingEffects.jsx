import React, { useState, useEffect } from 'react';
import { EffectCard } from '../ShowcaseCategoryPage';

function HeroBanner() {
  return (
    <EffectCard title="Hero Banner" desc="Full-width promotional header" whenToUse="Landing pages, product launches, announcements."
      prompt="Create a hero banner with gradient background, headline, subtext, and a CTA button"
      code={`<div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white text-center py-10 px-6 rounded-xl">\n  <h2 className="text-2xl font-black mb-2">Launch Your Business Today</h2>\n  <p className="text-blue-100 mb-4">Get started with our premium features</p>\n  <button className="bg-white text-blue-700 font-bold px-6 py-2 rounded-full">Get Started Free</button>\n</div>`}>
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white text-center py-6 px-5 rounded-xl w-full max-w-xs">
        <div className="text-lg font-black mb-1">Launch Your Business Today</div>
        <div className="text-blue-200 text-xs mb-3">Get started with our premium features</div>
        <button className="bg-white text-blue-700 font-bold px-5 py-1.5 rounded-full text-sm">Get Started Free</button>
      </div>
    </EffectCard>
  );
}

function TestimonialCard() {
  return (
    <EffectCard title="Testimonial Card" desc="Customer review display" whenToUse="Social proof, reviews, customer stories."
      prompt="Create a testimonial card with quote, star rating, avatar, name and title"
      code={`<div className="bg-white border rounded-xl p-5 shadow-sm">\n  <div className="text-yellow-400 mb-2">★★★★★</div>\n  <p className="text-gray-700 italic mb-4">"This product completely transformed our workflow."</p>\n  <div className="flex items-center gap-3">\n    <img className="w-10 h-10 rounded-full" />\n    <div>\n      <div className="font-bold">Sarah Johnson</div>\n      <div className="text-gray-500 text-xs">CEO, TechCorp</div>\n    </div>\n  </div>\n</div>`}>
      <div className="bg-white border border-gray-200 rounded-xl p-4 w-full max-w-xs shadow-sm">
        <div className="text-yellow-400 text-sm mb-2">★★★★★</div>
        <p className="text-gray-700 text-xs italic mb-3">"This product completely transformed our workflow. Highly recommended!"</p>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">SJ</div>
          <div>
            <div className="font-bold text-xs text-gray-900">Sarah Johnson</div>
            <div className="text-gray-500 text-[10px]">CEO, TechCorp</div>
          </div>
        </div>
      </div>
    </EffectCard>
  );
}

function PricingCard() {
  return (
    <EffectCard title="Pricing Card" desc="Subscription plan display" whenToUse="Pricing pages, plan comparison, upgrades."
      prompt="Create a pricing card with a 'Most Popular' badge, plan name, price, feature list, and CTA button"
      code={`<div className="relative border-2 border-blue-500 rounded-xl p-5">\n  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>\n  <div className="text-xl font-black">Pro Plan</div>\n  <div className="text-3xl font-black my-2">$29<span className="text-sm font-normal">/mo</span></div>\n  {features.map(f => <div key={f} className="flex items-center gap-2 text-sm"><span>✓</span>{f}</div>)}\n  <button className="w-full mt-4 bg-blue-600 text-white font-bold py-2 rounded-lg">Subscribe Now</button>\n</div>`}>
      <div className="relative border-2 border-blue-500 rounded-xl p-4 w-full max-w-xs">
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">Most Popular</span>
        <div className="font-black text-gray-900 mt-1">Pro Plan</div>
        <div className="text-2xl font-black my-1">$29<span className="text-sm font-normal text-gray-500">/month</span></div>
        <div className="space-y-1 my-3">
          {['Unlimited projects', 'Priority support', 'Advanced analytics'].map(f => (
            <div key={f} className="flex items-center gap-1.5 text-xs text-gray-600"><span className="text-green-500">✓</span>{f}</div>
          ))}
        </div>
        <button className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-sm">Subscribe Now</button>
      </div>
    </EffectCard>
  );
}

function CountdownTimer() {
  const [time, setTime] = useState({ d: 2, h: 14, m: 32, s: 39 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime(prev => {
        let { d, h, m, s } = prev;
        s--; if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) { h = 23; d--; }
        return { d: Math.max(0,d), h: Math.max(0,h), m: Math.max(0,m), s: Math.max(0,s) };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const pad = n => String(n).padStart(2, '0');
  return (
    <EffectCard title="Countdown Timer" desc="Urgency-driven timer" whenToUse="Flash sales, launches, limited offers."
      prompt="Create a countdown timer with days, hours, minutes, seconds that counts down every second using setInterval"
      code={`const [time, setTime] = useState({ d:2, h:14, m:32, s:39 });\nuseEffect(() => {\n  const t = setInterval(() => setTime(prev => {\n    let { d, h, m, s } = prev;\n    s--; if (s<0) { s=59; m--; } if (m<0) { m=59; h--; }\n    return { d, h, m, s: Math.max(0,s) };\n  }), 1000);\n  return () => clearInterval(t);\n}, []);`}>
      <div className="text-center">
        <div className="text-xs font-bold text-gray-500 mb-2">Offer ends in</div>
        <div className="flex gap-2">
          {[{v: pad(time.d), l: 'Days'}, {v: pad(time.h), l: 'Hrs'}, {v: pad(time.m), l: 'Min'}, {v: pad(time.s), l: 'Sec'}].map(({v,l}) => (
            <div key={l} className="bg-gray-900 text-white rounded-lg p-2 min-w-[44px] text-center">
              <div className="text-xl font-black tabular-nums">{v}</div>
              <div className="text-[9px] text-gray-400">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </EffectCard>
  );
}

function SocialProof() {
  return (
    <EffectCard title="Social Proof Counter" desc="Trust-building numbers" whenToUse="Landing pages, about sections, credibility."
      prompt="Create a social proof counter row with key stats like user count, rating, and uptime"
      code={`<div className="flex gap-6">\n  {stats.map(({value, label}) => (\n    <div key={label} className="text-center">\n      <div className="text-2xl font-black">{value}</div>\n      <div className="text-gray-500 text-xs">{label}</div>\n    </div>\n  ))}\n</div>`}>
      <div className="flex gap-6 py-2">
        {[{v:'10K+',l:'Users'},{v:'4.9',l:'Rating'},{v:'99%',l:'Uptime'}].map(({v,l}) => (
          <div key={l} className="text-center">
            <div className="text-2xl font-black text-gray-900">{v}</div>
            <div className="text-gray-500 text-xs">{l}</div>
          </div>
        ))}
      </div>
    </EffectCard>
  );
}

function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  return (
    <EffectCard title="Announcement Bar" desc="Top page notification strip" whenToUse="Promotions, updates, shipping info."
      prompt="Create a dismissible announcement bar fixed to the top of the page with close button"
      code={`{visible && (\n  <div className="bg-blue-600 text-white text-sm py-2 px-4 flex items-center justify-between">\n    🎉 New feature launch! <a href="#">Learn more</a>\n    <button onClick={() => setVisible(false)}>✕</button>\n  </div>\n)}`}>
      <div className="w-full max-w-xs">
        {visible ? (
          <div className="bg-blue-600 text-white text-xs py-2 px-3 rounded-lg flex items-center justify-between gap-2">
            <span>🎉 New feature launch! <a href="#" className="underline">Learn more</a></span>
            <button onClick={() => setVisible(false)} className="text-white/70 hover:text-white">✕</button>
          </div>
        ) : (
          <button onClick={() => setVisible(true)} className="text-xs font-bold border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600">Show Bar</button>
        )}
      </div>
    </EffectCard>
  );
}

function DiscountCode() {
  const [copied, setCopied] = useState(false);
  return (
    <EffectCard title="Discount Code" desc="Copyable promo code" whenToUse="Promotions, coupons, special offers."
      prompt="Create a copyable promo code with a monospace display and a copy button that shows a check on success"
      code={`<div className="flex items-center gap-2 border-2 border-dashed border-green-400 rounded-lg px-4 py-2">\n  <span className="font-mono font-bold">SAVE20</span>\n  <button onClick={() => { navigator.clipboard.writeText('SAVE20'); setCopied(true); }}>Copy</button>\n</div>`}>
      <div className="flex items-center gap-2 border-2 border-dashed border-green-400 rounded-lg px-4 py-3">
        <span className="font-mono font-bold text-gray-900 tracking-widest">SAVE20</span>
        <button onClick={() => { navigator.clipboard.writeText('SAVE20').catch(()=>{}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className={`text-xs font-bold px-2 py-1 rounded transition-colors ${copied ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          {copied ? '✓' : 'Copy'}
        </button>
      </div>
    </EffectCard>
  );
}

function LiveSalesPopup() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setVisible(v => !v), 4000);
    return () => clearInterval(t);
  }, []);
  const people = ['John', 'Sarah', 'Mike', 'Emma', 'Alex'];
  const [name] = useState(() => people[Math.floor(Math.random() * people.length)]);
  return (
    <EffectCard title="Live Sales Popup" desc="Real-time purchase notifications" whenToUse="E-commerce, FOMO, social proof."
      prompt="Create an auto-cycling notification popup showing recent purchases to create FOMO"
      code={`// Auto-cycle visibility every 4 seconds\nconst [visible, setVisible] = useState(true);\nuseEffect(() => {\n  const t = setInterval(() => setVisible(v => !v), 4000);\n  return () => clearInterval(t);\n}, []);\n// Show popup: "John just purchased Pro Plan - 2 min ago"`}>
      <div className="w-full max-w-xs relative h-16 flex items-center">
        {visible && (
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 w-full" style={{ animation: 'slideIn 0.3s ease-out' }}>
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{name[0]}</div>
            <div>
              <div className="text-xs font-bold text-gray-900">{name} just purchased</div>
              <div className="text-[10px] text-gray-500">Pro Plan - 2 min ago</div>
            </div>
          </div>
        )}
        <style>{`@keyframes slideIn { from{transform:translateX(-20px);opacity:0} to{transform:translateX(0);opacity:1} }`}</style>
      </div>
    </EffectCard>
  );
}

function BundleDeal() {
  return (
    <EffectCard title="Bundle Deal" desc="Multi-product package offer" whenToUse="Upsells, product bundles, package deals."
      prompt="Create a bundle deal card showing original vs discounted price with included items list"
      code={`<div className="border-2 border-orange-400 rounded-xl p-4">\n  <div className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full w-fit mb-2">Save 40%</div>\n  <div className="text-xl font-black">$99 <span className="line-through text-gray-400 text-sm font-normal">$165</span></div>\n  {items.map(i => <div key={i}>✓ {i}</div>)}\n  <button>Get Bundle</button>\n</div>`}>
      <div className="border-2 border-orange-400 rounded-xl p-4 w-full max-w-xs">
        <div className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mb-2">Save 40%</div>
        <div className="font-black text-gray-900 mb-1">Ultimate Bundle</div>
        <div className="text-xl font-black text-gray-900">$99 <span className="line-through text-gray-400 text-sm font-normal">$165</span></div>
        <div className="space-y-0.5 my-2">
          {['Product A', 'Product B', 'Product C'].map(p => (
            <div key={p} className="flex items-center gap-1 text-xs text-gray-600"><span className="text-green-500">✓</span>{p}</div>
          ))}
        </div>
        <button className="w-full bg-orange-500 text-white font-bold py-2 rounded-lg text-sm">Get Bundle</button>
      </div>
    </EffectCard>
  );
}

function LimitedStock() {
  const [count] = useState(3);
  return (
    <EffectCard title="Limited Stock Alert" desc="Scarcity indicator" whenToUse="E-commerce, limited offers, FOMO."
      prompt="Create a low stock alert with pulsing dot and urgency text in red"
      code={`<div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">\n  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />\n  <span className="text-red-700 font-bold text-sm">Only {count} left in stock!</span>\n</div>`}>
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
        <span className="text-red-700 font-bold text-sm">Only {count} left in stock!</span>
      </div>
    </EffectCard>
  );
}

export default function MarketingEffects() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <HeroBanner />
      <TestimonialCard />
      <PricingCard />
      <CountdownTimer />
      <SocialProof />
      <AnnouncementBar />
      <DiscountCode />
      <LiveSalesPopup />
      <BundleDeal />
      <LimitedStock />
    </div>
  );
}