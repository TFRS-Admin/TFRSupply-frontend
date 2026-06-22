import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, ShoppingCart, CheckCircle, AlertTriangle, Send, X } from 'lucide-react';
import { FAMILIES } from '@/data/sampleData';
import { useConfigurator } from '@/context/ConfiguratorContext';
import PrototypeBanner from '@/components/PrototypeBanner';
import DebugToggle from '@/components/DebugToggle';
import DebugPanel from '@/components/DebugPanel';

export default function CheckoutDecision() {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const { state } = useConfigurator();
  const family = FAMILIES[familyId];
  const [mode, setMode] = useState(null); // 'quote' | 'cart'
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', agency: '', email: '', phone: '', notes: '' });

  const { vehicle, coreOption, accessories, resolvedDependencies } = state;
  const totalPrice =
    (coreOption?.price || 0) +
    accessories.reduce((sum, a) => sum + a.price, 0) +
    resolvedDependencies.reduce((sum, d) => sum + d.price, 0);
  const skuOutcome = `${family?.baseSkuPrefix}-${vehicle.year?.slice(-2)}-${vehicle.make?.slice(0,3).toUpperCase()}-${coreOption?.sku?.split('-').pop() || 'XX'}`;
  const hasVerification = resolvedDependencies.some(d => d.status === 'needs_verification') || accessories.some(a => a.verificationNeeded);

  const allItems = [
    coreOption && { label: coreOption.label, sku: coreOption.sku, price: coreOption.price, type: 'core' },
    ...accessories.map(a => ({ ...a, type: 'accessory' })),
    ...resolvedDependencies.map(d => ({ ...d, type: 'dependency' })),
  ].filter(Boolean);

  const MiniSummary = () => (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-3">
      <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-1">Build Summary</div>
      <div className="text-xs text-gray-500">
        <span className="text-white font-semibold">{vehicle.year} {vehicle.make} {vehicle.model}</span> — {family?.name} Series
      </div>
      <div className="text-[10px] font-mono bg-black/30 rounded-lg px-3 py-2 text-gray-400">
        Config: <span className="text-white">{skuOutcome}</span>
      </div>
      <div className="divide-y divide-white/[0.06]">
        {allItems.map((item, i) => (
          <div key={i} className="flex items-center justify-between py-1.5">
            <div className="flex items-center gap-2 min-w-0">
              {item.status === 'needs_verification' || item.verificationNeeded
                ? <AlertTriangle size={10} className="text-amber-400 shrink-0" />
                : <CheckCircle size={10} className="text-green-400 shrink-0" />}
              <span className="text-xs text-gray-300 truncate">{item.label}</span>
            </div>
            <span className="text-xs font-bold text-white shrink-0 ml-2">${item.price}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-white/10">
        <span className="text-xs font-bold text-gray-400">Estimated Total</span>
        <span className="text-lg font-extrabold text-white">${totalPrice.toLocaleString()}</span>
      </div>
      {hasVerification && (
        <div className="flex items-center gap-2 text-amber-400 text-xs bg-amber-500/10 rounded-lg px-3 py-2">
          <AlertTriangle size={11} /> Contains items needing specialist verification
        </div>
      )}
    </div>
  );

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] text-white flex flex-col">
        <PrototypeBanner />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-400" />
            </div>
            <h2 className="text-3xl font-extrabold mb-3">
              {mode === 'quote' ? 'Quote Requested!' : 'Added to Cart!'}
            </h2>
            <p className="text-gray-400 leading-relaxed mb-2">
              {mode === 'quote'
                ? 'Your quote request for the configured build has been submitted. A TFR Supply specialist will contact you shortly.'
                : 'Your configured build has been added to the cart. This is a prototype — no real cart transaction occurred.'}
            </p>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-600/80 mb-8">
              PROTOTYPE — No real submission occurred. Sample data only.
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all">
                Back to Home
              </button>
              <button onClick={() => navigate(`/family/${familyId}`)} className="bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 text-gray-300 font-bold px-6 py-3 rounded-xl text-sm transition-all">
                Configure Another
              </button>
            </div>
          </div>
        </div>
        <DebugToggle />
        <DebugPanel />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      <PrototypeBanner />

      <nav className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(`/configure/${familyId}/review`)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft size={16} /> Back to Review
        </button>
        <span className="text-gray-700">/</span>
        <span className="text-gray-300 text-sm">Quote or Cart</span>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">How would you like to proceed?</div>
        <h1 className="text-3xl font-extrabold mb-8">Request a Quote or Add to Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mode selection + form */}
          <div className="lg:col-span-2 space-y-4">
            {/* Mode toggle */}
            {!mode && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('quote')}
                  className="group bg-white/[0.03] hover:bg-white/[0.07] border-2 border-white/10 hover:border-blue-500/50 rounded-2xl p-6 text-left transition-all duration-200"
                >
                  <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600/30 transition-colors">
                    <FileText size={20} className="text-blue-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">Request a Quote</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Best for fleet purchases, agency procurement, and builds with verification requirements.</p>
                </button>
                <button
                  onClick={() => setMode('cart')}
                  className="group bg-white/[0.03] hover:bg-white/[0.07] border-2 border-white/10 hover:border-emerald-500/50 rounded-2xl p-6 text-left transition-all duration-200"
                >
                  <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600/30 transition-colors">
                    <ShoppingCart size={20} className="text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">Add to Cart</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Direct order flow via Shopify. Best for confirmed builds without pending verification items.</p>
                  {hasVerification && (
                    <div className="flex items-center gap-1.5 text-amber-400 text-xs mt-3">
                      <AlertTriangle size={11} /> Some items need verification
                    </div>
                  )}
                </button>
              </div>
            )}

            {/* Quote form */}
            {mode === 'quote' && !submitted && (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold flex items-center gap-2"><FileText size={16} className="text-blue-400" /> Quote Request Form</h3>
                  <button onClick={() => setMode(null)} className="text-gray-600 hover:text-gray-300 transition-colors"><X size={16} /></button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name *</label>
                      <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Officer Jane Smith" className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Agency / Department *</label>
                      <input value={form.agency} onChange={e => setForm({...form, agency: e.target.value})} placeholder="Metro Police Department" className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address *</label>
                      <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="jane.smith@pd.gov" className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Phone</label>
                      <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="(555) 555-0100" className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Additional Notes</label>
                    <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Fleet quantity, installation requirements, delivery timeline..." rows={3} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none" />
                  </div>
                  <button
                    onClick={() => setSubmitted(true)}
                    disabled={!form.name || !form.agency || !form.email}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-sm tracking-wide transition-all flex items-center justify-center gap-2"
                  >
                    <Send size={16} /> Submit Quote Request
                  </button>
                  <p className="text-[10px] text-gray-600 text-center">PROTOTYPE — No real submission will occur</p>
                </div>
              </div>
            )}

            {/* Mock cart */}
            {mode === 'cart' && !submitted && (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold flex items-center gap-2"><ShoppingCart size={16} className="text-emerald-400" /> Cart</h3>
                  <button onClick={() => setMode(null)} className="text-gray-600 hover:text-gray-300 transition-colors"><X size={16} /></button>
                </div>
                <div className="space-y-2 mb-6">
                  {allItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-4 py-3">
                      <div className="w-7 h-7 bg-white/[0.06] rounded-lg flex items-center justify-center shrink-0 text-xs font-bold text-gray-500">1</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white font-medium truncate">{item.label}</div>
                        <div className="text-[10px] font-mono text-gray-600">{item.sku}</div>
                      </div>
                      <span className="text-sm font-bold text-white">${item.price}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center border-t border-white/10 pt-4 mb-5">
                  <span className="font-bold text-gray-400">Total</span>
                  <span className="text-xl font-extrabold text-white">${totalPrice.toLocaleString()}</span>
                </div>
                {hasVerification && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-4 text-xs text-amber-600/80 flex items-start gap-2">
                    <AlertTriangle size={12} className="text-amber-400 mt-0.5 shrink-0" />
                    Some items require verification. A TFR specialist will review before shipment.
                  </div>
                )}
                <button
                  onClick={() => setSubmitted(true)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl text-sm tracking-wide transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={16} /> Confirm &amp; Add to Cart
                </button>
                <p className="text-[10px] text-gray-600 text-center mt-3">PROTOTYPE — Mock Shopify cart, no real order</p>
              </div>
            )}
          </div>

          {/* Right: mini summary */}
          <div>
            <MiniSummary />
          </div>
        </div>
      </div>

      <DebugToggle />
      <DebugPanel />
    </div>
  );
}