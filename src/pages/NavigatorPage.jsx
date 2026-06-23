import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, ChevronRight, ChevronDown, Car, ShoppingCart, FileText, Zap, Lightbulb, Wrench, Cpu, Package, Shield } from 'lucide-react';
import { NAVIGATOR_LENGTHS, NAVIGATOR_CONTROLS, NAVIGATOR_SKUS, NAVIGATOR_UPSELLS } from '@/data/navigatorData';
import { useConfigurator } from '@/context/ConfiguratorContext';
import PrototypeBanner from '@/components/PrototypeBanner';
import VehicleSelector from '@/components/VehicleSelector';
import DebugToggle from '@/components/DebugToggle';
import DebugPanel from '@/components/DebugPanel';
import PrototypeFooter from '@/components/PrototypeFooter';

const categoryIcons = {
  signalmaster: Zap,
  scene: Lightbulb,
  mounting: Wrench,
  controller: Cpu,
  accessories: Package,
};

export default function NavigatorPage() {
  const navigate = useNavigate();
  const { persistentVehicle } = useConfigurator();

  // Step 1 & 2: filters
  const [selectedLength, setSelectedLength] = useState(null);
  const [selectedControl, setSelectedControl] = useState(null);

  // Step 3: SKU selection
  const [selectedSku, setSelectedSku] = useState(null);

  // Step 4: upsell selections (by item id)
  const [upsellSelections, setUpsellSelections] = useState({});

  // Checkout mode
  const [checkoutMode, setCheckoutMode] = useState(null); // 'quote' | 'cart'
  const [quoteForm, setQuoteForm] = useState({ name: '', agency: '', email: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);

  // Collapsed upsell categories
  const [collapsedCategories, setCollapsedCategories] = useState({});

  const toggleCategory = (cat) => setCollapsedCategories(p => ({ ...p, [cat]: !p[cat] }));

  // Filter SKUs by length + control
  const matchingSkus = useMemo(() => {
    return NAVIGATOR_SKUS.filter(s =>
      (!selectedLength || s.length === selectedLength) &&
      (!selectedControl || s.control === selectedControl)
    );
  }, [selectedLength, selectedControl]);

  const toggleUpsell = (itemId) => {
    setUpsellSelections(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // Auto-recommend vehicle-matched mount kit
  const vehicleMatchedMount = useMemo(() => {
    if (!persistentVehicle || persistentVehicle.unspecified) return null;
    return NAVIGATOR_UPSELLS.mounting.items.find(m =>
      m.vehicleMatch && persistentVehicle.model && persistentVehicle.model.includes(m.vehicleMatch.split(' ').slice(-2).join(' '))
    ) || null;
  }, [persistentVehicle]);

  // Total price
  const totalPrice = useMemo(() => {
    if (!selectedSku) return null;
    const base = selectedSku.price;
    const upsellTotal = Object.entries(upsellSelections)
      .filter(([, v]) => v)
      .reduce((sum, [id]) => {
        const allItems = Object.values(NAVIGATOR_UPSELLS).flatMap(cat => cat.items);
        const item = allItems.find(i => i.id === id);
        return sum + (item?.price || 0);
      }, 0);
    return base + upsellTotal;
  }, [selectedSku, upsellSelections]);

  const selectedUpsellItems = useMemo(() => {
    const allItems = Object.values(NAVIGATOR_UPSELLS).flatMap(cat => cat.items);
    return allItems.filter(i => upsellSelections[i.id]);
  }, [upsellSelections]);

  const handleSubmitQuote = () => {
    if (quoteForm.name && quoteForm.email) setSubmitted(true);
  };

  const filterProgress = [selectedLength, selectedControl].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      <PrototypeBanner />

      {/* Persistent header with vehicle selector */}
      <div className="sticky top-0 z-40 bg-[#0D1B2A]/98 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield size={18} />
              </div>
              <div className="hidden md:block">
                <div className="font-black text-sm tracking-tight leading-none">TFR SUPPLY</div>
                <div className="text-[9px] text-gray-500 tracking-widest uppercase leading-none mt-0.5">Pro Shop</div>
              </div>
            </button>
            <span className="text-gray-700 hidden md:block">/</span>
            <button onClick={() => navigate('/vertical/police')} className="hidden md:block text-gray-400 hover:text-white transition-colors text-sm">Police</button>
            <span className="text-gray-700 hidden md:block">/</span>
            <span className="text-white font-bold text-sm">Navigator</span>
          </div>
          <VehicleSelector />
        </div>
      </div>

      {/* Hero */}
      <div className="relative">
        <div className="h-48 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=80"
            alt="Navigator"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A] to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 max-w-6xl mx-auto px-6 pb-6">
          <span className="text-[10px] font-bold tracking-widest uppercase bg-blue-600 px-2.5 py-1 rounded-full text-white mb-2 inline-block">Most Popular</span>
          <h1 className="text-3xl font-extrabold">Navigator Series</h1>
          <p className="text-gray-400 text-sm mt-1">Command-grade console solutions for Police patrol vehicles.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT: Finder + SKU results + upsells */}
        <div className="lg:col-span-2 space-y-8">

          {/* STEP 1: Length */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 rounded-full bg-blue-600/40 border border-blue-500/50 text-blue-300 text-xs font-bold flex items-center justify-center">1</div>
              <h2 className="font-bold text-base">Select Length <span className="text-red-400">*</span></h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {NAVIGATOR_LENGTHS.map(len => (
                <button
                  key={len.id}
                  onClick={() => { setSelectedLength(len.id); setSelectedSku(null); setUpsellSelections({}); }}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${
                    selectedLength === len.id
                      ? 'border-blue-500 bg-blue-600/15'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                  }`}
                >
                  <div className="text-2xl font-extrabold mb-1">{len.label}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">{len.description}</div>
                  {selectedLength === len.id && <CheckCircle size={14} className="text-blue-400 mt-2" />}
                </button>
              ))}
            </div>
          </section>

          {/* STEP 2: Control Method */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 rounded-full bg-blue-600/40 border border-blue-500/50 text-blue-300 text-xs font-bold flex items-center justify-center">2</div>
              <h2 className="font-bold text-base">Select Control Method <span className="text-red-400">*</span></h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {NAVIGATOR_CONTROLS.map(ctrl => (
                <button
                  key={ctrl.id}
                  onClick={() => { setSelectedControl(ctrl.id); setSelectedSku(null); setUpsellSelections({}); }}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${
                    selectedControl === ctrl.id
                      ? 'border-blue-500 bg-blue-600/15'
                      : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                  }`}
                >
                  <div className="font-bold text-sm mb-1">{ctrl.label}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">{ctrl.description}</div>
                  {selectedControl === ctrl.id && <CheckCircle size={14} className="text-blue-400 mt-2" />}
                </button>
              ))}
            </div>
          </section>

          {/* STEP 3: Matching SKUs */}
          {selectedLength && selectedControl && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 rounded-full bg-blue-600/40 border border-blue-500/50 text-blue-300 text-xs font-bold flex items-center justify-center">3</div>
                <h2 className="font-bold text-base">Select Your SKU</h2>
                <span className="text-xs text-gray-600 ml-1">{matchingSkus.length} matching</span>
              </div>

              {matchingSkus.length === 0 ? (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 text-sm text-amber-400">
                  No existing SKUs match this combination. <a href="#" className="underline">Request a custom fitment quote.</a>
                </div>
              ) : (
                <div className="space-y-3">
                  {matchingSkus.map(sku => {
                    const isMatch = persistentVehicle && !persistentVehicle.unspecified &&
                      sku.fits.some(f => persistentVehicle.model && (f.includes(persistentVehicle.model) || persistentVehicle.model.includes(f.split(' ').pop())));
                    return (
                      <button
                        key={sku.id}
                        onClick={() => { setSelectedSku(sku); setUpsellSelections({}); }}
                        className={`w-full text-left rounded-2xl border-2 p-5 transition-all ${
                          selectedSku?.id === sku.id
                            ? 'border-blue-500 bg-blue-600/15'
                            : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-bold text-white">{sku.label}</span>
                              {sku.popular && <span className="text-[9px] font-bold bg-blue-600/40 text-blue-300 px-2 py-0.5 rounded-full uppercase tracking-wider">Popular</span>}
                              {isMatch && (
                                <span className="flex items-center gap-1 text-[9px] font-bold bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                  <Car size={8} /> Fits Your Vehicle
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mb-1">{sku.description}</p>
                            <span className="text-[10px] font-mono text-gray-700">{sku.sku}</span>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-xl font-extrabold text-white">${sku.price.toLocaleString()}</div>
                            {selectedSku?.id === sku.id && <CheckCircle size={16} className="text-blue-400 mt-1 ml-auto" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* STEP 4: Upsells — only shown after SKU selected */}
          {selectedSku && (
            <section className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-emerald-600/40 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center justify-center">4</div>
                <h2 className="font-bold text-base">Complete Your Build</h2>
                <span className="text-xs text-gray-600">Optional add-ons</span>
              </div>

              {Object.entries(NAVIGATOR_UPSELLS).map(([catKey, cat]) => {
                // Controller: only show if base SKU is hardwired
                if (cat.showIfControl && !cat.showIfControl.includes(selectedSku.control)) return null;

                const Icon = categoryIcons[catKey] || Package;
                const isCollapsed = collapsedCategories[catKey];
                const selectedCount = cat.items.filter(i => upsellSelections[i.id]).length;

                // For mounting: if vehicle known, highlight matched kit; if unknown, show all with a note
                let items = cat.items;
                let mountNote = null;
                if (catKey === 'mounting') {
                  if (persistentVehicle && !persistentVehicle.unspecified && vehicleMatchedMount) {
                    mountNote = `Showing vehicle-specific kit for ${persistentVehicle.year} ${persistentVehicle.make} ${persistentVehicle.model}`;
                    // Move matched to top
                    items = [vehicleMatchedMount, ...cat.items.filter(i => i.id !== vehicleMatchedMount.id)];
                  } else if (!persistentVehicle || persistentVehicle.unspecified) {
                    mountNote = 'No vehicle selected — select your vehicle above to narrow mounting hardware, or choose Universal.';
                  }
                }

                return (
                  <div key={catKey} className="border border-white/10 rounded-2xl overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between px-5 py-4 bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
                      onClick={() => toggleCategory(catKey)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={15} className="text-blue-400" />
                        <span className="font-semibold text-sm">{cat.category}</span>
                        {selectedCount > 0 && (
                          <span className="text-[9px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">{selectedCount} selected</span>
                        )}
                      </div>
                      <ChevronDown size={15} className={`text-gray-500 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                    </button>

                    {!isCollapsed && (
                      <div className="p-4 space-y-3">
                        {mountNote && (
                          <div className={`flex items-start gap-2 text-xs px-3 py-2 rounded-lg mb-2 ${
                            vehicleMatchedMount
                              ? 'bg-green-600/10 text-green-400 border border-green-600/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {vehicleMatchedMount ? <Car size={12} className="shrink-0 mt-0.5" /> : <AlertTriangle size={12} className="shrink-0 mt-0.5" />}
                            {mountNote}
                          </div>
                        )}
                        {items.map(item => (
                          <div
                            key={item.id}
                            onClick={() => toggleUpsell(item.id)}
                            className={`flex items-start justify-between gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                              upsellSelections[item.id]
                                ? 'border-blue-500/60 bg-blue-600/10'
                                : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                            }`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="font-semibold text-sm">{item.label}</span>
                                {item.isBundleDeal && <span className="text-[9px] font-bold bg-emerald-600/30 text-emerald-400 px-2 py-0.5 rounded-full">Bundle Deal</span>}
                                {item.verificationNeeded && (
                                  <span className="flex items-center gap-1 text-[9px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                                    <AlertTriangle size={8} /> Verify Fitment
                                  </span>
                                )}
                                {vehicleMatchedMount && item.id === vehicleMatchedMount.id && (
                                  <span className="flex items-center gap-1 text-[9px] font-bold bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full">
                                    <Car size={8} /> Your Vehicle
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">{item.description}</p>
                              <span className="text-[10px] font-mono text-gray-700 mt-0.5 block">{item.sku}</span>
                            </div>
                            <div className="shrink-0 text-right">
                              <div className="font-bold text-white">+${item.price}</div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ml-auto transition-all ${
                                upsellSelections[item.id] ? 'bg-blue-600 border-blue-500' : 'border-gray-700'
                              }`}>
                                {upsellSelections[item.id] && <CheckCircle size={12} className="text-white" />}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          )}
        </div>

        {/* RIGHT: Sticky cart panel */}
        <div className="space-y-4">
          <div className="sticky top-[73px] space-y-4">

            {/* Filter progress indicator */}
            {!selectedSku && (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">Configure to Find Your SKU</div>
                <div className="space-y-3">
                  {[
                    { label: 'Length', done: !!selectedLength, value: NAVIGATOR_LENGTHS.find(l => l.id === selectedLength)?.label },
                    { label: 'Control Method', done: !!selectedControl, value: NAVIGATOR_CONTROLS.find(c => c.id === selectedControl)?.label },
                    { label: 'Select SKU', done: !!selectedSku, value: selectedSku?.sku },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {step.done
                        ? <CheckCircle size={14} className="text-green-400 shrink-0" />
                        : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-700 shrink-0" />}
                      <span className={`text-sm ${step.done ? 'text-white' : 'text-gray-600'}`}>
                        {step.done && step.value ? step.value : step.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-white/[0.03] rounded-xl h-1.5 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-xl transition-all duration-500" style={{ width: `${(filterProgress / 2) * 100}%` }} />
                </div>
              </div>
            )}

            {/* Build summary card — shown after SKU selected */}
            {selectedSku && (
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5">
                <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">Your Build</div>

                {persistentVehicle && !persistentVehicle.unspecified && (
                  <div className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-xl px-3 py-2 mb-4 text-xs text-blue-300">
                    <Car size={12} className="shrink-0" />
                    {persistentVehicle.year} {persistentVehicle.make} {persistentVehicle.model}
                  </div>
                )}

                <div className="border-b border-white/10 pb-4 mb-4">
                  <div className="font-bold text-white text-sm mb-0.5">{selectedSku.label}</div>
                  <div className="text-[10px] font-mono text-gray-600">{selectedSku.sku}</div>
                  <div className="text-sm font-bold text-white mt-2">${selectedSku.price.toLocaleString()}</div>
                </div>

                {selectedUpsellItems.length > 0 && (
                  <div className="space-y-1.5 border-b border-white/10 pb-4 mb-4">
                    {selectedUpsellItems.map(item => (
                      <div key={item.id} className="flex justify-between text-xs">
                        <span className="text-gray-400 truncate mr-2">{item.label}</span>
                        <span className="text-white shrink-0">+${item.price}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-baseline mb-5">
                  <span className="text-xs text-gray-500">Estimated Total</span>
                  <span className="text-2xl font-extrabold text-white">${totalPrice.toLocaleString()}</span>
                </div>

                {!checkoutMode && (
                  <div className="space-y-2">
                    <button
                      onClick={() => setCheckoutMode('quote')}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-sm transition-all"
                    >
                      <FileText size={15} /> Request a Quote
                    </button>
                    <button
                      onClick={() => setCheckoutMode('cart')}
                      className="w-full flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 text-white font-bold py-3 rounded-xl text-sm transition-all"
                    >
                      <ShoppingCart size={15} /> Add to Cart
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quote form */}
            {checkoutMode === 'quote' && !submitted && (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-bold tracking-widest text-gray-500 uppercase">Quote Request</div>
                  <button onClick={() => setCheckoutMode(null)} className="text-gray-600 hover:text-white text-xs">Cancel</button>
                </div>
                <div className="space-y-3">
                  {[
                    { key: 'name', label: 'Name', placeholder: 'Your name' },
                    { key: 'agency', label: 'Agency / Department', placeholder: 'Optional' },
                    { key: 'email', label: 'Email *', placeholder: 'your@email.com' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">{f.label}</label>
                      <input
                        type={f.key === 'email' ? 'email' : 'text'}
                        placeholder={f.placeholder}
                        value={quoteForm[f.key]}
                        onChange={e => setQuoteForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Notes</label>
                    <textarea
                      placeholder="Anything else we should know?"
                      value={quoteForm.notes}
                      onChange={e => setQuoteForm(p => ({ ...p, notes: e.target.value }))}
                      rows={2}
                      className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-blue-500/50 resize-none"
                    />
                  </div>
                  <button
                    onClick={handleSubmitQuote}
                    disabled={!quoteForm.name || !quoteForm.email}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl text-sm transition-all"
                  >
                    Submit Quote Request
                  </button>
                </div>
              </div>
            )}

            {/* Cart mock */}
            {checkoutMode === 'cart' && (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold tracking-widest text-gray-500 uppercase">Cart Preview</div>
                  <button onClick={() => setCheckoutMode(null)} className="text-gray-600 hover:text-white text-xs">Cancel</button>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-3 mb-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{selectedSku.sku}</span>
                    <span className="text-white">${selectedSku.price.toLocaleString()}</span>
                  </div>
                  {selectedUpsellItems.map(i => (
                    <div key={i.id} className="flex justify-between">
                      <span className="text-gray-400">{i.sku}</span>
                      <span className="text-white">+${i.price}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>${totalPrice.toLocaleString()}</span>
                  </div>
                </div>
                <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all">
                  <ShoppingCart size={15} /> Proceed to Checkout
                  <span className="text-[10px] font-normal opacity-70 ml-1">(prototype)</span>
                </button>
              </div>
            )}

            {/* Quote submitted */}
            {submitted && (
              <div className="bg-green-600/10 border border-green-600/30 rounded-2xl p-5 text-center">
                <CheckCircle size={24} className="text-green-400 mx-auto mb-2" />
                <div className="font-bold text-green-400 mb-1">Quote Submitted</div>
                <p className="text-xs text-gray-500">A TFR Supply specialist will respond to <span className="text-white">{quoteForm.email}</span> within 1 business day.</p>
              </div>
            )}

          </div>
        </div>
      </div>

      <PrototypeFooter />
      <DebugToggle />
      <DebugPanel />
    </div>
  );
}