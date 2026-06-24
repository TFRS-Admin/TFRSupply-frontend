import React, { useState, useMemo } from 'react';
import {
  CheckCircle, AlertTriangle, Car, ShoppingCart, FileText,
  ChevronDown, Info, Pencil
} from 'lucide-react';
import {
  NAVIGATOR_LENGTHS,
  NAVIGATOR_CONTROLS,
  NAVIGATOR_SKUS,
  NAVIGATOR_UPSELLS
} from '@/data/navigatorData';
import { useConfigurator } from '@/context/ConfiguratorContext';
import VehicleSelector from '@/components/VehicleSelector';

function CollapsedStep({ label, value, onEdit }) {
  return (
    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded px-3 py-2.5">
      <div className="flex-1 min-w-0">
        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">{label}</div>
        <div className="text-xs font-semibold text-gray-900 truncate">{value}</div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        <CheckCircle size={13} className="text-green-600" />
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-[#003DA5] transition-colors font-medium"
        >
          <Pencil size={10} /> Edit
        </button>
      </div>
    </div>
  );
}

function SelectDropdown({ label, value, onChange, options, placeholder, disabled }) {
  return (
    <div>
      {label && <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{label}</label>}
      <div className="relative">
        <select
          value={value || ''}
          onChange={e => onChange(e.target.value || null)}
          disabled={disabled}
          className={`w-full appearance-none border rounded px-3 py-2.5 text-sm pr-8 focus:outline-none transition-all bg-white ${
            disabled
              ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
              : value
                ? 'border-[#003DA5] text-gray-900 focus:border-[#003DA5]'
                : 'border-gray-300 text-gray-500 hover:border-gray-400 focus:border-[#003DA5] cursor-pointer'
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

function SkuCard({ sku, selected, onSelect, vehicleFit }) {
  return (
    <button
      onClick={() => onSelect(sku)}
      className={`w-full text-left rounded border p-3 transition-all ${
        selected
          ? 'border-[#003DA5] bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <span className="font-semibold text-xs text-gray-900 leading-tight">{sku.label}</span>
            {sku.popular && (
              <span className="text-[8px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Popular</span>
            )}
            {vehicleFit && (
              <span className="flex items-center gap-0.5 text-[8px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                <Car size={7} /> Fits
              </span>
            )}
          </div>
          <span className="text-[9px] font-mono text-gray-500">{sku.sku}</span>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-sm font-black text-gray-900">${sku.price.toLocaleString()}</div>
          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-1 ml-auto transition-all ${
            selected ? 'bg-[#003DA5] border-[#003DA5]' : 'border-gray-300'
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
      className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-all ${
        selected
          ? 'border-[#003DA5]/40 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
        selected ? 'bg-[#003DA5] border-[#003DA5]' : 'border-gray-300'
      }`}>
        {selected && <CheckCircle size={9} className="text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-xs text-gray-900">{item.label}</span>
          {item.isBundleDeal && <span className="text-[8px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Bundle</span>}
          {item.verificationNeeded && <span className="text-[8px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><AlertTriangle size={7} />Verify</span>}
          {vehicleMatch && <span className="text-[8px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><Car size={7} />For Your Vehicle</span>}
        </div>
        <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{item.description}</p>
      </div>
      <span className="shrink-0 text-xs font-bold text-gray-900">+${item.price}</span>
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

      <div className="border-t border-gray-200" />

      {/* Primary SKU filters — collapsible steps */}
      <div className="space-y-2">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Select Your Model</div>

        {/* Step 1: Console Length */}
        {selectedLength ? (
          <CollapsedStep
            label="Console Length"
            value={lengthOptions.find(o => o.value === selectedLength)?.label}
            onEdit={() => { setSelectedLength(null); setSelectedControl(null); setSelectedSku(null); setUpsellSelections({}); }}
          />
        ) : (
          <SelectDropdown
            label="Console Length"
            value={selectedLength}
            onChange={handleLengthChange}
            options={lengthOptions}
            placeholder="— Choose a length —"
          />
        )}

        {/* Step 2: Control Method */}
        {selectedLength && (
          selectedControl ? (
            <CollapsedStep
              label="Control Method"
              value={controlOptions.find(o => o.value === selectedControl)?.label}
              onEdit={() => { setSelectedControl(null); setSelectedSku(null); setUpsellSelections({}); }}
            />
          ) : (
            <SelectDropdown
              label="Control Method"
              value={selectedControl}
              onChange={handleControlChange}
              options={controlOptions}
              placeholder="— Choose control method —"
            />
          )
        )}

        {/* Step 3: Configured Model */}
        {selectedLength && selectedControl && (
          selectedSku ? (
            <CollapsedStep
              label="Configured Model"
              value={`${selectedSku.label} — $${selectedSku.price.toLocaleString()}`}
              onEdit={() => { setSelectedSku(null); setUpsellSelections({}); setCheckoutMode(null); }}
            />
          ) : (
            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Configured Model — {matchingSkus.length} available
              </div>
              {matchingSkus.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded p-3 flex items-start gap-2 text-xs text-amber-700">
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
          )
        )}
      </div>

      {/* Required & recommended add-ons */}
      {selectedSku && (
        <>
          <div className="border-t border-gray-200" />
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
          <div className="border-t border-gray-200" />

          {/* Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-3">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Build Summary</div>

            {persistentVehicle && !persistentVehicle.unspecified && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded px-2.5 py-2 text-xs text-blue-700">
                <Car size={11} className="shrink-0" />
                <span className="truncate">{persistentVehicle.year} {persistentVehicle.make} {persistentVehicle.model}</span>
                {vehicleFitsSelected
                  ? <span className="ml-auto text-green-600 font-bold shrink-0 flex items-center gap-1"><CheckCircle size={9} />Fits</span>
                  : <span className="ml-auto text-amber-600 font-bold shrink-0 flex items-center gap-1"><AlertTriangle size={9} />Verify</span>}
              </div>
            )}

            <div className="flex justify-between items-start text-xs">
              <span className="text-gray-600 leading-tight mr-2">{selectedSku.label}</span>
              <span className="font-bold text-gray-900 shrink-0">${selectedSku.price.toLocaleString()}</span>
            </div>
            {selectedUpsells.map(item => (
              <div key={item.id} className="flex justify-between text-xs">
                <span className="text-gray-500 truncate mr-2">{item.label}</span>
                <span className="text-gray-900 shrink-0">+${item.price}</span>
              </div>
            ))}

            {needsVerification && (
              <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded px-2.5 py-2 text-[10px] text-amber-700">
                <Info size={10} className="shrink-0 mt-0.5" />
                <span>Quote recommended — fitment verification required.</span>
              </div>
            )}
            {persistentVehicle && !persistentVehicle.unspecified && !vehicleFitsSelected && (
              <div className="flex items-start gap-1.5 bg-amber-50 border border-amber-200 rounded px-2.5 py-2 text-[10px] text-amber-700">
                <AlertTriangle size={10} className="shrink-0 mt-0.5" />
                <span>Unverified fitment for your vehicle. Contact us to confirm.</span>
              </div>
            )}

            <div className="flex justify-between items-baseline border-t border-gray-200 pt-3">
              <span className="text-xs text-gray-500">Estimated Total</span>
              <span className="text-xl font-black text-gray-900">${totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* CTA */}
          {!checkoutMode && !submitted && (
            <div className="space-y-2">
              <button
                onClick={() => setCheckoutMode('cart')}
                className="w-full flex items-center justify-center gap-2 bg-[#CC0000] hover:bg-[#aa0000] text-white font-bold py-3 rounded text-sm transition-all"
              >
                <ShoppingCart size={14} /> Add to Cart
              </button>
              <button
                onClick={() => setCheckoutMode('quote')}
                className="w-full flex items-center justify-center gap-2 border-2 border-[#003DA5] text-[#003DA5] hover:bg-[#003DA5] hover:text-white font-semibold py-3 rounded text-sm transition-all"
              >
                <FileText size={14} /> Request a Quote
              </button>
            </div>
          )}

          {/* Cart */}
          {checkoutMode === 'cart' && (
            <div className="space-y-2">
              <div className="bg-gray-50 border border-gray-200 rounded p-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 truncate mr-2">{selectedSku.sku}</span>
                  <span className="text-gray-900 shrink-0 font-semibold">${selectedSku.price.toLocaleString()}</span>
                </div>
                {selectedUpsells.map(i => (
                  <div key={i.id} className="flex justify-between">
                    <span className="text-gray-500 truncate mr-2">{i.sku}</span>
                    <span className="text-gray-900 shrink-0">+${i.price}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-1.5 flex justify-between font-bold text-sm">
                  <span>Total</span>
                  <span>${totalPrice.toLocaleString()}</span>
                </div>
              </div>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded text-sm flex items-center justify-center gap-2">
                <ShoppingCart size={14} /> Proceed to Checkout
                <span className="text-[9px] font-normal opacity-60">(prototype)</span>
              </button>
              <button onClick={() => setCheckoutMode(null)} className="w-full text-xs text-gray-400 hover:text-gray-600 py-1">← Back</button>
            </div>
          )}

          {/* Quote form */}
          {checkoutMode === 'quote' && !submitted && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Request a Quote</div>
                <button onClick={() => setCheckoutMode(null)} className="text-gray-400 hover:text-gray-600 text-xs">Cancel</button>
              </div>
              {[
                { key: 'name', label: 'Name *', placeholder: 'Your name', type: 'text' },
                { key: 'agency', label: 'Agency / Dept', placeholder: 'Optional', type: 'text' },
                { key: 'email', label: 'Email *', placeholder: 'your@email.com', type: 'email' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={quoteForm[f.key]}
                    onChange={e => setQuoteForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#003DA5]"
                  />
                </div>
              ))}
              <textarea
                placeholder="Notes (optional)"
                value={quoteForm.notes}
                onChange={e => setQuoteForm(p => ({ ...p, notes: e.target.value }))}
                rows={2}
                className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#003DA5] resize-none"
              />
              <button
                onClick={handleSubmitQuote}
                disabled={!quoteForm.name || !quoteForm.email}
                className="w-full bg-[#CC0000] hover:bg-[#aa0000] disabled:opacity-40 text-white font-bold py-2.5 rounded text-xs transition-all"
              >
                Submit Quote Request
              </button>
            </div>
          )}

          {submitted && (
            <div className="bg-green-50 border border-green-200 rounded p-4 text-center">
              <CheckCircle size={20} className="text-green-600 mx-auto mb-2" />
              <div className="font-bold text-green-700 text-sm mb-1">Quote Submitted</div>
              <p className="text-[10px] text-gray-500">A TFR specialist will respond to <span className="text-gray-800 font-semibold">{quoteForm.email}</span> within 1 business day.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}