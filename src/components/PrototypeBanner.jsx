import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function PrototypeBanner() {
  return (
    <div className="bg-amber-500 text-black text-xs font-bold tracking-widest text-center py-1.5 px-4 flex items-center justify-center gap-2">
      <AlertTriangle size={12} />
      PROTOTYPE — SAMPLE DATA ONLY — NOT FOR PRODUCTION USE
      <AlertTriangle size={12} />
    </div>
  );
}