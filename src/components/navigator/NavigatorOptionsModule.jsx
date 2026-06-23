import React, { useState, useMemo } from 'react';
import {
  CheckCircle, AlertTriangle, Car, ShoppingCart, FileText,
  ChevronDown, Info
} from 'lucide-react';
import {
  NAVIGATOR_LENGTHS,
  NAVIGATOR_CONTROLS,
  NAVIGATOR_SKUS,
  NAVIGATOR_UPSELLS
} from '@/data/navigatorData';
import { useConfigurator } from '@/context/ConfiguratorContext';
import VehicleSelector from '@/components/VehicleSelector';

function SelectDropdown({ label, value, onChange, options, placeholder, disabled }) {
  return (
    <div>
      {label && <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</label>}
      <div className="relative">
        <select
          value={value || ''}
          onChange={e => onChange(e.target.value || null)}
          disabled={disabled}
          className={`w-full appearance-none border rounded-lg px-3 py-2.5 text-sm pr-8 focus:outline-none transition-all ${
            disabled
              ? 'bg-white/[0.02] border-white/[0.05] text-gray-700 cursor-not-allowed'
              : value
                ? 'bg-white/[0.06] border-blue-500/50 text-white focus:border-blue-400'
                : 'bg-white/[0.04] border-white/10 text-gray-400 hover:border-white/20 focus:border-blue-500/40 cursor-pointer'
          }`}
        >
          <option value="" className="bg-[#0D1B2A]">{placeholder}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className="bg-[#0D1B2A] text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
      </div>
    </div>
  );
}

function SkuCard({ sku, selected, onSelect, vehicleFit }) {
  return (
    <button
      onClick={() => onSelect(sku)}
      className={`w-full text-left rounded-lg border p-3 transition-all ${
        selected
          ? 'border-blue-500 bg-blue-600/10'
          : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <span className="font-semibold text-xs text-white leading-tight">{sku.label}</span>
            {sku.popular && (
              <span className="text-[8px] font-bold bg-blue-600/40 text-blue-300 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Popular</span>
            )}
            {vehicleFit && (
              <span className="flex items-center gap-0.5 text-[8px] font-bold bg-green-600/20 text-green-400 px-1.5 py-0.5 rounded-full">
                <Car size={7} /> Fits
              </span>
            )}
          </div>
          <span className="text-[9px] font-mono text-gray-700">{sku.sku}</span>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-sm font-black text-white">${sku.price.toLocaleString()}</div>
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 ml-auto transition-all ${
            selected ? 'bg-blue-600 border-blue-500' : 'border-gray-700'
          }`}>
            {selected && <CheckCircle size={9} className="text-white" />}
          </div>
        </div>
      </div>
    </button>
  );
}

function UpsellItem({ item, selected, onToggle, vehicleMatch }) {
  return (
    <div
      onClick={onToggle}
      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
        selected
          ? 'border-blue-500/50 bg-blue-600/8'
          : 'border-white/[0.06] bg-white/[0.015] hover:border-white/15'
      }`}
    >
      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
        selected ? 'bg-blue-600 border-blue-500' : 'border-gray-700'
      }`}>
        {selected && <CheckCircle size={9} className="text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-xs text-white">{item.label}</span>
          {item.isBundleDeal && <span className="text-[8px] font-bold bg-emerald-600/25 text-emerald-400 px-1.5 py-0.5 rounded-full">Bundle</span>}
          {item.verificationNeeded && <span className="text-[8px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><AlertTriangle size={7} />Verify</span>}
          {vehicleMatch && <span className="text-[8px] font-bold bg-green-600/20 text-green-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Car size={7} />For Your Vehicle</span>}
        </div>
        <p className="text-[10px] text-gray-600 mt-0.5 leading-relaxed">{item.description}</p>
      </div>
      <span className="shrink-0 text-xs font-bold text-white">+${item.price}</span>
    </div>
  );
}

export default function NavigatorOptionsModule() {
  const { persistentVehicle } = useConfigurator();

  const [selectedLength, setSelectedLength] = useState(null);
  const [selectedControl, setSelectedControl] = useState(null);
  const [selectedSku, setSelectedSku] = useState(null);
  const [upsellSelections, setUpsellSelections] = useState({});
  const [checkoutMode, setCheckoutMode] = useState(null);
  const [quoteForm, setQuoteForm] = useState({ name: '', agency: '', email: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);

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
  const selectedUpsells = useMemo(() => allUpsellItems.filter(i => upsellSelections[i.id]), [allUpsellItems, upsellSelections]);

  const totalPrice = useMemo(() => {
    if (!selectedSku) return null;
    return selectedSku.price + selectedUpsells.reduce((s, i) => s + i.price, 0);
  }, [selectedSku, selectedUpsells]);

  const needsVerification = useMemo(() => selectedUpsells.some(i => i.verificationNeeded), [selectedUpsells]);

  const vehicleFitsSelected = useMemo(() => {
    if (!persistentVehicle || persistentVehicle.unspecified || !selectedSku) return false;
    return selectedSku.fits.some(f =>
      persistentVehicle.model && (f.includes(persistentVehicle.model) || persistentVehicle.model.includes(f.split(' ').pop()))
    );
  }, [persistentVehicle, selectedSku]);

  const handleSubmitQuote = () => { if (quoteForm.name && quoteForm.email) setSubmitted(true); };

  const lengthOptions = NAVIGATOR_LENGTHS.map(l => ({ value: l.id, label: `${l.label} — ${l.description}` }));
  const controlOptions = NAVIGATOR_CONTROLS.map(c => ({ value: c.id, label: `${c.label} — ${c.description}` }));

  return (
    <div className="space-y-4">

      {/* Vehicle selector */}
      <div>
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Vehicle (Optional)</div>
        <VehicleSelector compact={true} />
      </div>

      <div className="border-t border-white/[0.06]" />

      {/* Primary SKU filters */}
      <div className="space-y-3">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select Your Model</div>

        <SelectDropdown
          label="Console Length"
          value={selectedLength}
          onChange={handleLengthChange}
          options={lengthOptions}
          placeholder="— Choose a length —"
        />

        <SelectDropdown
          label="Control Method"
          value={selectedControl}
          onChange={handleControlChange}
          options={controlOptions}
          placeholder="— Choose control method —"
          disabled={!selectedLength}
        />

        {selectedLength && selectedControl && (
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Configured Model — {matchingSkus.length} available
            </div>
            {matchingSkus.length === 0 ? (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2 text-xs text-amber-400">
                <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                <span>No models match this combination. <button className="underline font-semibold">Request a quote →</button></span>
              </div>
            ) : (
              <div className="space-y-2">
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

      {/* Required & recommended add-ons */}
      {selectedSku && (
        <>
          <div className="border-t border-white/[0.06]" />
          <div className="space-y-4">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Complete Your Build</div>

            {Object.entries(NAVIGATOR_UPSELLS).map(([catKey, cat]) => {
              if (cat.showIfControl && !cat.showIfControl.includes(selectedSku.control)) return null;
              const isRequired = catKey === 'mounting';
              const selectedCount = cat.items.filter(i => upsellSelections[i.id]).length;
              let items = cat.items;

              if (catKey === 'mounting' && vehicleMatchedMount) {
                items = [vehicleMatchedMount, ...cat.items.filter(i => i.id !== vehicleMatchedMount.id)];
              }

              return (
                <div key={catKey}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cat.category}</span>
                    {isRequired && <span className="text-[8px] font-bold bg-red-600/25 text-red-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Required</span>}
                    {selectedCount > 0 && <span className="text-[8px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-full">{selectedCount}</span>}
                  </div>
                  <div className="space-y-1.5">
                    {items.map(item => (
                      <UpsellItem
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
        </>
      )}

      {/* Build summary + CTA */}
      {selectedSku && (
        <>
          <div className="border-t border-white/[0.06]" />

          {/* Summary */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 space-y-3">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Build Summary</div>

            {persistentVehicle && !persistentVehicle.unspecified && (
              <div className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 rounded-lg px-2.5 py-2 text-xs text-blue-300">
                <Car size={11} className="shrink-0" />
                <span className="truncate">{persistentVehicle.year} {persistentVehicle.make} {persistentVehicle.model}</span>
                {vehicleFitsSelected
                  ? <span className="ml-auto text-green-400 font-bold shrink-0 flex items-center gap-1"><CheckCircle size={9} />Fits</span>
                  : <span className="ml-auto text-amber-400 font-bold shrink-0 flex items-center gap-1"><AlertTriangle size={9} />Verify</span>}
              </div>
            )}

            <div className="flex justify-between items-start text-xs">
              <span className="text-gray-400 leading-tight mr-2">{selectedSku.label}</span>
              <span className="font-bold text-white shrink-0">${selectedSku.price.toLocaleString()}</span>
            </div>
            {selectedUpsells.map(item => (
              <div key={item.id} className="flex justify-between text-xs">
                <span className="text-gray-500 truncate mr-2">{item.label}</span>
                <span className="text-white shrink-0">+${item.price}</span>
              </div>
            ))}

            {needsVerification && (
              <div className="flex items-start gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-2 text-[10px] text-amber-400">
                <Info size={10} className="shrink-0 mt-0.5" />
                <span>Quote recommended — fitment verification required.</span>
              </div>
            )}
            {persistentVehicle && !persistentVehicle.unspecified && !vehicleFitsSelected && (
              <div className="flex items-start gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-2 text-[10px] text-amber-400">
                <AlertTriangle size={10} className="shrink-0 mt-0.5" />
                <span>Unverified fitment for your vehicle. Contact us to confirm.</span>
              </div>
            )}

            <div className="flex justify-between items-baseline border-t border-white/[0.07] pt-3">
              <span className="text-xs text-gray-500">Estimated Total</span>
              <span className="text-xl font-black text-white">${totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* CTA */}
          {!checkoutMode && !submitted && (
            <div className="space-y-2">
              <button
                onClick={() => setCheckoutMode('cart')}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-sm transition-all"
              >
                <ShoppingCart size={14} /> Add to Cart
              </button>
              <button
                onClick={() => setCheckoutMode('quote')}
                className="w-full flex items-center justify-center gap-2 border border-white/15 bg-white/[0.04] hover:bg-white/[0.07] text-white font-semibold py-3 rounded-xl text-sm transition-all"
              >
                <FileText size={14} /> Request a Quote
              </button>
            </div>
          )}

          {/* Cart */}
          {checkoutMode === 'cart' && (
            <div className="space-y-2">
              <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 truncate mr-2">{selectedSku.sku}</span>
                  <span className="text-white shrink-0 font-semibold">${selectedSku.price.toLocaleString()}</span>
                </div>
                {selectedUpsells.map(i => (
                  <div key={i.id} className="flex justify-between">
                    <span className="text-gray-500 truncate mr-2">{i.sku}</span>
                    <span className="text-white shrink-0">+${i.price}</span>
                  </div>
                ))}
                <div className="border-t border-white/[0.08] pt-1.5 flex justify-between font-bold text-sm">
                  <span>Total</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
              </div>
              <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                <ShoppingCart size={14} /> Proceed to Checkout
                <span className="text-[9px] font-normal opacity-50">(prototype)</span>
              </button>
              <button onClick={() => setCheckoutMode(null)} className="w-full text-xs text-gray-600 hover:text-gray-400 py-1">← Back</button>
            </div>
          )}

          {/* Quote form */}
          {checkoutMode === 'quote' && !submitted && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Request a Quote</div>
                <button onClick={() => setCheckoutMode(null)} className="text-gray-600 hover:text-white text-xs">Cancel</button>
              </div>
              {[
                { key: 'name', label: 'Name *', placeholder: 'Your name', type: 'text' },
                { key: 'agency', label: 'Agency / Dept', placeholder: 'Optional', type: 'text' },
                { key: 'email', label: 'Email *', placeholder: 'your@email.com', type: 'email' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1 block">{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={quoteForm[f.key]}
                    onChange={e => setQuoteForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-700 focus:outline-none focus:border-blue-500/40"
                  />
                </div>
              ))}
              <textarea
                placeholder="Notes (optional)"
                value={quoteForm.notes}
                onChange={e => setQuoteForm(p => ({ ...p, notes: e.target.value }))}
                rows={2}
                className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-700 focus:outline-none focus:border-blue-500/40 resize-none"
              />
              <button
                onClick={handleSubmitQuote}
                disabled={!quoteForm.name || !quoteForm.email}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl text-xs transition-all"
              >
                Submit Quote Request
              </button>
            </div>
          )}

          {submitted && (
            <div className="bg-green-600/10 border border-green-600/30 rounded-xl p-4 text-center">
              <CheckCircle size={20} className="text-green-400 mx-auto mb-2" />
              <div className="font-bold text-green-400 text-sm mb-1">Quote Submitted</div>
              <p className="text-[10px] text-gray-500">A TFR specialist will respond to <span className="text-white">{quoteForm.email}</span> within 1 business day.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}