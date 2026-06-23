import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Shield, CheckCircle, AlertTriangle, Car,
  ShoppingCart, FileText, ChevronDown, Info, ArrowRight, Package
} from 'lucide-react';
import {
  NAVIGATOR_LENGTHS,
  NAVIGATOR_CONTROLS,
  NAVIGATOR_SKUS,
  NAVIGATOR_UPSELLS
} from '@/data/navigatorData';
import { useConfigurator } from '@/context/ConfiguratorContext';
import PrototypeBanner from '@/components/PrototypeBanner';
import VehicleSelector from '@/components/VehicleSelector';
import DebugToggle from '@/components/DebugToggle';
import DebugPanel from '@/components/DebugPanel';
import PrototypeFooter from '@/components/PrototypeFooter';

// ── Selector Dropdown ─────────────────────────────────────────────────────────
function SelectDropdown({ label, value, onChange, options, placeholder, disabled }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</label>
      <div className="relative">
        <select
          value={value || ''}
          onChange={e => onChange(e.target.value || null)}
          disabled={disabled}
          className={`w-full appearance-none bg-white/[0.05] border rounded-xl px-4 py-3 text-sm pr-10 focus:outline-none transition-all ${
            disabled
              ? 'border-white/[0.06] text-gray-600 cursor-not-allowed'
              : value
                ? 'border-blue-500/60 text-white focus:border-blue-400'
                : 'border-white/15 text-gray-400 hover:border-white/25 focus:border-blue-500/50 cursor-pointer'
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-[#0D1B2A] text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
}

// ── SKU Card ──────────────────────────────────────────────────────────────────
function SkuCard({ sku, selected, onSelect, vehicleFit }) {
  return (
    <button
      onClick={() => onSelect(sku)}
      className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
        selected
          ? 'border-blue-500 bg-blue-600/10'
          : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-sm text-white">{sku.label}</span>
            {sku.popular && (
              <span className="text-[9px] font-bold bg-blue-600/40 text-blue-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Popular
              </span>
            )}
            {vehicleFit && (
              <span className="flex items-center gap-1 text-[9px] font-bold bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                <Car size={8} /> Fits Your Vehicle
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-1.5 leading-relaxed">{sku.description}</p>
          <span className="text-[10px] font-mono text-gray-700">{sku.sku}</span>
        </div>
        <div className="shrink-0 text-right flex flex-col items-end gap-2">
          <div className="text-lg font-black text-white">${sku.price.toLocaleString()}</div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
            selected ? 'bg-blue-600 border-blue-500' : 'border-gray-700'
          }`}>
            {selected && <CheckCircle size={12} className="text-white" />}
          </div>
        </div>
      </div>
    </button>
  );
}

// ── Upsell Row ────────────────────────────────────────────────────────────────
function UpsellRow({ item, selected, onToggle, vehicleMatch }) {
  return (
    <div
      onClick={onToggle}
      className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
        selected
          ? 'border-blue-500/60 bg-blue-600/10'
          : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
      }`}
    >
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
        selected ? 'bg-blue-600 border-blue-500' : 'border-gray-600'
      }`}>
        {selected && <CheckCircle size={11} className="text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="font-semibold text-sm text-white">{item.label}</span>
          {item.isBundleDeal && (
            <span className="text-[9px] font-bold bg-emerald-600/30 text-emerald-400 px-2 py-0.5 rounded-full">Bundle Deal</span>
          )}
          {item.verificationNeeded && (
            <span className="flex items-center gap-1 text-[9px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
              <AlertTriangle size={8} /> Verify Fitment
            </span>
          )}
          {vehicleMatch && (
            <span className="flex items-center gap-1 text-[9px] font-bold bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full">
              <Car size={8} /> Recommended for Your Vehicle
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
        <span className="text-[10px] font-mono text-gray-700 mt-0.5 block">{item.sku}</span>
      </div>
      <div className="shrink-0 font-bold text-white text-sm">+${item.price}</div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function NavigatorPage() {
  const navigate = useNavigate();
  const { persistentVehicle } = useConfigurator();

  const [selectedLength, setSelectedLength] = useState(null);
  const [selectedControl, setSelectedControl] = useState(null);
  const [selectedSku, setSelectedSku] = useState(null);
  const [upsellSelections, setUpsellSelections] = useState({});
  const [checkoutMode, setCheckoutMode] = useState(null);
  const [quoteForm, setQuoteForm] = useState({ name: '', agency: '', email: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);

  // Reset downstream when filters change
  const handleLengthChange = (val) => { setSelectedLength(val); setSelectedSku(null); setUpsellSelections({}); };
  const handleControlChange = (val) => { setSelectedControl(val); setSelectedSku(null); setUpsellSelections({}); };
  const handleSkuSelect = (sku) => { setSelectedSku(sku); setUpsellSelections({}); setCheckoutMode(null); };

  const toggleUpsell = (id) => setUpsellSelections(p => ({ ...p, [id]: !p[id] }));

  const matchingSkus = useMemo(() => NAVIGATOR_SKUS.filter(s =>
    (!selectedLength || s.length === selectedLength) &&
    (!selectedControl || s.control === selectedControl)
  ), [selectedLength, selectedControl]);

  const vehicleMatchedMount = useMemo(() => {
    if (!persistentVehicle || persistentVehicle.unspecified) return null;
    return NAVIGATOR_UPSELLS.mounting.items.find(m =>
      m.vehicleMatch && persistentVehicle.model &&
      (persistentVehicle.model.includes(m.vehicleMatch) || m.vehicleMatch.includes(persistentVehicle.model.split(' ').pop()))
    ) || null;
  }, [persistentVehicle]);

  const allUpsellItems = useMemo(() => Object.values(NAVIGATOR_UPSELLS).flatMap(c => c.items), []);

  const selectedUpsells = useMemo(() =>
    allUpsellItems.filter(i => upsellSelections[i.id]),
  [allUpsellItems, upsellSelections]);

  const totalPrice = useMemo(() => {
    if (!selectedSku) return null;
    return selectedSku.price + selectedUpsells.reduce((s, i) => s + i.price, 0);
  }, [selectedSku, selectedUpsells]);

  const needsVerification = useMemo(() =>
    selectedUpsells.some(i => i.verificationNeeded),
  [selectedUpsells]);

  const vehicleFitsSelected = useMemo(() => {
    if (!persistentVehicle || persistentVehicle.unspecified || !selectedSku) return false;
    return selectedSku.fits.some(f =>
      persistentVehicle.model && (f.includes(persistentVehicle.model) || persistentVehicle.model.includes(f.split(' ').pop()))
    );
  }, [persistentVehicle, selectedSku]);

  const handleSubmitQuote = () => {
    if (quoteForm.name && quoteForm.email) setSubmitted(true);
  };

  const lengthOptions = NAVIGATOR_LENGTHS.map(l => ({ value: l.id, label: `${l.label} — ${l.description}` }));
  const controlOptions = NAVIGATOR_CONTROLS.map(c => ({ value: c.id, label: `${c.label} — ${c.description}` }));
  const skuOptions = matchingSkus.map(s => ({ value: s.id, label: `${s.label} — $${s.price.toLocaleString()}` }));

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      <PrototypeBanner />

      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-[#0D1B2A]/98 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <Shield size={18} />
              </div>
              <div className="hidden md:block">
                <div className="font-black text-sm tracking-tight leading-none">TFR SUPPLY</div>
                <div className="text-[9px] text-gray-500 tracking-widest uppercase leading-none mt-0.5">Pro Shop</div>
              </div>
            </button>
            <span className="text-gray-700 hidden md:block">/</span>
            <button onClick={() => navigate('/vertical/police')} className="hidden md:block text-gray-400 hover:text-white text-sm transition-colors">Police</button>
            <span className="text-gray-700 hidden md:block">/</span>
            <span className="text-white font-semibold text-sm">Navigator Series</span>
          </div>
          <VehicleSelector />
        </div>
      </nav>

      {/* Product hero */}
      <div className="relative border-b border-white/[0.06]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1400&q=80"
            alt="Navigator Series"
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D1B2A] via-[#0D1B2A]/90 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <span className="text-[10px] font-bold tracking-widest uppercase bg-blue-600 px-3 py-1 rounded-full text-white mb-3 inline-block">Most Popular</span>
          <h1 className="text-4xl font-black mb-2">Navigator Series</h1>
          <p className="text-gray-400 text-sm max-w-lg leading-relaxed">
            Command-grade console solutions for police patrol vehicles. Select the model that fits your build below.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* ── LEFT COLUMN: Selectors + SKU cards + Upsells ─────────────────── */}
        <div className="lg:col-span-2 space-y-10">

          {/* ── SECTION 1: Choose your configured model ── */}
          <section>
            <div className="mb-6">
              <h2 className="text-lg font-black text-white mb-1">Choose Your Configured Model</h2>
              <p className="text-sm text-gray-500">Select the model that fits your build. All options are existing, in-stock configured units.</p>
            </div>

            <div className="space-y-5 bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6">

              {/* Length */}
              <SelectDropdown
                label="Console Length"
                value={selectedLength}
                onChange={handleLengthChange}
                options={lengthOptions}
                placeholder="— Select a length —"
              />

              {/* Control */}
              <SelectDropdown
                label="Control Method"
                value={selectedControl}
                onChange={handleControlChange}
                options={controlOptions}
                placeholder="— Select control method —"
                disabled={!selectedLength}
              />

              {/* SKU selector — shows as cards once both filters set */}
              {selectedLength && selectedControl && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Select Model — {matchingSkus.length} matching {matchingSkus.length === 1 ? 'unit' : 'units'}
                  </label>

                  {matchingSkus.length === 0 ? (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 flex items-start gap-3 text-sm text-amber-400">
                      <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                      <span>No configured models match this combination. <button className="underline font-semibold">Request a fitment quote →</button></span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Dropdown fallback for many options */}
                      {matchingSkus.length > 4 && (
                        <SelectDropdown
                          label=""
                          value={selectedSku?.id || null}
                          onChange={val => handleSkuSelect(matchingSkus.find(s => s.id === val) || null)}
                          options={skuOptions}
                          placeholder="— Choose a model —"
                        />
                      )}
                      {matchingSkus.map(sku => {
                        const fit = persistentVehicle && !persistentVehicle.unspecified &&
                          sku.fits.some(f => persistentVehicle.model &&
                            (f.includes(persistentVehicle.model) || persistentVehicle.model.includes(f.split(' ').pop())));
                        return (
                          <SkuCard
                            key={sku.id}
                            sku={sku}
                            selected={selectedSku?.id === sku.id}
                            onSelect={handleSkuSelect}
                            vehicleFit={fit}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* ── SECTION 2: Complete your build (upsells) ── */}
          {selectedSku && (
            <section>
              <div className="mb-6">
                <h2 className="text-lg font-black text-white mb-1">Complete Your Build</h2>
                <p className="text-sm text-gray-500">Add required hardware, recommended accessories, and compatible options to your order.</p>
              </div>

              <div className="space-y-6">
                {Object.entries(NAVIGATOR_UPSELLS).map(([catKey, cat]) => {
                  // Controller: only shown for hardwired base SKU
                  if (cat.showIfControl && !cat.showIfControl.includes(selectedSku.control)) return null;

                  const selectedCount = cat.items.filter(i => upsellSelections[i.id]).length;

                  let items = cat.items;
                  let sectionNote = null;

                  if (catKey === 'mounting') {
                    if (vehicleMatchedMount) {
                      sectionNote = { type: 'success', text: `Showing vehicle-specific mount kit for ${persistentVehicle.year} ${persistentVehicle.make} ${persistentVehicle.model}.` };
                      items = [vehicleMatchedMount, ...cat.items.filter(i => i.id !== vehicleMatchedMount.id)];
                    } else if (!persistentVehicle || persistentVehicle.unspecified) {
                      sectionNote = { type: 'warning', text: 'No vehicle selected. Select your vehicle above to see a vehicle-specific mount kit, or choose Universal.' };
                    }
                  }

                  const isRequired = catKey === 'mounting';

                  return (
                    <div key={catKey} className="border border-white/[0.08] rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-4 bg-white/[0.03] border-b border-white/[0.06]">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-white">{cat.category}</span>
                          {isRequired && (
                            <span className="text-[9px] font-bold bg-red-600/30 text-red-400 px-2 py-0.5 rounded-full uppercase tracking-wider">Required</span>
                          )}
                          {selectedCount > 0 && (
                            <span className="text-[9px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">{selectedCount} selected</span>
                          )}
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        {sectionNote && (
                          <div className={`flex items-start gap-2 text-xs px-3 py-2.5 rounded-lg ${
                            sectionNote.type === 'success'
                              ? 'bg-green-600/10 text-green-400 border border-green-600/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {sectionNote.type === 'success'
                              ? <Car size={12} className="shrink-0 mt-0.5" />
                              : <AlertTriangle size={12} className="shrink-0 mt-0.5" />}
                            {sectionNote.text}
                          </div>
                        )}
                        {items.map(item => (
                          <UpsellRow
                            key={item.id}
                            item={item}
                            selected={!!upsellSelections[item.id]}
                            onToggle={() => toggleUpsell(item.id)}
                            vehicleMatch={vehicleMatchedMount && item.id === vehicleMatchedMount.id}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* ── RIGHT COLUMN: Sticky build summary ── */}
        <div>
          <div className="sticky top-[73px] space-y-4">

            {/* Pre-selection guide */}
            {!selectedSku && (
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
                <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">Select a Model to Begin</div>
                <div className="space-y-3">
                  {[
                    { label: 'Console Length', done: !!selectedLength, value: NAVIGATOR_LENGTHS.find(l => l.id === selectedLength)?.label },
                    { label: 'Control Method', done: !!selectedControl, value: NAVIGATOR_CONTROLS.find(c => c.id === selectedControl)?.label },
                    { label: 'Choose configured model', done: false, value: null },
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
              </div>
            )}

            {/* Build summary */}
            {selectedSku && (
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/[0.07] bg-white/[0.02]">
                  <div className="text-xs font-bold tracking-widest text-gray-500 uppercase">Your Build Summary</div>
                </div>
                <div className="p-5 space-y-4">

                  {/* Vehicle */}
                  {persistentVehicle && !persistentVehicle.unspecified && (
                    <div className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-lg px-3 py-2 text-xs text-blue-300">
                      <Car size={12} className="shrink-0" />
                      <span>{persistentVehicle.year} {persistentVehicle.make} {persistentVehicle.model}</span>
                      {vehicleFitsSelected
                        ? <span className="ml-auto text-green-400 font-bold flex items-center gap-1"><CheckCircle size={10} /> Fits</span>
                        : <span className="ml-auto text-amber-400 font-bold flex items-center gap-1"><AlertTriangle size={10} /> Verify</span>
                      }
                    </div>
                  )}

                  {/* Base SKU */}
                  <div className="pb-4 border-b border-white/[0.07]">
                    <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Base Model</div>
                    <div className="font-bold text-white text-sm leading-tight mb-0.5">{selectedSku.label}</div>
                    <div className="text-[10px] font-mono text-gray-600">{selectedSku.sku}</div>
                    <div className="text-base font-black text-white mt-2">${selectedSku.price.toLocaleString()}</div>
                  </div>

                  {/* Selected add-ons */}
                  {selectedUpsells.length > 0 && (
                    <div className="pb-4 border-b border-white/[0.07]">
                      <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Selected Options</div>
                      <div className="space-y-1.5">
                        {selectedUpsells.map(item => (
                          <div key={item.id} className="flex justify-between text-xs">
                            <span className="text-gray-400 truncate mr-2">{item.label}</span>
                            <span className="text-white shrink-0 font-semibold">+${item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fitment warnings */}
                  {persistentVehicle && !persistentVehicle.unspecified && !vehicleFitsSelected && (
                    <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5 text-xs text-amber-400">
                      <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                      <span>Fitment for this model on your selected vehicle is unverified. Contact us to confirm before ordering.</span>
                    </div>
                  )}

                  {needsVerification && (
                    <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5 text-xs text-amber-400">
                      <Info size={12} className="shrink-0 mt-0.5" />
                      <span>One or more selected items require fitment verification. A quote request is recommended.</span>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-xs text-gray-500">Estimated Total</span>
                    <span className="text-2xl font-black text-white">${totalPrice.toLocaleString()}</span>
                  </div>

                  {/* CTA buttons */}
                  {!checkoutMode && !submitted && (
                    <div className="space-y-2 pt-1">
                      <button
                        onClick={() => setCheckoutMode('cart')}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-sm transition-all"
                      >
                        <ShoppingCart size={15} /> Add to Cart
                      </button>
                      <button
                        onClick={() => setCheckoutMode('quote')}
                        className="w-full flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-white font-semibold py-3 rounded-xl text-sm transition-all"
                      >
                        <FileText size={15} /> Request a Quote
                      </button>
                      {needsVerification && (
                        <p className="text-[10px] text-center text-amber-500 pt-1">
                          ⚠ Quote recommended — fitment verification required for one or more items.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Cart confirmation */}
                  {checkoutMode === 'cart' && (
                    <div className="space-y-3 pt-1">
                      <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-3 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400 truncate mr-2">{selectedSku.sku}</span>
                          <span className="text-white font-semibold shrink-0">${selectedSku.price.toLocaleString()}</span>
                        </div>
                        {selectedUpsells.map(i => (
                          <div key={i.id} className="flex justify-between">
                            <span className="text-gray-400 truncate mr-2">{i.sku}</span>
                            <span className="text-white shrink-0">+${i.price}</span>
                          </div>
                        ))}
                        <div className="border-t border-white/[0.08] pt-1.5 flex justify-between font-bold text-sm">
                          <span>Total</span>
                          <span>${totalPrice.toLocaleString()}</span>
                        </div>
                      </div>
                      <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all">
                        <ShoppingCart size={15} /> Proceed to Checkout
                        <span className="text-[10px] font-normal opacity-60 ml-1">(prototype)</span>
                      </button>
                      <button onClick={() => setCheckoutMode(null)} className="w-full text-xs text-gray-600 hover:text-gray-400 transition-colors py-1">
                        ← Back
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quote form */}
            {checkoutMode === 'quote' && !submitted && (
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-bold tracking-widest text-gray-500 uppercase">Request a Quote</div>
                  <button onClick={() => setCheckoutMode(null)} className="text-gray-600 hover:text-white text-xs transition-colors">Cancel</button>
                </div>
                <div className="space-y-3">
                  {[
                    { key: 'name', label: 'Name *', placeholder: 'Your name', type: 'text' },
                    { key: 'agency', label: 'Agency / Department', placeholder: 'Optional', type: 'text' },
                    { key: 'email', label: 'Email *', placeholder: 'your@email.com', type: 'email' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">{f.label}</label>
                      <input
                        type={f.type}
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

            {/* Submitted */}
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