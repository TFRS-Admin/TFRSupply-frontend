/**
 * components/upfitBuilder/UpfitBuilderSetupSteps.jsx
 * The 5 setup-stage panels ("Select Fleet Project" → "Select Build Style")
 * that precede the upfit-category checklist. Every field here reads/writes
 * the existing FleetProjectContext/FleetBuildsContext/DepartmentStandardsContext
 * state — this feature adds no new project/build/vehicle/standard/style data
 * model, only a guided sequence and Next/Back wiring around it.
 */
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { BUILD_STYLES } from '@/domain/fleetBuilds';
import { listVehicleYears, listVehicleMakes, listVehicleModels, findVehicleMasterEntry } from '@/data/vehicles/vehicleMaster';
import AssignStandardControl from '@/components/departmentStandards/AssignStandardControl';
import UpfitBuilderStepPanelShell from './UpfitBuilderStepPanelShell';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const optionCardStyle = (isActive) => ({
  ...FS, display: 'block', width: '100%', textAlign: 'left', padding: '12px 14px', marginBottom: 8,
  border: isActive ? '2px solid #c8102e' : '1px solid #e5e7eb', borderRadius: 4, cursor: 'pointer',
  background: isActive ? '#fff8f8' : '#fff', fontSize: 13, fontWeight: 700, color: '#1a1a1a',
});

const secondaryButtonStyle = {
  ...FS, fontSize: 13, fontWeight: 700, color: '#1a2744', background: '#fff', border: '2px solid #1a2744',
  padding: '10px 16px', minHeight: 44, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
};

const fieldLabelStyle = {
  display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#999', marginBottom: 4,
};

const selectStyle = {
  ...FS, width: '100%', padding: '9px 8px', fontSize: 13, minHeight: 40,
  border: '1.5px solid #d0d0d0', borderRadius: 2, background: '#fff', color: '#1a1a1a', outline: 'none', cursor: 'pointer',
};

export function SelectProjectStep({ projects, activeProjectId, isFull, onCreateProject, onSelectProject, onNext }) {
  return (
    <UpfitBuilderStepPanelShell
      title="Select Fleet Project"
      description="Choose the Fleet Project this upfit belongs to, or start a new one."
      onNext={onNext}
      nextDisabled={!activeProjectId}
    >
      {projects.map((project) => (
        <button key={project.id} type="button" style={optionCardStyle(project.id === activeProjectId)} onClick={() => onSelectProject(project.id)}>
          {project.name}
        </button>
      ))}
      <button type="button" style={secondaryButtonStyle} onClick={onCreateProject} disabled={isFull}>
        <Plus size={14} /> New Fleet Project
      </button>
    </UpfitBuilderStepPanelShell>
  );
}

export function SelectBuildStep({ builds, activeBuildId, isFull, onCreateBuild, onSelectBuild, onNext, onBack }) {
  return (
    <UpfitBuilderStepPanelShell
      title="Select or Create Fleet Build"
      description="Choose the vehicle spec you're upfitting, or start a new Fleet Build in this project."
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!activeBuildId}
    >
      {builds.map((build) => (
        <button key={build.id} type="button" style={optionCardStyle(build.id === activeBuildId)} onClick={() => onSelectBuild(build.id)}>
          {build.name}
          {build.vehicle && <span style={{ fontWeight: 500, color: '#888' }}> — {build.vehicle.year} {build.vehicle.make} {build.vehicle.model}</span>}
        </button>
      ))}
      <button type="button" style={secondaryButtonStyle} onClick={onCreateBuild} disabled={isFull}>
        <Plus size={14} /> New Fleet Build
      </button>
    </UpfitBuilderStepPanelShell>
  );
}

export function SelectVehicleStep({ build, onUpdateVehicle, onNext, onBack }) {
  const [year, setYear] = useState(build?.vehicle?.year || '');
  const [make, setMake] = useState(build?.vehicle?.make || '');
  const [model, setModel] = useState(build?.vehicle?.model || '');
  const years = listVehicleYears();
  const makes = listVehicleMakes(year || null);
  const models = listVehicleModels(year || null, make || null);

  function handleModelChange(nextModel) {
    setModel(nextModel);
    if (year && make && nextModel) {
      const entry = findVehicleMasterEntry(year, make, nextModel);
      onUpdateVehicle({ vehicleId: entry?.vehicleId, year, make, model: nextModel, vertical: entry?.vertical ?? null });
    }
  }

  return (
    <UpfitBuilderStepPanelShell
      title="Select Vehicle"
      description="Pick the vehicle this Fleet Build is for so we can guide the right upfit categories."
      onBack={onBack}
      onNext={onNext}
    >
      <div className="upfit-builder-vehicle-grid grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label style={fieldLabelStyle}>Year</label>
          <select style={selectStyle} value={year} onChange={(e) => { setYear(e.target.value); setMake(''); setModel(''); }}>
            <option value="">Year</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label style={{ ...fieldLabelStyle, color: !year ? '#ccc' : '#999' }}>Make</label>
          <select style={{ ...selectStyle, opacity: !year ? 0.5 : 1 }} value={make} disabled={!year} onChange={(e) => { setMake(e.target.value); setModel(''); }}>
            <option value="">Make</option>
            {makes.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label style={{ ...fieldLabelStyle, color: (!year || !make) ? '#ccc' : '#999' }}>Model</label>
          <select style={{ ...selectStyle, opacity: (!year || !make) ? 0.5 : 1 }} value={model} disabled={!year || !make} onChange={(e) => handleModelChange(e.target.value)}>
            <option value="">Model</option>
            {models.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      {!build?.vehicle && (
        <p style={{ fontSize: 12, color: '#888', marginTop: 12 }}>No vehicle selected yet — you can still continue and add one later.</p>
      )}
    </UpfitBuilderStepPanelShell>
  );
}

export function SelectStandardStep({
  build, defaultStandards, companyStandards, onAssignStandard, onSkip, onNext, onBack,
}) {
  return (
    <UpfitBuilderStepPanelShell
      title="Select Department Standard"
      description="Assign a Department Standard to measure this build's required/recommended equipment against, or continue without one."
      onBack={onBack}
      onNext={onNext}
      extraActions={
        <button type="button" style={secondaryButtonStyle} onClick={onSkip}>
          Continue without a Standard
        </button>
      }
    >
      <AssignStandardControl
        defaultStandards={defaultStandards}
        companyStandards={companyStandards}
        value={build?.departmentStandardId ?? null}
        inheritedLabel="Inherit from Project"
        onChange={onAssignStandard}
      />
    </UpfitBuilderStepPanelShell>
  );
}

export function SelectStyleStep({ build, onUpdateStyle, onNext, onBack }) {
  return (
    <UpfitBuilderStepPanelShell
      title="Select Build Style"
      description="Build style drives which upfit categories are prioritized when no Department Standard is assigned."
      onBack={onBack}
      onNext={onNext}
    >
      <div>
        <label style={fieldLabelStyle}>Build Style</label>
        <select
          style={selectStyle}
          value={build?.buildStyle ?? ''}
          aria-label="Build style"
          onChange={(e) => onUpdateStyle(e.target.value || null)}
        >
          <option value="">No Style Selected</option>
          {BUILD_STYLES.map((style) => <option key={style.id} value={style.id}>{style.label}</option>)}
        </select>
      </div>
    </UpfitBuilderStepPanelShell>
  );
}
