import React from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '@/components/navigator/SiteHeader';
import PrototypeBanner from '@/components/PrototypeBanner';
import DebugPanel from '@/components/DebugPanel';
import {
  Zap, Volume2, Lightbulb, ArrowRight, Shield, AlertTriangle,
  Layers, ChevronRight, Settings, FileDown, Phone
} from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const CATEGORIES = [
  { label: 'Light Bars',           icon: <Layers size={28} />,       to: '/family/navigator',  desc: 'Get safe and reliable LED light bars equipped with exclusive technologies.' },
  { label: 'Sirens & Speakers',    icon: <Volume2 size={28} />,       to: '#',                  desc: 'Grab the attention of drivers and clear the path for a safe arrival to the scene.' },
  { label: 'Perimeter Lights',     icon: <Lightbulb size={28} />,     to: '#',                  desc: 'Install additional warnings around the perimeter of your police car.' },
  { label: 'SignalMasters',        icon: <ArrowRight size={28} />,    to: '#',                  desc: 'Direct rear-approaching vehicles away from the scene for added safety.' },
  { label: 'Push Bumpers',         icon: <Shield size={28} />,        to: '#',                  desc: 'Maximize safety with tools designed for durability and protection.' },
  { label: 'Stinger Spike System', icon: <AlertTriangle size={28} />, to: '#',                  desc: 'Control the situation with systems that support quick and reliable de-escalation.' },
  { label: 'Compartment Lights',   icon: <Lightbulb size={28} />,     to: '#',                  desc: 'Take action with innovative compartment lighting.' },
  { label: 'Police Accessories',   icon: <Zap size={28} />,           to: '#',                  desc: 'Provide additional security with a variety of accessories and signaling devices.' },
];

const FEATURED = [
  { label: 'DynaFlare™', desc: 'Low-profile, tri-color perimeter light featuring optically clear potting. IP68 and IP69K rated.', img: 'https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=600&q=80', to: '#' },
  { label: 'Pathfinder® PF400 Light/Siren Controller', desc: 'When your officers are in pursuit, every second counts. Frees officers to focus fully on the task at hand.', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', to: '#' },
  { label: 'Valor® Light Bar', desc: 'The first and only non-linear, low-profile lightbar engineered to increase visibility for critical intersection clearing.', img: 'https://images.unsplash.com/photo-1491308055032-5e505b042271?w=600&q=80', to: '#' },
  { label: 'Allegiant® Max Serial Light Bar', desc: 'Allegiant® Max delivers enhanced safety, performance, and reliability—our latest innovation in the Allegiant light bar series.', img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80', to: '#' },
];

const CONTRACTS = [
  { label: 'PCA Contract', desc: 'Federal Signal warning solutions are available to government agencies through PCA cooperative purchasing contracts.' },
  { label: 'GSA Contract', desc: 'Our warning solutions are accessible through the online General Services Administration (GSA).' },
  { label: 'NASPO ValuePoint', desc: 'Our warning solutions are accessible to government agencies through NASPO cooperative purchasing contracts.' },
];

function SectionLabel({ text }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <p style={{ ...FS, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>{text}</p>
      <div style={{ width: 40, height: 3, background: '#c8102e' }} />
    </div>
  );
}

function RedLink({ href = '#', children, external }) {
  const props = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <a href={href} {...props}
      style={{ ...FS, fontSize: 14, fontWeight: 700, color: '#c8102e', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}
      onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
      onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
    >
      {children} <ChevronRight size={14} />
    </a>
  );
}

export default function PoliceLanding() {
  return (
    <div className="min-h-screen bg-white" style={FS}>
      <PrototypeBanner />
      <SiteHeader activeVertical="police" />

      {/* Hero Banner */}
      <div className="relative overflow-hidden" style={{ background: '#111', minHeight: 380 }}>
        <img src="https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=1600&q=85" alt="Police vehicle" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="relative max-w-7xl mx-auto px-6 py-20 flex flex-col justify-center" style={{ minHeight: 380 }}>
          <h1 style={{ ...FS, fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 700, color: '#fff', lineHeight: 1.15, maxWidth: 580, marginBottom: '1rem' }}>
            Police Vehicle Safety Devices
          </h1>
          <p style={{ ...FS, fontSize: 16, color: 'rgba(255,255,255,0.82)', maxWidth: 520, lineHeight: 1.65, marginBottom: '1.5rem' }}>
            Every moment of every day, we go beyond the call. Take comfort in our commitment to engineer the most reliable, durable, and high-performing products for your emergency vehicle.
          </p>
          <RedLink href="#">Learn More</RedLink>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: '#c8102e' }} />
      </div>

      {/* Featured Article */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
          <div style={{ flex: '0 0 40%' }}>
            <SectionLabel text="Federal Signal Police Vehicle Equipment" />
            <h2 style={{ ...FS, fontSize: 'clamp(1.4rem,2.5vw,1.9rem)', fontWeight: 700, color: '#1a1a1a', lineHeight: 1.25, marginBottom: '1rem' }}>
              Risk Reduction: Siren Power & Warning Distance
            </h2>
            <p style={{ ...FS, fontSize: 15, color: '#555', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              Seconds count on every response. The faster surrounding drivers can detect, recognize, and respond to your siren, the safer the outcome for you and the community you protect.
            </p>
            <RedLink href="#">Learn More</RedLink>
          </div>
          <div style={{ flex: 1 }}>
            <div className="overflow-hidden" style={{ height: 260 }}>
              <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80" alt="Siren demonstration" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>

      {/* New & Featured Products */}
      <div className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <SectionLabel text="New and Featured" />
          <h2 style={{ ...FS, fontSize: '1.6rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.4rem' }}>Our Latest and Featured Police Emergency Products</h2>
          <p style={{ ...FS, fontSize: 14, color: '#777', marginBottom: '2rem' }}>View the most recent innovations in police vehicle safety</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.5rem' }}>
            {FEATURED.map(p => (
              <Link key={p.label} to={p.to} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="bg-white border border-gray-200 hover:border-[#c8102e] transition-colors overflow-hidden h-full flex flex-col">
                  <img src={p.img} alt={p.label} className="w-full object-cover" style={{ height: 180 }} onError={e => { e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=60'; }} />
                  <div className="p-4 flex flex-col flex-1">
                    <p style={{ ...FS, fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: '0.4rem' }}>{p.label}</p>
                    <p style={{ ...FS, fontSize: 13, color: '#666', lineHeight: 1.55, flex: 1 }}>{p.desc}</p>
                    <p style={{ ...FS, fontSize: 12, fontWeight: 700, color: '#c8102e', marginTop: '0.75rem', letterSpacing: '0.04em' }}>LEARN MORE</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Category Grid */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <h2 style={{ ...FS, fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.4rem' }}>Risk-Reducing Police Vehicle Equipment You Can Depend On</h2>
        <p style={{ ...FS, fontSize: 14, color: '#777', marginBottom: '2rem' }}>Explore exterior and interior warning lights, sirens, speakers, directional lighting, and more.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          {CATEGORIES.map(cat => (
            <Link key={cat.label} to={cat.to} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="border border-gray-200 hover:border-[#c8102e] transition-all p-5 flex flex-col items-start gap-3 h-full">
                <div className="text-[#c8102e]">{cat.icon}</div>
                <p style={{ ...FS, fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{cat.label}</p>
                <p style={{ ...FS, fontSize: 13, color: '#666', lineHeight: 1.55 }}>{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
        <RedLink href="#">Get Help From a Sales Rep</RedLink>
      </div>

      {/* Configurators */}
      <div className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <SectionLabel text="Configurators" />
          <h2 style={{ ...FS, fontSize: '1.6rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '2rem' }}>Custom Police Lighting and Siren Solutions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {[
              { label: 'Customize Your Police Light Bar', desc: 'Build your ideal lightbar with choices of color, features, mounts, and controller for optical performance.', href: 'https://config.fedsig.com/lightbar/', icon: <Settings size={28} /> },
              { label: 'Build Your Police Car Warning Package', desc: 'Outfit your police fleet with high-quality lights, sirens, and push bumpers and then place your order today.', href: '#', icon: <Shield size={28} /> },
            ].map(c => (
              <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
                className="bg-white border border-gray-200 hover:border-[#c8102e] transition-colors p-6 flex gap-4 items-start"
                style={{ textDecoration: 'none' }}>
                <div className="text-[#c8102e] shrink-0 mt-0.5">{c.icon}</div>
                <div>
                  <p style={{ ...FS, fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: '0.35rem' }}>{c.label}</p>
                  <p style={{ ...FS, fontSize: 13, color: '#666', lineHeight: 1.55 }}>{c.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Where to Buy */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <SectionLabel text="Where to buy" />
        <h2 style={{ ...FS, fontSize: '1.6rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '2rem' }}>Find the Right Solution for Your Business</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {CONTRACTS.map(c => (
            <div key={c.label} className="border border-gray-200 p-5">
              <p style={{ ...FS, fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: '0.4rem' }}>{c.label}</p>
              <p style={{ ...FS, fontSize: 13, color: '#666', lineHeight: 1.6 }}>{c.desc}</p>
            </div>
          ))}
        </div>
        <RedLink href="#">Find your rep today</RedLink>
      </div>

      {/* Resources */}
      <div className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
            <div>
              <SectionLabel text="Resource Library" />
              <h2 style={{ ...FS, fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.75rem' }}>Expand Your Product Knowledge</h2>
              <p style={{ ...FS, fontSize: 15, color: '#555', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                Offering a variety of tools to learn more about our products and to support your goal to ensure safety for all.
              </p>
              <RedLink href="#">Find Resources</RedLink>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { icon: <Phone size={18} />, label: 'Need Assistance?', desc: 'Get the answers you need. When you need them. Our expert customer support and sales team are here to help.' },
                { icon: <FileDown size={18} />, label: 'Download Catalog', desc: 'Download our complete catalog to explore a comprehensive range of police emergency products.' },
              ].map(r => (
                <a key={r.label} href="#"
                  className="bg-white border border-gray-200 hover:border-[#c8102e] transition-colors p-4 flex gap-3 items-start"
                  style={{ textDecoration: 'none' }}>
                  <div className="text-[#c8102e] shrink-0 mt-0.5">{r.icon}</div>
                  <div>
                    <p style={{ ...FS, fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: '0.2rem' }}>{r.label}</p>
                    <p style={{ ...FS, fontSize: 12, color: '#777', lineHeight: 1.55 }}>{r.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DebugPanel />
    </div>
  );
}