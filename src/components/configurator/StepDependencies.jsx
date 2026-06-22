import React from 'react';
import { AlertTriangle, CheckCircle, Wrench, Cpu, Layers, Shield, Package } from 'lucide-react';
import { useConfigurator } from '@/context/ConfiguratorContext';

const typeConfig = {
  bracket: { icon: Wrench, label: 'Bracket', color: 'text-cyan-400' },
  harness: { icon: Cpu, label: 'Wiring Harness', color: 'text-purple-400' },
  controller: { icon: Cpu, label: 'Controller Module', color: 'text-violet-400' },
  shroud: { icon: Layers, label: 'Shroud / Trim', color: 'text-teal-400' },
  mount_kit: { icon: Shield, label: 'Mount Kit', color: 'text-blue-400' },
};

export default function StepDependencies({ onNext, onBack }) {
  const { state } = useConfigurator();
  const deps = state.resolvedDependencies;
  const vehicle = state.vehicle;

  const confirmed = deps.filter(d => d.status === 'confirmed');
  const needsVerification = deps.filter(d => d.status === 'needs_verification');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold mb-1">Auto-Resolved Dependencies</h2>
        <p className="text-gray-500 text-sm">
          These items were automatically added based on your vehicle: <span className="text-white font-semibold">{vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}</span>
        </p>
      </div>

      {deps.length === 0 && (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center text-gray-500">
          No dependencies resolved — complete vehicle selection to see required hardware.
        </div>
      )}

      {confirmed.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-green-400 text-xs font-bold tracking-widest uppercase mb-3">
            <CheckCircle size={12} /> Confirmed ({confirmed.length})
          </div>
          <div className="space-y-2">
            {confirmed.map(dep => {
              const tc = typeConfig[dep.type] || { icon: Package, label: dep.type, color: 'text-gray-400' };
              const Icon = tc.icon;
              return (
                <div key={dep.id} className="flex items-start gap-4 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5">
                  <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center shrink-0">
                    <CheckCircle size={15} className="text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-white">{dep.label}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Icon size={11} className={tc.color} />
                      <span className={`text-[10px] font-semibold ${tc.color}`}>{tc.label}</span>
                      <span className="text-gray-600 font-mono text-[10px]">{dep.sku}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{dep.reason}</p>
                  </div>
                  <div className="text-sm font-bold text-white shrink-0">+${dep.price}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {needsVerification.length > 0 && (
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-widest uppercase mb-3">
            <AlertTriangle size={12} /> Needs Verification ({needsVerification.length})
          </div>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-1 space-y-2">
            {needsVerification.map(dep => {
              const tc = typeConfig[dep.type] || { icon: Package, label: dep.type, color: 'text-gray-400' };
              const Icon = tc.icon;
              return (
                <div key={dep.id} className="flex items-start gap-4 bg-amber-500/5 rounded-xl px-4 py-3.5">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <AlertTriangle size={15} className="text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white">{dep.label}</span>
                      <span className="text-[9px] font-bold tracking-widest uppercase bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full animate-pulse">
                        Needs Verification
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Icon size={11} className={tc.color} />
                      <span className={`text-[10px] font-semibold ${tc.color}`}>{tc.label}</span>
                      <span className="text-gray-600 font-mono text-[10px]">{dep.sku}</span>
                    </div>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">{dep.reason}</p>
                  </div>
                  <div className="text-sm font-bold text-white shrink-0">+${dep.price}</div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-amber-600/70 mt-2">
            Items flagged "Needs Verification" will be included in your quote. A TFR Supply specialist will confirm compatibility before order fulfillment.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 font-bold py-4 rounded-xl text-sm transition-all">
          ← Back
        </button>
        <button onClick={onNext} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-sm tracking-wide transition-all">
          Review Build →
        </button>
      </div>
    </div>
  );
}