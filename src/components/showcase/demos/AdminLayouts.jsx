import React, { useState } from 'react';
import { EffectCard } from '../ShowcaseCategoryPage';

function StatsCards() {
  return (
    <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
      {[
        { label: 'Users', val: '12,847', trend: '+12%', up: true },
        { label: 'Revenue', val: '$48.2K', trend: '+8%', up: true },
        { label: 'Orders', val: '1,284', trend: '-3%', up: false },
        { label: 'Growth', val: '24.5%', trend: '+15%', up: true },
      ].map(s => (
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
  const rows = [{ name: 'Alice', status: 'Active' }, { name: 'Bob', status: 'Pending' }, { name: 'Charlie', status: 'Inactive' }];
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
              <td className="px-3 py-2">
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${r.status === 'Active' ? 'bg-green-100 text-green-700' : r.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{r.status}</span>
              </td>
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
  const items = ['Dashboard', 'Users', 'Analytics', 'Settings'];
  return (
    <div className="bg-gray-900 rounded-xl p-2 w-36 text-xs">
      {items.map(item => (
        <button key={item} onClick={() => setActive(item)} className={`w-full text-left px-3 py-2 rounded-lg mb-0.5 font-semibold transition-colors ${active === item ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>{item}</button>
      ))}
    </div>
  );
}

function ToastDemo() {
  const [toasts, setToasts] = useState([]);
  const show = (type) => {
    const id = Date.now();
    setToasts(t => [...t, { id, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };
  return (
    <div className="relative flex flex-col items-center gap-2">
      <div className="flex gap-2">
        <button onClick={() => show('success')} className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded">✓ Success</button>
        <button onClick={() => show('error')} className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded">✕ Error</button>
      </div>
      <div className="flex flex-col gap-1.5 w-56">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white shadow-lg ${t.type === 'success' ? 'bg-green-600' : 'bg-red-600'} animate-in`}>
            {t.type === 'success' ? '✓ Changes saved!' : '✕ Error occurred'}
          </div>
        ))}
      </div>
    </div>
  );
}

function ModalDemo() {
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

function EmptyState() {
  return (
    <div className="text-center py-6 px-4">
      <div className="text-4xl mb-3">📭</div>
      <h3 className="font-black text-gray-900 mb-1">No data found</h3>
      <p className="text-gray-500 text-xs mb-3">Get started by creating your first item</p>
      <button className="bg-blue-600 text-white font-bold px-5 py-2 rounded-lg text-xs">Create New</button>
    </div>
  );
}

function UserProfileCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 w-44 text-center shadow-sm">
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl mx-auto mb-2">👤</div>
      <div className="font-black text-gray-900 text-sm">John Doe</div>
      <div className="text-xs text-gray-500 mb-3">Administrator</div>
      <div className="grid grid-cols-3 gap-1 text-center border-t border-gray-100 pt-3">
        {[['128','Posts'],['1.2K','Following'],['4.5K','Followers']].map(([v,l]) => (
          <div key={l}><div className="font-black text-xs text-gray-900">{v}</div><div className="text-[9px] text-gray-500">{l}</div></div>
        ))}
      </div>
    </div>
  );
}

function ProgressBars() {
  return (
    <div className="w-full max-w-xs space-y-3">
      {[['Task 1', 75, 'bg-blue-500'], ['Task 2', 45, 'bg-green-500'], ['Task 3', 90, 'bg-purple-500']].map(([label, pct, color]) => (
        <div key={label}>
          <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1"><span>{label}</span><span>{pct}%</span></div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SearchFilters() {
  const [filters, setFilters] = useState([]);
  const opts = ['Active', 'Admin', 'Verified'];
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

function InlineEdit() {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState('Click to edit');
  return editing ? (
    <input autoFocus value={val} onChange={e => setVal(e.target.value)} onBlur={() => setEditing(false)} onKeyDown={e => e.key === 'Enter' && setEditing(false)}
      className="border-b-2 border-blue-500 outline-none text-sm font-semibold px-1 py-0.5 text-gray-900 w-40" />
  ) : (
    <span onClick={() => setEditing(true)} className="text-sm font-semibold text-gray-700 cursor-text border-b-2 border-dashed border-gray-300 pb-0.5 hover:border-blue-400">{val}</span>
  );
}

export default function AdminLayouts() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <EffectCard title="Stats Cards" desc="KPI metrics with trends" whenToUse="Dashboard overviews, analytics summaries, performance metrics." prompt="Create 4 KPI stat cards in a 2x2 grid: each has a label, large number (font-black), and colored trend badge (+12%, -3%)." code={`<div className="grid grid-cols-2 gap-2">\n  {stats.map(s => (\n    <div className="bg-white border rounded-xl p-3 shadow-sm">\n      <div className="text-xs text-gray-500">{s.label}</div>\n      <div className="text-lg font-black">{s.val}</div>\n      <div className={\`text-xs font-bold \${s.up ? 'text-green-500' : 'text-red-500'}\`}>{s.trend}</div>\n    </div>\n  ))}\n</div>`}><StatsCards /></EffectCard>

      <EffectCard title="Data Table" desc="Sortable rows with status badges" whenToUse="User lists, order management, inventory, logs." prompt="Create a sortable data table with name, status badge (color-coded), and edit actions. Table has a gray header and hover rows." code={`<table className="w-full text-xs">\n  <thead className="bg-gray-50">\n    <tr><th onClick={() => setSort(s => s==='asc'?'desc':'asc')}>Name {sort}</th>\n    <th>Status</th><th>Actions</th></tr>\n  </thead>\n  <tbody>{rows.map(r => (\n    <tr className="border-t hover:bg-gray-50">\n      <td>{r.name}</td>\n      <td><span className={statusColor}>{r.status}</span></td>\n      <td><button>Edit</button></td>\n    </tr>\n  ))}</tbody>\n</table>`}><DataTable /></EffectCard>

      <EffectCard title="Admin Sidebar" desc="Collapsible dark navigation menu" whenToUse="Admin panels, dashboards, settings pages." prompt="Create a dark sidebar navigation with a list of items where the active item is highlighted in blue." code={`function AdminSidebar() {\n  const [active, setActive] = useState('Dashboard');\n  return (\n    <div className="bg-gray-900 rounded-xl p-2">\n      {['Dashboard','Users','Analytics','Settings'].map(item => (\n        <button key={item} onClick={() => setActive(item)}\n          className={\`w-full text-left px-3 py-2 rounded-lg font-semibold \${active === item ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}\`}>\n          {item}\n        </button>\n      ))}\n    </div>\n  );\n}`}><AdminSidebar /></EffectCard>

      <EffectCard title="Notification Toast" desc="Pop-up notifications for feedback" whenToUse="Success messages, errors, alerts." prompt="Create toast notifications that appear from the bottom with success or error styling and auto-dismiss after 3 seconds." code={`function Toast({ type }) {\n  return (\n    <div className={\`px-4 py-3 rounded-lg text-white text-sm font-semibold shadow-lg \${type === 'success' ? 'bg-green-600' : 'bg-red-600'}\`}>\n      {type === 'success' ? '✓ Saved!' : '✕ Error'}\n    </div>\n  );\n}`}><ToastDemo /></EffectCard>

      <EffectCard title="Modal Dialog" desc="Confirmation and form dialogs" whenToUse="Delete confirmations, forms, alerts." prompt="Create a modal dialog with a dark overlay backdrop. Clicking outside closes it. Contains a title, body text, and Cancel/Delete action buttons." code={`function Modal({ onClose }) {\n  return (\n    <div className="fixed inset-0 flex items-center justify-center bg-black/50"\n      onClick={onClose}>\n      <div className="bg-white rounded-2xl p-6 shadow-2xl w-72"\n        onClick={e => e.stopPropagation()}>\n        <h3 className="font-black text-gray-900 mb-2">Confirm Action</h3>\n        <p className="text-gray-500 text-sm mb-4">Are you sure?</p>\n        <div className="flex gap-3">\n          <button onClick={onClose}>Cancel</button>\n          <button onClick={onClose}>Delete</button>\n        </div>\n      </div>\n    </div>\n  );\n}`}><ModalDemo /></EffectCard>

      <EffectCard title="Empty State" desc="No data placeholder with CTA" whenToUse="Empty tables, no search results, first-time users." prompt="Create an empty state component with a large emoji icon, bold title 'No data found', subtitle, and a primary CTA button." code={`function EmptyState() {\n  return (\n    <div className="text-center py-8">\n      <div className="text-4xl mb-3">📭</div>\n      <h3 className="font-black text-gray-900 mb-1">No data found</h3>\n      <p className="text-gray-500 text-xs mb-3">Get started by creating your first item</p>\n      <button className="bg-blue-600 text-white font-bold px-5 py-2 rounded-lg text-xs">\n        Create New\n      </button>\n    </div>\n  );\n}`}><EmptyState /></EffectCard>

      <EffectCard title="User Profile Card" desc="User info with stats summary" whenToUse="User details, profiles, account views." prompt="Create a user profile card with a round avatar, name, role label, and 3 stats (Posts, Following, Followers) in a horizontal row separated by a border." code={`<div className="bg-white border rounded-xl p-5 text-center">\n  <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">👤</div>\n  <div className="font-black">John Doe</div>\n  <div className="text-gray-500 text-xs mb-3">Administrator</div>\n  <div className="grid grid-cols-3 border-t pt-3">\n    {[['128','Posts'],['1.2K','Following'],['4.5K','Followers']].map(([v,l]) => (\n      <div><div className="font-black text-xs">{v}</div><div className="text-[9px]">{l}</div></div>\n    ))}\n  </div>\n</div>`}><UserProfileCard /></EffectCard>

      <EffectCard title="Progress Bars" desc="Task and upload progress indicators" whenToUse="File uploads, task completion, loading states." prompt="Create animated progress bars with label on the left and percentage on the right. Each bar fills with a different color (blue, green, purple)." code={`{tasks.map(t => (\n  <div key={t.label}>\n    <div className="flex justify-between text-xs font-semibold mb-1">\n      <span>{t.label}</span><span>{t.pct}%</span>\n    </div>\n    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">\n      <div className={\`h-full \${t.color} rounded-full\`} style={{ width: \`\${t.pct}%\` }} />\n    </div>\n  </div>\n))}`}><ProgressBars /></EffectCard>

      <EffectCard title="Search with Filters" desc="Combined search bar and toggle filter chips" whenToUse="Data tables, user lists, logs." prompt="Create a search bar with an Add button, and below it filter chips (Active, Admin, Verified) that toggle on/off. Active filters show in blue." code={`function FilterBar() {\n  const [active, setActive] = useState([]);\n  return (\n    <div className="space-y-2">\n      <div className="flex gap-2">\n        <input className="border rounded-lg px-3 py-1.5 text-xs" placeholder="Search..." />\n        <button className="border text-xs px-3 py-1.5 rounded-lg">Filters</button>\n      </div>\n      <div className="flex gap-1.5">\n        {['Active','Admin','Verified'].map(f => (\n          <button onClick={() => toggle(f)}\n            className={\`text-xs px-2.5 py-1 rounded-full border \${active.includes(f) ? 'bg-blue-600 text-white' : 'text-gray-600'}\`}>\n            {f}\n          </button>\n        ))}\n      </div>\n    </div>\n  );\n}`}><SearchFilters /></EffectCard>

      <EffectCard title="Inline Edit" desc="Click to edit text in place" whenToUse="Quick updates, titles, descriptions." prompt="Create an inline editable text that shows as styled text normally, but clicking it switches to an input field. Pressing Enter or blurring saves the value." code={`function InlineEdit() {\n  const [editing, setEditing] = useState(false);\n  const [val, setVal] = useState('Click to edit');\n  return editing ? (\n    <input autoFocus value={val} onChange={e => setVal(e.target.value)}\n      onBlur={() => setEditing(false)}\n      onKeyDown={e => e.key === 'Enter' && setEditing(false)}\n      className="border-b-2 border-blue-500 outline-none text-sm" />\n  ) : (\n    <span onClick={() => setEditing(true)}\n      className="cursor-text border-b-2 border-dashed border-gray-300 hover:border-blue-400">\n      {val}\n    </span>\n  );\n}`}><InlineEdit /></EffectCard>
    </div>
  );
}