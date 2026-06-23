import React from "react";

export default function DynamicEffectPreview({ children }) {
  return (
    <div className="w-full min-h-[200px] flex items-center justify-center bg-slate-900/50 rounded-xl border border-slate-800 p-4">
      {children}
    </div>
  );
}