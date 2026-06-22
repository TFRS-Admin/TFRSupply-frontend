import React from 'react';
import { Bug, X } from 'lucide-react';
import { useConfigurator } from '@/context/ConfiguratorContext';

export default function DebugToggle() {
  const { debugMode, setDebugMode } = useConfigurator();

  return (
    <button
      onClick={() => setDebugMode(d => !d)}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold tracking-wider shadow-2xl transition-all duration-200 ${
        debugMode
          ? 'bg-green-400 text-black'
          : 'bg-gray-800 text-green-400 border border-green-400/40 hover:bg-gray-700'
      }`}
    >
      {debugMode ? <X size={14} /> : <Bug size={14} />}
      {debugMode ? 'EXIT DEBUG' : 'DEBUG MODE'}
    </button>
  );
}