import React from "react";
import { Monitor, Tablet, Smartphone } from "lucide-react";

export default function ResponsivePreview({ children }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2 justify-center text-xs text-slate-500">
        <span className="flex items-center gap-1"><Monitor className="w-3 h-3" /> Desktop</span>
        <span className="flex items-center gap-1"><Tablet className="w-3 h-3" /> Tablet</span>
        <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> Mobile</span>
      </div>
      <div className="border border-slate-700 rounded-lg overflow-hidden">
        {children}
      </div>
    </div>
  );
}