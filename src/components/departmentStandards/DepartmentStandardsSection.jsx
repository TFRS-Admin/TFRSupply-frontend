/**
 * components/departmentStandards/DepartmentStandardsSection.jsx
 * /workspace section — the Department Standards library (Feature 1 + 7):
 * every shipped default standard (read-only, "Clone to Customize") and every
 * saved company standard (renamable, deletable, with editable required/
 * recommended/optional category tiers). Pure/presentational (props-driven),
 * matching FleetProjectsWorkspaceSection's convention of resolving context
 * state and mutation callbacks in the connected WorkspaceDashboard wrapper.
 */
import React, { useState } from 'react';
import { ShieldCheck, Copy, Pencil, Trash2, Plus, X } from 'lucide-react';
import { ALL_UPFIT_CATEGORY_IDS, getUpfitCategoryLabel } from '@/domain/fleetBuilds';
import { StandardTierChip } from './DepartmentStandardBadge';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };
const TIERS = ['required', 'recommended', 'optional'];

const baseBtnStyle = {
  ...FS, fontSize: 11, fontWeight: 700, borderRadius: 2, padding: '5px 9px', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 4, border: '1.5px solid transparent', minHeight: 30,
};
const secondaryBtnStyle = { ...baseBtnStyle, color: '#1a2744', background: 'none', border: '1.5px solid #1a2744' };
const dangerBtnStyle = { ...baseBtnStyle, color: '#b91c1c', background: 'none', border: '1.5px solid #fca5a5' };

function TierBlock({ tier, categoryIds, editable, onAddCategory, onRemoveCategory }) {
  const [pendingCategory, setPendingCategory] = useState('');
  const available = ALL_UPFIT_CATEGORY_IDS.filter((id) => !categoryIds.includes(id));

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ marginBottom: 6 }}><StandardTierChip tier={tier} /></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: editable && available.length > 0 ? 8 : 0 }}>
        {categoryIds.length === 0 && (
          <span style={{ ...FS, fontSize: 12, color: '#aaa' }}>None</span>
        )}
        {categoryIds.map((categoryId) => (
          <span
            key={categoryId}
            style={{
              ...FS, fontSize: 11.5, color: '#1a1a1a', background: '#f3f4f6', padding: '3px 8px',
              borderRadius: 2, display: 'inline-flex', alignItems: 'center', gap: 4,
            }}
          >
            {getUpfitCategoryLabel(categoryId)}
            {editable && (
              <button
                type="button"
                onClick={() => onRemoveCategory(tier, categoryId)}
                aria-label={`Remove ${getUpfitCategoryLabel(categoryId)} from ${tier}`}
                style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                <X size={11} />
              </button>
            )}
          </span>
        ))}
      </div>
      {editable && available.length > 0 && (
        <div style={{ display: 'flex', gap: 6 }}>
          <select
            aria-label={`Add category to ${tier}`}
            value={pendingCategory}
            onChange={(e) => setPendingCategory(e.target.value)}
            style={{ ...FS, fontSize: 12, padding: '5px 6px', border: '1.5px solid #d0d0d0', borderRadius: 2, minHeight: 30 }}
          >
            <option value="">Add category…</option>
            {available.map((id) => <option key={id} value={id}>{getUpfitCategoryLabel(id)}</option>)}
          </select>
          <button
            type="button"
            disabled={!pendingCategory}
            onClick={() => { onAddCategory(tier, pendingCategory); setPendingCategory(''); }}
            style={{ ...secondaryBtnStyle, opacity: pendingCategory ? 1 : 0.5, cursor: pendingCategory ? 'pointer' : 'not-allowed' }}
          >
            <Plus size={11} /> Add
          </button>
        </div>
      )}
    </div>
  );
}

function DepartmentStandardRow({ standard, onClone, onRename, onDelete, onAddCategory, onRemoveCategory }) {
  const [name, setName] = useState(standard.name);
  const [editingName, setEditingName] = useState(false);

  function commitName() {
    const trimmed = name.trim();
    setEditingName(false);
    if (trimmed && trimmed !== standard.name) onRename(trimmed);
    else setName(standard.name);
  }

  return (
    <div
      data-testid="department-standard-row"
      data-standard-id={standard.id}
      style={{ border: '1px solid #e5e7eb', borderRadius: 4, padding: '14px 16px', marginBottom: 12, background: '#fff' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
        {editingName ? (
          <input
            type="text"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
            aria-label="Standard name"
            style={{ ...FS, flex: '1 1 160px', minWidth: 120, fontSize: 14, fontWeight: 700, color: '#1a1a1a', border: 'none', borderBottom: '1.5px solid #eee', padding: '2px 0', outline: 'none', background: 'transparent' }}
          />
        ) : (
          <p style={{ ...FS, flex: '1 1 160px', minWidth: 120, fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{standard.name}</p>
        )}
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', padding: '3px 8px', borderRadius: 2,
          color: standard.isCustom ? '#166534' : '#666', background: standard.isCustom ? '#dcfce7' : '#eee',
        }}>
          {standard.isCustom ? 'COMPANY STANDARD' : 'DEFAULT STANDARD'}
        </span>
      </div>

      {standard.description && (
        <p style={{ ...FS, fontSize: 12, color: '#666', margin: '0 0 10px' }}>{standard.description}</p>
      )}

      {TIERS.map((tier) => (
        <TierBlock
          key={tier}
          tier={tier}
          categoryIds={standard.categories[tier]}
          editable={standard.isCustom}
          onAddCategory={onAddCategory}
          onRemoveCategory={onRemoveCategory}
        />
      ))}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
        {standard.isCustom ? (
          <>
            <button type="button" onClick={() => setEditingName(true)} style={secondaryBtnStyle}><Pencil size={12} /> Rename</button>
            <button type="button" onClick={onClone} style={secondaryBtnStyle}><Copy size={12} /> Duplicate</button>
            <button type="button" onClick={onDelete} style={dangerBtnStyle}><Trash2 size={12} /> Delete</button>
          </>
        ) : (
          <button type="button" onClick={onClone} style={secondaryBtnStyle}><Copy size={12} /> Clone to Customize</button>
        )}
      </div>
    </div>
  );
}

export default function DepartmentStandardsSection({
  defaultStandards = [],
  companyStandards = [],
  isFull = false,
  onClone,
  onRename,
  onDelete,
  onAddCategory,
  onRemoveCategory,
}) {
  return (
    <section style={{ marginBottom: 32 }} data-testid="department-standards-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
        <p style={{
          ...FS, fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
          color: '#1a2744', display: 'flex', alignItems: 'center', gap: 8, margin: 0,
        }}>
          <ShieldCheck size={14} /> {`Department Standards (${defaultStandards.length + companyStandards.length})`}
        </p>
      </div>
      <p style={{ ...FS, fontSize: 12, color: '#666', lineHeight: 1.6, margin: '0 0 14px' }}>
        Default standards describe each department&apos;s typical required, recommended, and optional equipment.
        Clone one to create an editable Company Standard, then assign it to a Fleet Project or an individual Fleet Build.
      </p>

      {companyStandards.length > 0 && (
        <div className="department-standards-grid grid grid-cols-1 md:grid-cols-2 gap-3" style={{ marginBottom: 18 }}>
          {companyStandards.map((standard) => (
            <DepartmentStandardRow
              key={standard.id}
              standard={standard}
              onClone={() => onClone(standard)}
              onRename={(name) => onRename(standard.id, name)}
              onDelete={() => onDelete(standard.id)}
              onAddCategory={(tier, categoryId) => onAddCategory(standard.id, tier, categoryId)}
              onRemoveCategory={(tier, categoryId) => onRemoveCategory(standard.id, tier, categoryId)}
            />
          ))}
        </div>
      )}

      {isFull && (
        <p style={{ ...FS, fontSize: 11, color: '#999', margin: '0 0 12px' }}>
          You&apos;ve reached the company standards limit. Delete one to clone another.
        </p>
      )}

      <div className="department-standards-grid grid grid-cols-1 md:grid-cols-2 gap-3">
        {defaultStandards.map((standard) => (
          <DepartmentStandardRow key={standard.id} standard={standard} onClone={() => onClone(standard)} />
        ))}
      </div>
    </section>
  );
}
