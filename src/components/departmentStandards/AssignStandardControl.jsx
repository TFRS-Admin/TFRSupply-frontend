/**
 * components/departmentStandards/AssignStandardControl.jsx
 * A single <select> for assigning a Department Standard to a Fleet Build or
 * Fleet Project (Feature 7: "Assign standards to projects" / "Assign
 * standards to individual builds"). Reused by FleetBuildCard and
 * FleetProjectCard so assignment behaves identically at both scopes.
 */
import React from 'react';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

const fieldLabelStyle = {
  display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
  textTransform: 'uppercase', color: '#999', marginBottom: 4,
};

const selectStyle = {
  ...FS, width: '100%', padding: '7px 8px', fontSize: 12.5, minHeight: 32,
  border: '1.5px solid #d0d0d0', borderRadius: 2, background: '#fff', color: '#1a1a1a',
  outline: 'none', cursor: 'pointer',
};

export default function AssignStandardControl({
  label = 'Department Standard',
  defaultStandards = [],
  companyStandards = [],
  value,
  inheritedLabel,
  onChange,
}) {
  return (
    <div>
      <label style={fieldLabelStyle}>{label}</label>
      <select
        style={selectStyle}
        aria-label={label}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">{inheritedLabel ?? 'No Standard Assigned'}</option>
        {defaultStandards.length > 0 && (
          <optgroup label="Default Standards">
            {defaultStandards.map((standard) => (
              <option key={standard.id} value={standard.id}>{standard.name}</option>
            ))}
          </optgroup>
        )}
        {companyStandards.length > 0 && (
          <optgroup label="Company Standards">
            {companyStandards.map((standard) => (
              <option key={standard.id} value={standard.id}>{standard.name}</option>
            ))}
          </optgroup>
        )}
      </select>
    </div>
  );
}
