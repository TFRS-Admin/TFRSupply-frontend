import React, { useState, useEffect } from 'react';
import { EffectCard } from '../ShowcaseCategoryPage';

function HeroBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-8 py-8 text-center w-full max-w-xs">
      <h2 className="text-2xl font-black mb-2">Launch Your Business Today</h2>
      <p className="text-blue-100 text-sm mb-4">Get started with our premium features</p>
      <button className="bg-white text-blue-600 font-black px-6 py-2.5 rounded-full text-sm hover:shadow-lg transition-shadow">Get Started Free</button>
    </div>
  );
}

function TestimonialCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 w-56 shadow-sm">
      <div className="text-yellow-400 text-lg mb-3">★★★★★</div>
      <p className="text-gray-700 text-xs italic mb-4">"This product completely transformed our workflow. Highly recommended!"</p>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-black text-blue-600">S</div>
        <div><div className="font-bold text-gray-900 text-xs">Sarah Johnson</div><div className="text-gray-500 text-[10px]">CEO, TechCorp</div></div>
      </div>
    </div>
  );
}

function PricingCard() {
  return (
    <div className="bg-white border-2 border-blue-500 rounded-xl p-5 w-44 shadow-lg relative text-center">
      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-3 py-0.5 rounded-full">Most Popular</div>
      <h3 className="font-black text-gray-900 mt-2">Pro Plan</h3>
      <div className="text-2xl font-black text-blue-600 my-2">$29<span className="text-sm font-normal text-gray-500">/mo</span></div>
      <ul className="text-xs text-gray-600 space-y-1 mb-4 text-left">
        <li>✓ Unlimited projects</li>
        <li>✓ Priority support</li>
        <li>✓ Advanced analytics</li>
      </ul>
      <button className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-xs">Subscribe Now</button>
    </div>
  );
}

function CountdownTimer() {
  const [time, setTime] = useState({ d: 2, h: 14, m: 32, s: 37 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime(prev => {
        let { d, h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; d--; }
        return { d: Math.max(0,d), h: Math.max(0,h), m: Math.max(0,m), s: Math.max(0,s) };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="text-center">
      <div className="text-xs text-gray-500 font-bold mb-2">Offer ends in</div>
      <div className="flex gap-2">
        {[['d','Days'],['h','Hrs'],['m','Min'],['s','Sec']].map(([k,l]) => (
          <div key={k} className="bg-gray-900 text-white rounded-lg p-2 w-14 text-center">
            <div className="text-xl font-black">{String(time[k]).padStart(2,'0')}</div>
            <div className="text-[9px] text-gray-400">{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmailCapture() {
  const [done, setDone] = useState(false);
  return done ? (
    <div className="text-green-600 font-bold text-sm">✓ You're subscribed!</div>
  ) : (
    <div className="flex gap-2">
      <input className="border border-gray-200 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-blue-400 w-40" placeholder="Enter your email" />
      <button onClick={() => setDone(true)} className="bg-blue-600 text-white font-bold px-4 py-2 rounded-full text-xs">Subscribe</button>
    </div>
  );
}

function SocialProof() {
  return (
    <div className="flex gap-6 text-center">
      {[['10K+','Users'],['4.9','Rating'],['99%','Uptime']].map(([v,l]) => (
        <div key={l}><div className="text-xl font-black text-gray-900">{v}</div><div className="text-xs text-gray-500">{l}</div></div>
      ))}
    </div>
  );
}

function LiveSalesPopup() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setVisible(v => !v), 3000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-3 shadow-lg flex items-center gap-3 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm">👤</div>
      <div><div className="font-bold text-gray-900 text-xs">John just purchased</div><div className="text-gray-500 text-[10px]">Pro Plan • 2 min ago</div></div>
    </div>
  );
}

function DiscountCode() {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-0">
      <div className="bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg px-4 py-2 text-sm font-mono font-bold text-gray-800">SAVE20</div>
      <button onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className="bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-r-lg border border-blue-600">
        {copied ? '✓' : 'Copy'}
      </button>
    </div>
  );
}

function UrgencyTimer() {
  const [s, setS] = useState(3599);
  useEffect(() => { const t = setInterval(() => setS(x => x > 0 ? x - 1 : 3599), 1000); return () => clearInterval(t); }, []);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return (
    <div className="bg-red-500 text-white rounded-xl px-5 py-3 text-center">
      <div className="text-[10px] font-black tracking-widest mb-1">⚡ FLASH SALE ENDS IN</div>
      <div className="flex gap-3 justify-center">
        {[[h,'H'],[m,'M'],[sec,'S']].map(([v,l]) => (
          <div key={l} className="text-center"><div className="text-2xl font-black">{String(v).padStart(2,'0')}</div><div className="text-[9px] opacity-70">{l}</div></div>
        ))}
      </div>
    </div>
  );
}

function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return <button onClick={() => setVisible(true)} className="text-xs text-blue-500">Show bar</button>;
  return (
    <div className="bg-blue-600 text-white text-xs font-semibold flex items-center justify-between px-4 py-2 rounded-lg w-full max-w-xs">
      <span>🎉 New feature launch! Check out our latest update</span>
      <button onClick={() => setVisible(false)} className="ml-2 opacity-70 hover:opacity-100 font-black">×</button>
    </div>
  );
}

export default function MarketingEffects() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <EffectCard title="Hero Banner" desc="Full-width promotional header" whenToUse="Landing pages, product launches, announcements." prompt="Create a hero banner with a gradient background (blue to purple), large white headline, subtitle, and a white CTA button with rounded-full shape." code={`<div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-8 py-8 text-center">\n  <h2 className="text-2xl font-black mb-2">Launch Your Business Today</h2>\n  <p className="text-blue-100 text-sm mb-4">Get started with our premium features</p>\n  <button className="bg-white text-blue-600 font-black px-6 py-2.5 rounded-full">Get Started Free</button>\n</div>`}><HeroBanner /></EffectCard>

      <EffectCard title="Testimonial Card" desc="Customer review display" whenToUse="Social proof, reviews, customer stories." prompt="Create a testimonial card with 5 star rating, italic quote, and user avatar with name and title below." code={`<div className="bg-white border rounded-xl p-5 shadow-sm">\n  <div className="text-yellow-400 text-lg mb-3">★★★★★</div>\n  <p className="text-gray-700 text-xs italic mb-4">"This product completely transformed our workflow."</p>\n  <div className="flex items-center gap-3">\n    <div className="w-8 h-8 bg-blue-100 rounded-full">S</div>\n    <div><div className="font-bold text-xs">Sarah Johnson</div>\n    <div className="text-gray-500 text-[10px]">CEO, TechCorp</div></div>\n  </div>\n</div>`}><TestimonialCard /></EffectCard>

      <EffectCard title="Pricing Card" desc="Subscription plan with 'Most Popular' badge" whenToUse="Pricing pages, plan comparison, upgrades." prompt="Create a pricing card with a 'Most Popular' badge on top, product name, price per month, 3 feature bullets, and a CTA button. Use blue border for the highlighted plan." code={`<div className="border-2 border-blue-500 rounded-xl p-5 relative text-center">\n  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-3 py-0.5 rounded-full">Most Popular</div>\n  <h3 className="font-black mt-2">Pro Plan</h3>\n  <div className="text-2xl font-black text-blue-600 my-2">$29<span className="text-sm text-gray-500">/mo</span></div>\n  <ul className="text-xs text-gray-600 space-y-1 mb-4 text-left">...</ul>\n  <button className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg">Subscribe Now</button>\n</div>`}><PricingCard /></EffectCard>

      <EffectCard title="Countdown Timer" desc="Live urgency timer counting down" whenToUse="Flash sales, launches, limited offers." prompt="Create a countdown timer with days, hours, minutes, seconds displayed in dark boxes. Update every second using useEffect with setInterval." code={`function CountdownTimer() {\n  const [time, setTime] = useState({ d:2, h:14, m:32, s:37 });\n  useEffect(() => {\n    const t = setInterval(() => {\n      setTime(prev => { /* decrement logic */ });\n    }, 1000);\n    return () => clearInterval(t);\n  }, []);\n  return (\n    <div className="flex gap-2">\n      {[['d','Days'],['h','Hrs'],['m','Min'],['s','Sec']].map(([k,l]) => (\n        <div className="bg-gray-900 text-white rounded-lg p-2 w-14 text-center">\n          <div className="text-xl font-black">{String(time[k]).padStart(2,'0')}</div>\n          <div className="text-[9px] text-gray-400">{l}</div>\n        </div>\n      ))}\n    </div>\n  );\n}`}><CountdownTimer /></EffectCard>

      <EffectCard title="Email Capture" desc="Newsletter subscription form" whenToUse="Lead generation, newsletters, updates." prompt="Create an email capture form with a rounded input and Subscribe button side by side. On submit, show a green success message '✓ You're subscribed!'" code={`function EmailCapture() {\n  const [done, setDone] = useState(false);\n  return done ? (\n    <div className="text-green-600 font-bold">✓ You're subscribed!</div>\n  ) : (\n    <div className="flex gap-2">\n      <input placeholder="Enter your email"\n        className="border rounded-full px-4 py-2 text-xs w-40" />\n      <button onClick={() => setDone(true)}\n        className="bg-blue-600 text-white font-bold px-4 py-2 rounded-full text-xs">\n        Subscribe\n      </button>\n    </div>\n  );\n}`}><EmailCapture /></EffectCard>

      <EffectCard title="Social Proof Counter" desc="Trust-building stats row" whenToUse="Landing pages, about sections, credibility." prompt="Create a horizontal row of 3 social proof numbers: 10K+ Users, 4.9 Rating, 99% Uptime. Large font-black numbers with small labels below." code={`<div className="flex gap-6 text-center">\n  {[['10K+','Users'],['4.9','Rating'],['99%','Uptime']].map(([v,l]) => (\n    <div key={l}>\n      <div className="text-xl font-black text-gray-900">{v}</div>\n      <div className="text-xs text-gray-500">{l}</div>\n    </div>\n  ))}\n</div>`}><SocialProof /></EffectCard>

      <EffectCard title="Live Sales Popup" desc="Real-time purchase notifications" whenToUse="E-commerce, FOMO, social proof." prompt="Create a live sales popup that fades in/out every 3 seconds showing 'John just purchased Pro Plan • 2 min ago' with an avatar." code={`function LivePopup() {\n  const [visible, setVisible] = useState(true);\n  useEffect(() => {\n    const t = setInterval(() => setVisible(v => !v), 3000);\n    return () => clearInterval(t);\n  }, []);\n  return (\n    <div className={\`bg-white border rounded-xl p-3 shadow-lg flex items-center gap-3 transition-all \${visible ? 'opacity-100' : 'opacity-0'}\`}>\n      <div className="w-8 h-8 bg-blue-100 rounded-full">👤</div>\n      <div><div className="font-bold text-xs">John just purchased</div>\n      <div className="text-gray-500 text-[10px]">Pro Plan • 2 min ago</div></div>\n    </div>\n  );\n}`}><LiveSalesPopup /></EffectCard>

      <EffectCard title="Discount Code" desc="Copyable promo code" whenToUse="Promotions, coupons, special offers." prompt="Create a copyable discount code with a mono-font code in a gray box and a Copy button that changes to a checkmark when clicked." code={`function DiscountCode() {\n  const [copied, setCopied] = useState(false);\n  return (\n    <div className="flex">\n      <div className="bg-gray-100 border border-r-0 rounded-l-lg px-4 py-2 font-mono font-bold">SAVE20</div>\n      <button onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}\n        className="bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-r-lg">\n        {copied ? '✓' : 'Copy'}\n      </button>\n    </div>\n  );\n}`}><DiscountCode /></EffectCard>

      <EffectCard title="Urgency Timer" desc="Flash sale countdown banner" whenToUse="Flash sales, limited deals, urgency marketing." prompt="Create a red urgency banner with '⚡ FLASH SALE ENDS IN' text and H/M/S countdown updating every second." code={`function UrgencyTimer() {\n  const [s, setS] = useState(3599);\n  useEffect(() => {\n    const t = setInterval(() => setS(x => x > 0 ? x-1 : 3599), 1000);\n    return () => clearInterval(t);\n  }, []);\n  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;\n  return (\n    <div className="bg-red-500 text-white rounded-xl px-5 py-3 text-center">\n      <div className="text-[10px] font-black mb-1">⚡ FLASH SALE ENDS IN</div>\n      <div className="flex gap-3 justify-center">\n        {[[h,'H'],[m,'M'],[sec,'S']].map(([v,l]) => (\n          <div><div className="text-2xl font-black">{String(v).padStart(2,'0')}</div><div className="text-[9px]">{l}</div></div>\n        ))}\n      </div>\n    </div>\n  );\n}`}><UrgencyTimer /></EffectCard>

      <EffectCard title="Announcement Bar" desc="Top page notification with dismiss" whenToUse="Promotions, updates, shipping info." prompt="Create a dismissible announcement bar in blue with a message and X close button on the right." code={`function AnnouncementBar() {\n  const [visible, setVisible] = useState(true);\n  if (!visible) return null;\n  return (\n    <div className="bg-blue-600 text-white text-xs font-semibold flex items-center justify-between px-4 py-2">\n      <span>🎉 New feature launch!</span>\n      <button onClick={() => setVisible(false)}>×</button>\n    </div>\n  );\n}`}><AnnouncementBar /></EffectCard>
    </div>
  );
}