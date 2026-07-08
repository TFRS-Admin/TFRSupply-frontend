import React, { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

export interface GlobalSearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (query: string) => void;
}

export default function GlobalSearchOverlay({ open, onOpenChange, onSubmit }: GlobalSearchOverlayProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit(query.trim());
    setQuery('');
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#001c28]/95">
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl items-center gap-4 px-6 pt-24">
        <Search size={20} className="shrink-0 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for products"
          aria-label="Search products"
          className="flex-1 border-b-2 border-white/20 bg-transparent py-3 text-2xl text-white placeholder:text-gray-500 outline-none focus:border-[#e21938]"
        />
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close search"
          className="shrink-0 text-gray-400 hover:text-white"
        >
          <X size={22} />
        </button>
      </form>
    </div>
  );
}
