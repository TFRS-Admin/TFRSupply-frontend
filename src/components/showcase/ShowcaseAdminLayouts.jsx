import React from 'react';
import { BarChart3, TrendingUp, Users, Package, AlertTriangle, CheckCircle2 } from 'lucide-react';
import ShowcaseTile from './ShowcaseTile';

export default function ShowcaseAdminLayouts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

      <ShowcaseTile title="Stats Grid (4-up)" desc="Four KPI cards in a row — admin dashboard header." prompt="4-col stats grid gap-4, each card bg-[#080F18] border border-white/10 rounded-xl p-4, icon top-right text-gray-600, label text-[10px] text-gray-500 tracking-widest uppercase, value text-2xl font-black text-white, trend badge text-[11px] emerald or red">
        <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
          {[
            { label: 'Active SKUs', value: '7,412', Ic: Package, trend: '+142', up: true },
            { label: 'Families', value: '4', Ic: BarChart3, trend: 'Live', up: true },
            { label: 'Data Gaps', value: '9', Ic: AlertTriangle, trend: 'High', up: false },
            { label: 'Rules', value: '24', Ic: CheckCircle2, trend: 'Verified', up: true },
          ].map(({ label, value, Ic, trend, up }) => (
            <div key={label} className="bg-[#080F18] border border-white/10 rounded-xl p-3">
              <div className="flex items-start justify-between mb-1">
                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{label}</div>
                <Ic size={12} className="text-gray-600" />
              </div>
              <div className="text-lg font-black text-white">{value}</div>
              <div className={`text-[10px] font-bold mt-0.5 ${up ? 'text-emerald-400' : 'text-red-400'}`}>{trend}</div>
            </div>
          ))}
        </div>
      </ShowcaseTile>

      <ShowcaseTile title="Data Table Row" desc="Striped table rows for admin lists — SKUs, orders, rules." prompt="Admin table, white bg border border-gray-200 rounded-xl overflow-hidden, thead bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-500, tbody rows border-t border-gray-100 text-xs, status badge rounded-full px-2 py-0.5 font-bold">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden w-full max-w-sm text-xs">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['SKU','Family','Status'].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['NAV-48-KP','Navigator','Active'],
                ['PF-56-BW','Pathfinder','Draft'],
                ['DF-36-SP','DuraForce','Active'],
              ].map(([sku, fam, status]) => (
                <tr key={sku} className="border-t border-gray-100">
                  <td className="px-3 py-2 font-mono text-gray-700">{sku}</td>
                  <td className="px-3 py-2 text-gray-600">{fam}</td>
                  <td className="px-3 py-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ShowcaseTile>

      <ShowcaseTile title="Tabbed Panel" desc="Tab switcher for multi-section admin views." prompt="Tabbed panel, flex border-b border-white/10, tab buttons px-4 py-2 text-xs font-bold tracking-widest uppercase, active: text-blue-400 bg-blue-400/10 border-b-2 border-blue-400, inactive: text-gray-500 hover:text-gray-300, content panel below">
        <div className="w-full max-w-xs bg-[#080F18] border border-white/10 rounded-xl overflow-hidden">
          <div className="flex border-b border-white/10">
            {['Rules','Gaps','Deps'].map((t, i) => (
              <button key={t} className={`flex-1 py-2 text-[10px] font-bold tracking-widest uppercase ${i === 0 ? 'text-blue-400 bg-blue-400/10 border-b-2 border-blue-400' : 'text-gray-500'}`}>{t}</button>
            ))}
          </div>
          <div className="p-4 space-y-2">
            {['Nav vehicle mount rule','PIU console offset rule','Tahoe harness pass-thru'].map(r => (
              <div key={r} className="text-[11px] text-gray-400 flex items-center gap-2">
                <CheckCircle2 size={11} className="text-emerald-400 shrink-0" /> {r}
              </div>
            ))}
          </div>
        </div>
      </ShowcaseTile>

      <ShowcaseTile title="Severity Badge System" desc="Color-coded severity tags — for data gaps, alerts, rules." prompt="Severity badge, px-2 py-0.5 rounded text-[9px] font-bold uppercase: critical bg-red-900 text-red-300, high bg-orange-900 text-orange-300, medium bg-amber-900 text-amber-300, low bg-gray-700 text-gray-300">
        <div className="space-y-2 w-full max-w-xs">
          {[
            ['critical','Fitment data missing for 2024 Tahoe PPV'],
            ['high','OBD cable SKU unconfirmed'],
            ['medium','Pricing placeholder — not verified'],
            ['low','Image missing for DuraForce family'],
          ].map(([sev, msg]) => {
            const color = { critical:'bg-red-900 text-red-300', high:'bg-orange-900 text-orange-300', medium:'bg-amber-900 text-amber-300', low:'bg-gray-700 text-gray-300' }[sev];
            return (
              <div key={sev} className="bg-[#080F18] rounded-lg p-2.5 flex items-center gap-2">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${color}`}>{sev}</span>
                <span className="text-gray-400 text-[11px]">{msg}</span>
              </div>
            );
          })}
        </div>
      </ShowcaseTile>

    </div>
  );
}