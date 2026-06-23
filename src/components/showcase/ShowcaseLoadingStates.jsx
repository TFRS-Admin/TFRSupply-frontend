import React from 'react';
import { Loader2, AlertCircle, CheckCircle2, Package } from 'lucide-react';
import ShowcaseTile from './ShowcaseTile';

function Skeleton({ className }) {
  return <div className={`bg-gray-200 rounded animate-pulse ${className}`} />;
}

export default function ShowcaseLoadingStates() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

      <ShowcaseTile title="Skeleton Card" desc="Pulse placeholder while product data loads." prompt="Skeleton loader card, white bg border border-gray-200 rounded-xl, animate-pulse divs for image (h-24 bg-gray-200), title (h-3 w-3/4 bg-gray-200), subtitle (h-2 w-1/2 bg-gray-200), price (h-4 w-1/3 bg-gray-200)">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden w-40">
          <Skeleton className="h-24 w-full rounded-none" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-2 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </ShowcaseTile>

      <ShowcaseTile title="Spinner + Label" desc="Centered spinner with status text — full-page or section loads." prompt="Loading spinner center, Loader2 animate-spin text-[#003580] w-8 h-8, below text-sm text-gray-500 'Loading products...'">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="text-[#003580] animate-spin" />
          <span className="text-sm text-gray-500">Loading products…</span>
        </div>
      </ShowcaseTile>

      <ShowcaseTile title="App Splash Loader" desc="Full-screen dark spinner — used during initial auth/load." prompt="Full screen loader, bg-[#0D1B2A], center div with w-10 h-10 border-4 border-blue-900 border-t-blue-500 rounded-full animate-spin">
        <div className="w-full h-20 bg-[#0D1B2A] rounded-xl flex items-center justify-center">
          <div className="w-9 h-9 border-4 border-blue-900 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </ShowcaseTile>

      <ShowcaseTile title="Success State" desc="Confirmation after form submit or add-to-cart." prompt="Success state, CheckCircle2 text-emerald-500 size-10, title font-bold text-gray-900 'Order Submitted', body text-gray-500 text-sm, green bg-emerald-50 rounded-xl p-6 text-center">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center w-full max-w-xs">
          <CheckCircle2 size={28} className="text-emerald-500 mx-auto mb-2" />
          <div className="font-bold text-gray-900 text-sm mb-1">Quote Submitted!</div>
          <p className="text-gray-500 text-xs">Our team will respond within 1 business day.</p>
        </div>
      </ShowcaseTile>

      <ShowcaseTile title="Error State" desc="Inline error with retry option." prompt="Error state, AlertCircle text-red-500, bg-red-50 border border-red-200 rounded-xl p-5, title text-red-700 font-bold, body text-red-600 text-xs, Retry button border border-red-300 text-red-600">
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 w-full max-w-xs">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-red-700 text-xs mb-1">Could not load products</div>
              <p className="text-red-600 text-[11px] mb-2">Check your connection and try again.</p>
              <button className="text-[11px] font-bold border border-red-300 text-red-600 px-3 py-1 rounded hover:bg-red-100 transition-colors">Retry</button>
            </div>
          </div>
        </div>
      </ShowcaseTile>

    </div>
  );
}