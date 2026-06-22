import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle, ArrowLeft, Package, Car, Wrench, Zap, Cpu, Layers, Shield } from 'lucide-react';
import { FAMILIES } from '@/data/sampleData';
import { useConfigurator } from '@/context/ConfiguratorContext';
import PrototypeBanner from '@/components/PrototypeBanner';
import DebugToggle from '@/components/DebugToggle';
import DebugPanel from '@/components/DebugPanel';

export default function BuildReview() {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const { state } = useConfigurator();
  const family = FAMILIES[familyId];

  const { vehicle, coreOption, accessories, resolvedDependencies } = state;

  const hasVerificationIssues =
    accessories.some(a => a.verificationNeeded) ||
    resolvedDependencies.some(d => d.status === 'needs_verification');

  const totalPrice =
    (coreOption?.price || 0) +
    accessories.reduce((sum, a) => sum + a.price, 0) +
    resolvedDependencies.reduce((sum, d) => sum + d.price, 0);

  const skuOutcome = `${family?.baseSkuPrefix}-${vehicle.year?.slice(-2)}-${vehicle.make?.slice(0,3).toUpperCase()}-${coreOption?.sku?.split('-').pop() || 'XX'}`;

  const Section = ({ icon: Icon, title, children, className = '' }) => (
    <div className={`bg-white/[0.03] border border-white/10 rounded-2xl p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} className="text-blue-400" />
        <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      <PrototypeBanner />

      <nav className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(`/configure/${familyId}/step/3`)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft size={16} /> Back to Dependencies
        </button>
        <span className="text-gray-700">/</span>
        <span className="text-gray-300 text-sm">{family?.name} — Review Build</span>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">Selected Build Summary</div>
          <h1 className="text-3xl font-extrabold">{family?.name} Configuration</h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-xs font-mono bg-white/[0.06] border border-white/10 px-3 py-1.5 rounded-lg text-gray-400">
              Configuration Outcome: <span className="text-white font-bold">{skuOutcome}</span>
            </span>
            {hasVerificationIssues && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg animate-pulse">
                <AlertTriangle size={12} /> Verification Required
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: build items */}
          <div className="lg:col-span-2 space-y-4">
            <Section icon={Car} title="Vehicle">
              <div className="text-white font-bold">{vehicle.year} {vehicle.make} {vehicle.model}</div>
              <div className="text-gray-500 text-sm">Trim: {vehicle.trim}</div>
            </Section>

            {coreOption && (
              <Section icon={Package} title="Core Product">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-white font-bold">{coreOption.label}</div>
                    <div className="text-gray-400 text-sm mt-0.5">{coreOption.description}</div>
                    <div className="text-xs font-mono text-gray-600 mt-1">{coreOption.sku}</div>
                  </div>
                  <div className="text-lg font-extrabold text-white shrink-0">${coreOption.price.toLocaleString()}</div>
                </div>
              </Section>
            )}

            {accessories.length > 0 && (
              <Section icon={Zap} title={`Accessories (${accessories.length})`}>
                <div className="space-y-2.5">
                  {accessories.map(a => (
                    <div key={a.id} className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white">{a.label}</span>
                          {a.autoAdded && (
                            <span className="text-[9px] font-bold bg-blue-600/30 text-blue-300 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Auto</span>
                          )}
                          {a.verificationNeeded && (
                            <span className="flex items-center gap-1 text-[9px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                              <AlertTriangle size={7} /> Verify
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-gray-600">{a.sku}</div>
                      </div>
                      <span className="text-sm font-bold text-white">+${a.price}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {resolvedDependencies.length > 0 && (
              <Section icon={Wrench} title={`Auto-Resolved Dependencies (${resolvedDependencies.length})`}>
                <div className="space-y-2.5">
                  {resolvedDependencies.map(d => (
                    <div key={d.id} className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {d.status === 'confirmed'
                            ? <CheckCircle size={12} className="text-green-400" />
                            : <AlertTriangle size={12} className="text-amber-400" />}
                          <span className="text-sm text-white">{d.label}</span>
                          {d.status === 'needs_verification' && (
                            <span className="text-[9px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                              Needs Verification
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-gray-600 ml-5">{d.sku}</div>
                      </div>
                      <span className="text-sm font-bold text-white">+${d.price}</span>
                    </div>
                  ))}
                </div>
                {hasVerificationIssues && (
                  <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-600/80 leading-relaxed">
                    <AlertTriangle size={12} className="inline text-amber-400 mr-1" />
                    Items flagged "Needs Verification" are included in this build and quote, but require TFR Supply specialist review before fulfillment.
                  </div>
                )}
              </Section>
            )}
          </div>

          {/* Right: price + CTA */}
          <div className="space-y-4">
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
              <div className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">Build Total</div>
              <div className="text-3xl font-extrabold text-white mb-1">
                ${totalPrice.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 mb-6">Estimated — excludes installation &amp; tax</div>

              <div className="space-y-2 text-xs text-gray-600 border-t border-white/10 pt-4 mb-6">
                {coreOption && <div className="flex justify-between"><span>Core Product</span><span className="text-white">${coreOption.price.toLocaleString()}</span></div>}
                {accessories.length > 0 && <div className="flex justify-between"><span>Accessories</span><span className="text-white">${accessories.reduce((s,a)=>s+a.price,0).toLocaleString()}</span></div>}
                {resolvedDependencies.length > 0 && <div className="flex justify-between"><span>Dependencies</span><span className="text-white">${resolvedDependencies.reduce((s,d)=>s+d.price,0).toLocaleString()}</span></div>}
              </div>

              <button
                onClick={() => navigate(`/configure/${familyId}/checkout`)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-sm tracking-wide transition-all mb-2"
              >
                Proceed to Quote / Cart →
              </button>
              <p className="text-[10px] text-gray-600 text-center">
                You'll choose between Request a Quote and Add to Cart on the next screen
              </p>
            </div>

            {hasVerificationIssues && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-2">
                  <AlertTriangle size={12} /> Verification Required
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  This build contains items that need specialist verification. Your quote will include a note to review flagged items.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <DebugToggle />
      <DebugPanel />
    </div>
  );
}