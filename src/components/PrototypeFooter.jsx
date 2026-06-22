import React from 'react';
import { Link } from 'react-router-dom';
import { Bug, Shield } from 'lucide-react';

export default function PrototypeFooter() {
  return (
    <footer className="border-t border-white/[0.06] mt-20 px-6 py-8">
      <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 text-gray-700 text-xs">
          <Shield size={12} />
          <span>TFR Supply Configurator — Prototype Only — Sample Data</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Link to="/admin/debug" className="flex items-center gap-1.5 text-green-600 hover:text-green-400 transition-colors font-mono">
            <Bug size={11} /> Admin / Debug Summary
          </Link>
          <span className="text-gray-800">|</span>
          <span className="text-gray-700">v0.1 Prototype</span>
        </div>
      </div>
    </footer>
  );
}