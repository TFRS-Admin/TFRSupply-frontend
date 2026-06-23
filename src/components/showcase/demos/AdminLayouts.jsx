import React, { useState } from 'react';
import { EffectCard } from '../ShowcaseCategoryPage';

function StatsCards() {
  return (
    <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
      {[{ label:'Users', val:'12,847', trend:'+12%', up:true },{ label:'Revenue', val:'$48.2K', trend:'+8%', up:true },{ label:'Orders', val:'1,284', trend:'-3%', up:false },{ label:'Growth', val:'24.5%', trend:'+15%', up:true }].map(s => (
        <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
          <div className="text-xs text-gray-500 mb-1">{s.label}</div>
          <div className="text-lg font-black text-gray-900">{s.val}</div>
          <div className={`text-xs font-bold ${s.up ? 'text-green-500' : 'text-red-500'}`}>{s.trend}</div>
        </div>
      ))}
    </div>
  );
}

function DataTable() {
  const [sort, setSort] = useState('asc');
  const rows = [{ name:'Alice', status:'Active' },{ name:'Bob', status:'Pending' },{ name:'Charlie', status:'Inactive' }];
  return (
    <div className="w-full max-w-xs bg-white border border-gray-200 rounded-xl overflow-hidden text-xs">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th onClick={() => setSort(s => s === 'asc' ? 'desc' : 'asc')} className="text-left px-3 py-2 font-bold text-gray-600 cursor-pointer">Name {sort === 'asc' ? '↑' : '↓'}</th>
            <th className="text-left px-3 py-2 font-bold text-gray-600">Status</th>
            <th className="text-left px-3 py-2 font-bold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.name} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-2">{r.name}</td>
              <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${r.status === 'Active' ? 'bg-green-100 text-green-700' : r.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{r.status}</span></td>
              <td className="px-3 py-2"><button className="text-blue-500 hover:underline">Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminSidebar() {
  const [active, setActive] = useState('Dashboard');
  const items = ['Dashboard','Users','Analytics','Settings'];
  return (
    <div className="bg-gray-900 rounded-xl p-2 w-36 text-xs">
      {items.map(item => (
        <button key={item} onClick={() => setActive(item)} className={`w-full text-left px-3 py-2 rounded-lg mb-0.5 font-semibold transition-colors ${active === item ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>{item}</button>
      ))}
    </div>
  );
}

function AdminHeader() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl w-full max-w-xs shadow-sm">
      <div className="flex items-center justify-between px-3 py-2.5 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-black">A</div>
          <span className="font-black text-gray-900 text-sm">Admin Panel</span>
        </div>
        <input placeholder="Search..." className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none w-24" />
      </div>
    </div>
  );
}

function DropdownMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
        Actions <span className="text-gray-400">▾</span>
      </button>
      {open && (
        <div className="absolute top-10 left-0 bg-white border border-gray-200 rounded-xl shadow-xl z-10 py-1.5 w-40" onMouseLeave={() => setOpen(false)}>
          {[['✏️','Edit'],['📋','Duplicate'],['📤','Export'],['🗑️','Delete']].map(([icon, label]) => (
            <button key={label} onClick={() => setOpen(false)} className={`w-full text-left flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 ${label === 'Delete' ? 'text-red-500' : 'text-gray-700'}`}>
              {icon} {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ModalDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="bg-blue-600 text-white font-bold px-5 py-2 rounded-lg text-sm">Open Modal</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-72" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-gray-900 mb-2">Confirm Action</h3>
            <p className="text-gray-500 text-sm mb-4">Are you sure you want to delete this item?</p>
            <div className="flex gap-3">
              <button onClick={() => setOpen(false)} className="flex-1 border border-gray-200 text-gray-600 font-bold py-2 rounded-lg text-sm">Cancel</button>
              <button onClick={() => setOpen(false)} className="flex-1 bg-red-500 text-white font-bold py-2 rounded-lg text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Pagination() {
  const [page, setPage] = useState(3);
  const total = 5;
  return (
    <div className="flex items-center gap-1 text-xs font-semibold">
      <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Prev</button>
      {Array.from({ length: total }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg border transition-colors ${page === p ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{p}</button>
      ))}
      <button onClick={() => setPage(p => Math.min(total, p + 1))} className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Next</button>
    </div>
  );
}

function ToastNotif() {
  const [toasts, setToasts] = useState([]);
  const show = (type) => {
    const id = Date.now();
    setToasts(t => [...t, { id, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2">
        <button onClick={() => show('success')} className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded">Success</button>
        <button onClick={() => show('error')} className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded">Error</button>
      </div>
      <div className="flex flex-col gap-1.5 w-52">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white shadow-lg ${t.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {t.type === 'success' ? '✓ Changes saved!' : '✕ Error occurred'}
          </div>
        ))}
      </div>
    </div>
  );
}

function AvatarGroup() {
  const avatars = ['#3b82f6','#8b5cf6','#ec4899','#10b981','#f59e0b'];
  return (
    <div className="flex items-center">
      {avatars.map((color, i) => (
        <div key={i} className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-black -ml-2 first:ml-0" style={{ background: color }}>
          {String.fromCharCode(65 + i)}
        </div>
      ))}
      <div className="w-9 h-9 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-black text-gray-600 -ml-2">+12</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-4 px-4">
      <div className="text-4xl mb-2">📭</div>
      <h3 className="font-black text-gray-900 mb-1 text-sm">No data found</h3>
      <p className="text-gray-500 text-xs mb-3">Get started by creating your first item</p>
      <button className="bg-blue-600 text-white font-bold px-5 py-2 rounded-lg text-xs">Create New</button>
    </div>
  );
}

function CardWithActions() {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm w-56">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-black text-gray-900 text-sm">Project Alpha</h4>
        <div className="relative">
          <button onClick={() => setOpen(o => !o)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">⋮</button>
          {open && (
            <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-28 z-10" onMouseLeave={() => setOpen(false)}>
              {['Edit','Duplicate','Delete'].map(a => <button key={a} className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${a === 'Delete' ? 'text-red-500' : 'text-gray-700'}`}>{a}</button>)}
            </div>
          )}
        </div>
      </div>
      <p className="text-gray-500 text-xs mb-3">A brief description of this project.</p>
      <div className="flex items-center justify-between">
        <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Active</span>
        <span className="text-gray-400 text-[10px]">3 members</span>
      </div>
    </div>
  );
}

function ActivityLog() {
  const logs = [{ icon:'👤', text:'User created', meta:'by admin • 2m ago' },{ icon:'⚙️', text:'Settings updated', meta:'by john • 15m ago' },{ icon:'🗑️', text:'File deleted', meta:'by alice • 1h ago' }];
  return (
    <div className="space-y-2 w-52">
      {logs.map((l, i) => (
        <div key={i} className="flex items-start gap-2.5 text-xs">
          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm shrink-0">{l.icon}</div>
          <div><div className="font-semibold text-gray-900">{l.text}</div><div className="text-gray-400">{l.meta}</div></div>
        </div>
      ))}
    </div>
  );
}

function Badges() {
  return (
    <div className="flex flex-wrap gap-1.5">
      {[['Active','green'],['Pending','yellow'],['Inactive','red'],['Admin','blue'],['New','purple']].map(([label, color]) => (
        <span key={label} className={`px-2.5 py-0.5 rounded-full text-xs font-bold bg-${color}-100 text-${color}-700`}>{label}</span>
      ))}
    </div>
  );
}

function ProgressBars() {
  return (
    <div className="w-full max-w-xs space-y-3">
      {[['Task 1', 75, 'bg-blue-500'],['Task 2', 45, 'bg-green-500'],['Task 3', 90, 'bg-purple-500']].map(([label, pct, color]) => (
        <div key={label}>
          <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1"><span>{label}</span><span>{pct}%</span></div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

function ToggleSwitch() {
  const [on, setOn] = useState(true);
  return (
    <div className="flex items-center gap-3">
      <button onClick={() => setOn(o => !o)} className={`w-12 h-6 rounded-full transition-colors relative ${on ? 'bg-blue-600' : 'bg-gray-300'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
      <span className={`text-sm font-bold ${on ? 'text-blue-600' : 'text-gray-400'}`}>{on ? 'Enabled' : 'Disabled'}</span>
    </div>
  );
}

function SearchFilters() {
  const [filters, setFilters] = useState(['Active']);
  const opts = ['Active','Admin','Verified'];
  return (
    <div className="space-y-2 w-full max-w-xs">
      <div className="flex gap-2">
        <input className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400" placeholder="Search..." />
        <button className="text-xs font-bold border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50">Filters</button>
        <button className="text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-lg">Add</button>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {opts.map(o => (
          <button key={o} onClick={() => setFilters(f => f.includes(o) ? f.filter(x => x !== o) : [...f, o])}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-colors ${filters.includes(o) ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{o}</button>
        ))}
        {filters.length > 0 && <button onClick={() => setFilters([])} className="text-[11px] text-red-500 hover:underline font-bold">Clear all</button>}
      </div>
    </div>
  );
}

function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const cmds = ['New Document','Switch Theme','Go to Dashboard','Invite User','Export Data'];
  const filtered = cmds.filter(c => c.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 w-52">
        <span className="flex-1 text-left">Search commands...</span>
        <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500">⌘K</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-80 overflow-hidden" onClick={e => e.stopPropagation()}>
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search commands..." className="w-full px-4 py-3 text-sm focus:outline-none border-b border-gray-100" />
            <div className="py-1 max-h-48 overflow-y-auto">
              {filtered.map(c => <button key={c} onClick={() => setOpen(false)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium">{c}</button>)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function InlineEdit() {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState('Click to edit');
  return editing ? (
    <input autoFocus value={val} onChange={e => setVal(e.target.value)} onBlur={() => setEditing(false)} onKeyDown={e => e.key === 'Enter' && setEditing(false)}
      className="border-b-2 border-blue-500 outline-none text-sm font-semibold px-1 py-0.5 text-gray-900 w-44" />
  ) : (
    <span onClick={() => setEditing(true)} className="text-sm font-semibold text-gray-700 cursor-text border-b-2 border-dashed border-gray-300 pb-0.5 hover:border-blue-400">{val}</span>
  );
}

function StepperProgress() {
  const [step, setStep] = useState(2);
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xs">
      <div className="flex items-center w-full">
        {[1,2,3,4].map((s, i) => (
          <React.Fragment key={s}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-colors ${s < step ? 'bg-blue-600 text-white' : s === step ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-gray-200 text-gray-400'}`}>{s < step ? '✓' : s}</div>
            {i < 3 && <div className={`flex-1 h-0.5 transition-colors ${s < step ? 'bg-blue-600' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setStep(s => Math.max(1, s - 1))} className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600">Prev</button>
        <button onClick={() => setStep(s => Math.min(5, s + 1))} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold">Next</button>
      </div>
    </div>
  );
}

function StatusIndicator() {
  return (
    <div className="space-y-2 w-52">
      {[['API Server','online'],['Database','online'],['CDN','warning']].map(([service, status]) => (
        <div key={service} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2">
          <span className="text-xs font-semibold text-gray-700">{service}</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className={`text-[10px] font-bold ${status === 'online' ? 'text-green-600' : 'text-yellow-600'}`}>{status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function CollapsibleSection() {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-56 border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-sm font-bold text-gray-700 hover:bg-gray-100">
        <span>Advanced Settings</span><span>{open ? '▲' : '▼'}</span>
      </button>
      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: open ? '200px' : '0' }}>
        <div className="px-4 py-3 text-xs text-gray-600 bg-white">Hidden content revealed when expanded. Perfect for settings or details.</div>
      </div>
    </div>
  );
}

function PermissionMatrix() {
  return (
    <div className="w-full max-w-xs border border-gray-200 rounded-xl overflow-hidden text-xs">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-3 py-2 font-bold text-gray-600">Role</th>
            <th className="px-3 py-2 font-bold text-gray-600">Read</th>
            <th className="px-3 py-2 font-bold text-gray-600">Write</th>
            <th className="px-3 py-2 font-bold text-gray-600">Delete</th>
          </tr>
        </thead>
        <tbody>
          {[['Admin','✓','✓','✓'],['Editor','✓','✓','—'],['Viewer','✓','—','—']].map(([role, ...perms]) => (
            <tr key={role} className="border-t border-gray-100">
              <td className="px-3 py-2 font-semibold text-gray-700">{role}</td>
              {perms.map((p, i) => <td key={i} className={`px-3 py-2 text-center font-bold ${p === '✓' ? 'text-green-500' : 'text-gray-300'}`}>{p}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminLayouts() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <EffectCard title="Stats Cards" desc="KPI metrics with trend indicators" whenToUse="Dashboard overviews, analytics summaries, performance metrics." prompt="Create 4 KPI stat cards in a 2x2 grid. Each has a label, large font-black number, and a colored trend badge. Green for positive, red for negative." code={`<div className="grid grid-cols-2 gap-2">\n  {stats.map(s => (\n    <div key={s.label} className="bg-white border rounded-xl p-3 shadow-sm">\n      <div className="text-xs text-gray-500 mb-1">{s.label}</div>\n      <div className="text-lg font-black text-gray-900">{s.val}</div>\n      <div className={\`text-xs font-bold \${s.up ? 'text-green-500' : 'text-red-500'}\`}>{s.trend}</div>\n    </div>\n  ))}\n</div>`}><StatsCards /></EffectCard>

      <EffectCard title="Data Table" desc="Sortable rows with status badges" whenToUse="User lists, order management, inventory, logs." prompt="Create a sortable data table with name, status badge (green/yellow/red), and edit actions. Gray header with hover rows." code={`<table className="w-full text-xs">\n  <thead className="bg-gray-50">\n    <tr><th onClick={() => setSort(s => s==='asc'?'desc':'asc')} className="cursor-pointer">Name {sort === 'asc' ? '↑' : '↓'}</th>\n    <th>Status</th><th>Actions</th></tr>\n  </thead>\n  <tbody>{rows.map(r => (\n    <tr className="border-t hover:bg-gray-50">\n      <td>{r.name}</td>\n      <td><span className={statusColor}>{r.status}</span></td>\n      <td><button className="text-blue-500">Edit</button></td>\n    </tr>\n  ))}</tbody>\n</table>`}><DataTable /></EffectCard>

      <EffectCard title="Admin Sidebar" desc="Dark navigation with active state" whenToUse="Admin panels, dashboards, settings pages." prompt="Create a dark sidebar navigation (bg-gray-900). Active item has bg-blue-600 text-white. Inactive items are gray and hover to white." code={`<div className="bg-gray-900 rounded-xl p-2 w-36">\n  {['Dashboard','Users','Analytics','Settings'].map(item => (\n    <button key={item} onClick={() => setActive(item)}\n      className={\`w-full text-left px-3 py-2 rounded-lg font-semibold text-xs \${active === item ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}\`}>\n      {item}\n    </button>\n  ))}\n</div>`}><AdminSidebar /></EffectCard>

      <EffectCard title="Admin Header" desc="Top bar with search and user avatar" whenToUse="Admin dashboards, SaaS applications." prompt="Create an admin header bar with a logo/avatar on the left, app name, and a search input on the right." code={`<div className="bg-white border-b shadow-sm">\n  <div className="flex items-center justify-between px-4 py-3">\n    <div className="flex items-center gap-2">\n      <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-black">A</div>\n      <span className="font-black">Admin Panel</span>\n    </div>\n    <input placeholder="Search..." className="border rounded-lg px-2 py-1 text-xs w-24" />\n  </div>\n</div>`}><AdminHeader /></EffectCard>

      <EffectCard title="Dropdown Menu" desc="Context menu with icon actions" whenToUse="Table row actions, more options, context menus." prompt="Create a dropdown menu triggered by a button. Shows on click, hides on mouse leave. Actions include Edit, Duplicate, Export (gray), and Delete (red text)." code={`function DropdownMenu() {\n  const [open, setOpen] = useState(false);\n  return (\n    <div className="relative">\n      <button onClick={() => setOpen(o => !o)}>Actions ▾</button>\n      {open && (\n        <div className="absolute top-10 bg-white border rounded-xl shadow-xl py-1.5 w-40">\n          {[['✏️','Edit'],['📋','Duplicate'],['📤','Export'],['🗑️','Delete']].map(([icon, label]) => (\n            <button key={label} className={\`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 \${label === 'Delete' ? 'text-red-500' : 'text-gray-700'}\`}>\n              {icon} {label}\n            </button>\n          ))}\n        </div>\n      )}\n    </div>\n  );\n}`}><DropdownMenu /></EffectCard>

      <EffectCard title="Modal Dialog" desc="Confirmation dialog with backdrop" whenToUse="Delete confirmations, forms, alerts." prompt="Create a modal with a dark overlay backdrop. Clicking outside closes it. Has title, body, and Cancel/Delete action buttons." code={`function Modal({ onClose }) {\n  return (\n    <div className="fixed inset-0 flex items-center justify-center bg-black/50" onClick={onClose}>\n      <div className="bg-white rounded-2xl p-6 shadow-2xl w-72" onClick={e => e.stopPropagation()}>\n        <h3 className="font-black mb-2">Confirm Action</h3>\n        <p className="text-gray-500 text-sm mb-4">Are you sure?</p>\n        <div className="flex gap-3">\n          <button onClick={onClose}>Cancel</button>\n          <button onClick={onClose} className="bg-red-500 text-white">Delete</button>\n        </div>\n      </div>\n    </div>\n  );\n}`}><ModalDialog /></EffectCard>

      <EffectCard title="Pagination" desc="Page navigation with numbered buttons" whenToUse="Data tables, lists, search results." prompt="Create pagination with Prev/Next buttons and numbered pages. Active page is blue. Prev/Next are disabled at boundaries." code={`function Pagination() {\n  const [page, setPage] = useState(1);\n  return (\n    <div className="flex items-center gap-1">\n      <button onClick={() => setPage(p => Math.max(1, p-1))}>Prev</button>\n      {[1,2,3,4,5].map(p => (\n        <button key={p} onClick={() => setPage(p)}\n          className={\`w-8 h-8 rounded-lg border \${page === p ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}\`}>\n          {p}\n        </button>\n      ))}\n      <button onClick={() => setPage(p => Math.min(5, p+1))}>Next</button>\n    </div>\n  );\n}`}><Pagination /></EffectCard>

      <EffectCard title="Notification Toast" desc="Auto-dismissing pop-up notifications" whenToUse="Success messages, errors, alerts." prompt="Create toast notifications that appear on click with success/error styling. Auto-dismiss after 3 seconds using setTimeout." code={`function useToasts() {\n  const [toasts, setToasts] = useState([]);\n  const show = (type) => {\n    const id = Date.now();\n    setToasts(t => [...t, { id, type }]);\n    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);\n  };\n  return { toasts, show };\n}`}><ToastNotif /></EffectCard>

      <EffectCard title="Avatar Group" desc="Stacked overlapping user avatars" whenToUse="Team members, collaborators, assignees." prompt="Create stacked user avatars with -ml-2 to overlap. Each has a white border. Show a +N count at the end for overflow." code={`<div className="flex items-center">\n  {avatars.map((color, i) => (\n    <div key={i} className="w-9 h-9 rounded-full border-2 border-white -ml-2 first:ml-0 flex items-center justify-center text-white text-xs font-black" style={{ background: color }}>\n      {String.fromCharCode(65+i)}\n    </div>\n  ))}\n  <div className="w-9 h-9 rounded-full border-2 border-white bg-gray-200 -ml-2 flex items-center justify-center text-xs font-black text-gray-600">+12</div>\n</div>`}><AvatarGroup /></EffectCard>

      <EffectCard title="Empty State" desc="No data placeholder with CTA" whenToUse="Empty tables, no search results, first-time users." prompt="Create an empty state with a large emoji, bold title, subtitle, and a blue CTA button. Center everything." code={`function EmptyState() {\n  return (\n    <div className="text-center py-8">\n      <div className="text-4xl mb-3">📭</div>\n      <h3 className="font-black text-gray-900 mb-1">No data found</h3>\n      <p className="text-gray-500 text-xs mb-3">Get started by creating your first item</p>\n      <button className="bg-blue-600 text-white font-bold px-5 py-2 rounded-lg text-xs">Create New</button>\n    </div>\n  );\n}`}><EmptyState /></EffectCard>

      <EffectCard title="Card with Actions" desc="Content card with a 3-dot context menu" whenToUse="Project cards, user cards, item previews." prompt="Create a card with a title, meta text, description, status badge, and a ⋮ button that opens a dropdown with Edit/Duplicate/Delete actions." code={`function CardWithActions() {\n  const [open, setOpen] = useState(false);\n  return (\n    <div className="bg-white border rounded-xl p-4">\n      <div className="flex items-center justify-between mb-2">\n        <h4 className="font-black">Project Alpha</h4>\n        <div className="relative">\n          <button onClick={() => setOpen(o => !o)}>⋮</button>\n          {open && (\n            <div className="absolute right-0 top-6 bg-white border rounded-lg shadow-lg py-1 w-28">\n              {['Edit','Duplicate','Delete'].map(a => <button key={a}>{a}</button>)}\n            </div>\n          )}\n        </div>\n      </div>\n      <p className="text-gray-500 text-xs mb-3">Description...</p>\n      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Active</span>\n    </div>\n  );\n}`}><CardWithActions /></EffectCard>

      <EffectCard title="Activity Log" desc="Timeline of recent actions" whenToUse="Audit logs, user activity, change history." prompt="Create an activity log with 3-4 entries. Each has an emoji icon in a circle, action text, and a 'by user • time ago' meta line." code={`const logs = [\n  { icon:'👤', text:'User created', meta:'by admin • 2m ago' },\n  { icon:'⚙️', text:'Settings updated', meta:'by john • 15m ago' },\n  { icon:'🗑️', text:'File deleted', meta:'by alice • 1h ago' }\n];\n{logs.map(l => (\n  <div className="flex items-start gap-2.5">\n    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">{l.icon}</div>\n    <div><div className="font-semibold">{l.text}</div><div className="text-gray-400 text-xs">{l.meta}</div></div>\n  </div>\n))}`}><ActivityLog /></EffectCard>

      <EffectCard title="Badges & Tags" desc="Color-coded status labels" whenToUse="User roles, statuses, categories." prompt="Create status badges with Tailwind color variants: Active (green), Pending (yellow), Inactive (red), Admin (blue), New (purple). Use rounded-full and font-bold." code={`{[['Active','green'],['Pending','yellow'],['Inactive','red'],['Admin','blue'],['New','purple']].map(([label, color]) => (\n  <span className={\`px-2.5 py-0.5 rounded-full text-xs font-bold bg-\${color}-100 text-\${color}-700\`}>\n    {label}\n  </span>\n))}`}><Badges /></EffectCard>

      <EffectCard title="Progress Bars" desc="Task and upload progress indicators" whenToUse="File uploads, task completion, loading states." prompt="Create animated progress bars with label/percent on each side. Different colors (blue, green, purple) per bar." code={`{tasks.map(t => (\n  <div key={t.label}>\n    <div className="flex justify-between text-xs font-semibold mb-1"><span>{t.label}</span><span>{t.pct}%</span></div>\n    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">\n      <div className={\`h-full \${t.color} rounded-full\`} style={{ width: \`\${t.pct}%\` }} />\n    </div>\n  </div>\n))}`}><ProgressBars /></EffectCard>

      <EffectCard title="Toggle Switch" desc="iOS-style feature flag control" whenToUse="Feature flags, notifications, preferences." prompt="Create an iOS-style toggle with a pill background that transitions from gray to blue. A white circle slides right when enabled using translate-x." code={`function Toggle() {\n  const [on, setOn] = useState(false);\n  return (\n    <div className="flex items-center gap-3">\n      <button onClick={() => setOn(o => !o)}\n        className={\`w-12 h-6 rounded-full transition-colors \${on ? 'bg-blue-600' : 'bg-gray-300'}\`}>\n        <span className={\`w-5 h-5 bg-white rounded-full shadow transition-transform \${on ? 'translate-x-6' : 'translate-x-0'}\`} />\n      </button>\n      <span className={on ? 'text-blue-600 font-bold' : 'text-gray-400'}>{on ? 'Enabled' : 'Disabled'}</span>\n    </div>\n  );\n}`}><ToggleSwitch /></EffectCard>

      <EffectCard title="Search with Filters" desc="Search bar with toggle filter chips" whenToUse="Data tables, user lists, logs." prompt="Create a search bar with Add button, and below it filter chips (Active, Admin, Verified) that toggle blue when selected. Show a 'Clear all' link when filters are active." code={`function FilterBar() {\n  const [active, setActive] = useState([]);\n  return (\n    <div className="space-y-2">\n      <div className="flex gap-2">\n        <input className="border rounded-lg px-3 py-1.5 text-xs" placeholder="Search..." />\n        <button className="border text-xs px-3 py-1.5 rounded-lg">Filters</button>\n        <button className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg">Add</button>\n      </div>\n      <div className="flex gap-1.5">\n        {['Active','Admin','Verified'].map(f => (\n          <button onClick={() => toggle(f)}\n            className={\`text-xs px-2.5 py-1 rounded-full border \${active.includes(f) ? 'bg-blue-600 text-white' : 'text-gray-600'}\`}>{f}</button>\n        ))}\n      </div>\n    </div>\n  );\n}`}><SearchFilters /></EffectCard>

      <EffectCard title="Command Palette" desc="⌘K quick search with keyboard shortcut" whenToUse="Power user navigation, quick commands, search." prompt="Create a command palette modal triggered by clicking a search bar with a ⌘K badge. Shows a filterable list of commands, closes on backdrop click." code={`function CommandPalette() {\n  const [open, setOpen] = useState(false);\n  const [q, setQ] = useState('');\n  const cmds = ['New Document','Switch Theme','Go to Dashboard','Invite User','Export Data'];\n  return (\n    <>\n      <button onClick={() => setOpen(true)} className="flex items-center gap-2 border rounded-lg px-3 py-2 text-sm text-gray-500">\n        Search commands...\n        <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">⌘K</span>\n      </button>\n      {open && (\n        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>\n          <div className="bg-white rounded-2xl shadow-2xl w-80 overflow-hidden" onClick={e => e.stopPropagation()}>\n            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search commands..." className="w-full px-4 py-3 text-sm border-b" />\n            <div className="py-1">{cmds.filter(c => c.toLowerCase().includes(q.toLowerCase())).map(c => <button key={c} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50">{c}</button>)}</div>\n          </div>\n        </div>\n      )}\n    </>\n  );\n}`}><CommandPalette /></EffectCard>

      <EffectCard title="Inline Edit" desc="Click text to edit in place" whenToUse="Quick updates, titles, descriptions." prompt="Create inline editable text. Shows as styled text normally. Clicking switches to an input. Blur or Enter saves. Uses a dashed border as an edit affordance." code={`function InlineEdit() {\n  const [editing, setEditing] = useState(false);\n  const [val, setVal] = useState('Click to edit');\n  return editing ? (\n    <input autoFocus value={val} onChange={e => setVal(e.target.value)}\n      onBlur={() => setEditing(false)}\n      onKeyDown={e => e.key === 'Enter' && setEditing(false)}\n      className="border-b-2 border-blue-500 outline-none text-sm font-semibold" />\n  ) : (\n    <span onClick={() => setEditing(true)}\n      className="cursor-text border-b-2 border-dashed border-gray-300 hover:border-blue-400">\n      {val}\n    </span>\n  );\n}`}><InlineEdit /></EffectCard>

      <EffectCard title="Stepper Progress" desc="Multi-step form progress indicator" whenToUse="Onboarding flows, checkout, wizards." prompt="Create a horizontal step indicator with circles connected by lines. Completed steps show ✓ in blue. Active step has a blue ring. Future steps are gray." code={`{[1,2,3,4].map((s, i) => (\n  <React.Fragment key={s}>\n    <div className={\`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black \${s < step ? 'bg-blue-600 text-white' : s === step ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-gray-200 text-gray-400'}\`}>\n      {s < step ? '✓' : s}\n    </div>\n    {i < 3 && <div className={\`flex-1 h-0.5 \${s < step ? 'bg-blue-600' : 'bg-gray-200'}\`} />}\n  </React.Fragment>\n))}`}><StepperProgress /></EffectCard>

      <EffectCard title="Status Indicator" desc="Live service health display" whenToUse="Service health dashboards, connection status, sync state." prompt="Create a status indicator list showing services with colored dots: green for online, yellow for warning, red for error. Each row has service name and status label." code={`{[['API Server','online'],['Database','online'],['CDN','warning']].map(([service, status]) => (\n  <div className="flex items-center justify-between border rounded-lg px-3 py-2">\n    <span className="text-xs font-semibold">{service}</span>\n    <div className="flex items-center gap-1.5">\n      <span className={\`w-2 h-2 rounded-full \${status === 'online' ? 'bg-green-500' : 'bg-yellow-500'}\`} />\n      <span className={\`text-[10px] font-bold \${status === 'online' ? 'text-green-600' : 'text-yellow-600'}\`}>{status}</span>\n    </div>\n  </div>\n))}`}><StatusIndicator /></EffectCard>

      <EffectCard title="Collapsible Section" desc="Expandable accordion content block" whenToUse="FAQ sections, settings groups, long forms." prompt="Create a collapsible section with a clickable header that shows a ▲/▼ arrow. Content reveals using maxHeight transition from 0 to 200px." code={`function Collapsible() {\n  const [open, setOpen] = useState(false);\n  return (\n    <div className="border rounded-xl overflow-hidden">\n      <button onClick={() => setOpen(o => !o)}\n        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 font-bold">\n        <span>Advanced Settings</span><span>{open ? '▲' : '▼'}</span>\n      </button>\n      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: open ? '200px' : '0' }}>\n        <div className="px-4 py-3 text-xs text-gray-600">Hidden content...</div>\n      </div>\n    </div>\n  );\n}`}><CollapsibleSection /></EffectCard>

      <EffectCard title="Permission Matrix" desc="Role/access grid display" whenToUse="Access control, role management, permissions settings." prompt="Create a permissions table with roles as rows (Admin, Editor, Viewer) and permissions as columns (Read, Write, Delete). Show ✓ in green for granted, — in gray for denied." code={`<table className="w-full text-xs">\n  <thead className="bg-gray-50"><tr><th>Role</th><th>Read</th><th>Write</th><th>Delete</th></tr></thead>\n  <tbody>\n    {[['Admin','✓','✓','✓'],['Editor','✓','✓','—'],['Viewer','✓','—','—']].map(([role,...perms]) => (\n      <tr key={role} className="border-t">\n        <td className="px-3 py-2 font-semibold">{role}</td>\n        {perms.map((p, i) => <td key={i} className={\`text-center font-bold \${p==='✓'?'text-green-500':'text-gray-300'}\`}>{p}</td>)}\n      </tr>\n    ))}\n  </tbody>\n</table>`}><PermissionMatrix /></EffectCard>
    </div>
  );
}