import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { FAMILIES } from '@/data/sampleData';
import { useConfigurator } from '@/context/ConfiguratorContext';
import PrototypeBanner from '@/components/PrototypeBanner';
import DebugToggle from '@/components/DebugToggle';
import DebugPanel from '@/components/DebugPanel';
import StepProgress from '@/components/configurator/StepProgress';
import StepVehicle from '@/components/configurator/StepVehicle';
import StepOptions from '@/components/configurator/StepOptions';
import StepAccessories from '@/components/configurator/StepAccessories';
import StepDependencies from '@/components/configurator/StepDependencies';

export default function ConfiguratorWizard() {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useConfigurator();
  const [currentStep, setCurrentStep] = useState(0);

  const family = FAMILIES[familyId];
  if (!family) return null;

  const goNext = () => setCurrentStep(s => s + 1);
  const goBack = () => setCurrentStep(s => s - 1);
  const goToReview = () => navigate(`/configure/${familyId}/review`);

  const stepTitles = ['Vehicle Selection', 'Product Options', 'Accessories', 'Dependencies'];

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      <PrototypeBanner />

      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/family/${familyId}`)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} /> {family.name}
          </button>
          <span className="text-gray-700">/</span>
          <span className="text-gray-400 text-sm">Configure</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Shield size={12} />
          <span className="hidden sm:block">Police / Law Enforcement</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Step progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-extrabold">{family.name} Configurator</h1>
            <span className="text-xs text-gray-500">Step {currentStep + 1} of 4</span>
          </div>
          <StepProgress currentStep={currentStep} totalSteps={4} />
        </div>

        {/* Step content */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">
          <div className="text-xs font-bold tracking-widest text-gray-600 uppercase mb-6">
            Step {currentStep + 1} — {stepTitles[currentStep]}
          </div>

          {currentStep === 0 && (
            <StepVehicle familyId={familyId} onNext={goNext} />
          )}
          {currentStep === 1 && (
            <StepOptions familyId={familyId} onNext={goNext} onBack={goBack} />
          )}
          {currentStep === 2 && (
            <StepAccessories familyId={familyId} onNext={goNext} onBack={goBack} />
          )}
          {currentStep === 3 && (
            <StepDependencies onNext={goToReview} onBack={goBack} />
          )}
        </div>

        {/* Mini build sidebar preview */}
        {(state.vehicle.make || state.coreOption) && (
          <div className="mt-6 bg-white/[0.02] border border-white/10 rounded-xl px-5 py-4">
            <div className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Current Build</div>
            <div className="space-y-1.5">
              {state.vehicle.make && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Vehicle</span>
                  <span className="text-white font-medium">{state.vehicle.year} {state.vehicle.make} {state.vehicle.model}</span>
                </div>
              )}
              {state.coreOption && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Core Option</span>
                  <span className="text-white font-medium">{state.coreOption.label}</span>
                </div>
              )}
              {state.accessories.length > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Accessories</span>
                  <span className="text-white font-medium">{state.accessories.length} selected</span>
                </div>
              )}
              {state.resolvedDependencies.length > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Dependencies</span>
                  <span className="text-white font-medium">{state.resolvedDependencies.length} auto-resolved</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <DebugToggle />
      <DebugPanel />
    </div>
  );
}