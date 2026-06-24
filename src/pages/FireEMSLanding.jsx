import React from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '@/components/navigator/SiteHeader';
import PrototypeBanner from '@/components/PrototypeBanner';
import PrototypeFooter from '@/components/PrototypeFooter';
import { Layers, Volume2, Lightbulb, Zap, ArrowRight, Shield, ChevronRight, Phone, FileDown } from 'lucide-react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const CATEGORIES = [
  { name: 'Light Bars',         icon: <Layers size={28} />,     link: '#', desc: 'Full-size and low-profile LED light bars built for fire and EMS apparatus.' },
  { name: 'Sirens & Speakers',  icon: <Volume2 size={28} />,    link: '#', desc: 'High-decibel sirens including the iconic Q-Siren® for maximum warning distance.' },
  { name: 'Perimeter Lights',   icon: <Lightbulb size={28} />,  link: '#', desc: 'Scene lighting and perimeter warning for all angles of the apparatus.' },
  { name: 'Interior Lighting',  icon: <Zap size={28} />,        link: '#', desc: 'Compartment and cab lighting engineered for harsh conditions.' },
  { name: 'SignalMasters',      icon: <ArrowRight size={28} />, link: '#', desc: 'Direct traffic away from emergency scenes with rear-facing directional arrows.' },
  { name: 'Accessories',        icon: <Shield size={28} />,     link: '#', desc: 'Mounting hardware, controllers, and installation accessories.' },
];

const FEATURED = [
  {
    name: 'Q-Siren®',
    tagline: 'The unmistakable sound of safety.',
    image: 'https://www.fedsig.com/wp-content/uploads/2024/10/Q-Siren.hero_-900x600.jpg',
    desc: 'The Q-Siren® delivers the powerful, instantly recognizable wail that fire and EMS crews have trusted for decades.',
  },
  {
    name: 'Navigator® Serial Light Bar',
    tagline: 'Command-grade light output for apparatus.',
    image: 'https://www.fedsig.com/wp-content/uploads/2024/09/navigator-serial-light-bar.hero_-900x600.jpg',
    desc: 'Aluminum extrusion chassis with sealed wiring connectors. Rated for continuous duty in the most demanding environments.',
  },
  {
    name: 'FireRay® LED',
    tagline: 'Warning from every angle.',
    image: 'https://www.fedsig.com/wp-content/uploads/2024/09/fireray-led.hero_-900x600.jpg',
    desc: 'Perimeter lighting engineered for fire apparatus — IP67-rated, vibration-resistant, and available in multiple mounting configurations.',
  },
];

function SectionLabel({ text }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ ...FS, fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>{text}</p>
      <div style={{ width: 40, height: 3, background: '#c8102e' }} />
    </div>
  );
}

function RedLink({ href = '#', children }) {
  return (
    <a href={href}
      style={{ ...FS, fontSize: 14, fontWeight: 700, color: '#c8102e', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}
      onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
      onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
    >
      {children} <ChevronRight size={14} />
    </a>
  );
}

export default function FireEMSLanding() {
  return (
    <div className="min-h-screen bg-white" style={FS}>
      <PrototypeBanner />
      <SiteHeader activeVertical="fire" />

      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: '#111', minHeight: 380 }}>
        <img
          src="https://www.fedsig.com/wp-content/uploads/2024/10/Q-Siren.hero_-900x600.jpg"
          alt="Fire EMS vehicle"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="relative max-w-7xl mx-auto px-6 py-20" style={{ minHeight: 380, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 700, color: '#fff', lineHeight: 1.15, maxWidth: 580, marginBottom: '1rem' }}>
            Fire and EMS Vehicle Safety Devices
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.82)', maxWidth: 520, lineHeight: 1.65, marginBottom: '1.5rem' }}>
            Engineering the most reliable, durable, and high-performing products for your emergency vehicles.
          </p>
          <RedLink href="#">Explore Products</RedLink>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: '#c8102e' }} />
      </div>

      {/* Featured Products */}
      <div className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <SectionLabel text="New and Featured" />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.4rem' }}>Featured Fire & EMS Products</h2>
          <p style={{ fontSize: 14, color: '#777', marginBottom: '2rem' }}>Trusted by fire departments and EMS agencies nationwide.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem' }}>
            {FEATURED.map(p => (
              <a key={p.name} href="#" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="bg-white border border-gray-200 overflow-hidden h-full flex flex-col"
                  style={{ transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#c8102e'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                >
                  <img src={p.image} alt={p.name} className="w-full object-cover" style={{ height: 200 }} />
                  <div className="p-5 flex flex-col flex-1">
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 3 }}>{p.name}</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#c8102e', marginBottom: 8, fontStyle: 'italic' }}>{p.tagline}</p>
                    <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, flex: 1 }}>{p.desc}</p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#c8102e', marginTop: 12, letterSpacing: '0.04em' }}>LEARN MORE</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Category Grid */}
      <div className="max-w-7xl mx-auto px-6 py-14">
        <SectionLabel text="Product Categories" />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a1a', marginBottom: '0.4rem' }}>Fire & EMS Warning Equipment</h2>
        <p style={{ fontSize: 14, color: '#777', marginBottom: '2rem' }}>Explore lighting, sirens, and accessories built for fire apparatus and EMS vehicles.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
          {CATEGORIES.map(cat => (
            <a key={cat.name} href={cat.link} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="border border-gray-200 p-5 flex flex-col gap-3 h-full"
                style={{ transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#c8102e'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                <div style={{ color: '#c8102e' }}>{cat.icon}</div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{cat.name}</p>
                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.55 }}>{cat.desc}</p>
              </div>
            </a>
          ))}
        </div>
        <RedLink href="#">Contact a Sales Rep</RedLink>
      </div>

      {/* Resources strip */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {[
              { icon: <Phone size={18} />, label: 'Need Assistance?', desc: 'Our expert sales team is available to help spec the right solution for your apparatus.' },
              { icon: <FileDown size={18} />, label: 'Download Catalog', desc: 'Get our complete Fire & EMS product catalog for the full range of available solutions.' },
            ].map(r => (
              <a key={r.label} href="#" className="bg-white border border-gray-200 p-5 flex gap-4 items-start"
                style={{ textDecoration: 'none', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#c8102e'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                <div style={{ color: '#c8102e', marginTop: 2 }}>{r.icon}</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 3 }}>{r.label}</p>
                  <p style={{ fontSize: 12, color: '#777', lineHeight: 1.55 }}>{r.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <PrototypeFooter />
    </div>
  );
}