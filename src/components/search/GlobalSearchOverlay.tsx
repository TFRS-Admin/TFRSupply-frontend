import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NAV_VERTICALS } from '@/config/navigationVerticals';

interface QuickResult {
  label: string;
  description: string;
  path: string;
}

const QUICK_LINKS: QuickResult[] = NAV_VERTICALS
  .filter((vertical: { path: string | null }) => !!vertical.path)
  .map((vertical: { label: string; tagline: string; path: string }) => ({
    label: vertical.label,
    description: vertical.tagline,
    path: vertical.path,
  }));

export interface GlobalSearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (query: string) => void;
}

/**
 * Full-width search overlay triggered from the header's search icon.
 * Adapted from prompt-showcase-by-team44's GlobalSearch: live-filtered
 * quick results, Enter-to-navigate-first-result, and Escape/click-outside
 * to close — restyled onto the Federal Signal navy/red palette.
 */
export default function GlobalSearchOverlay({ open, onOpenChange, onSubmit }: GlobalSearchOverlayProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const filtered = useMemo<QuickResult[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return QUICK_LINKS.filter(
      (item) => item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      const id = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onOpenChange(false);
    }
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onOpenChange]);

  function goToResult(item: QuickResult) {
    navigate(item.path);
    onOpenChange(false);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (filtered.length > 0) {
      goToResult(filtered[0]);
      return;
    }
    onSubmit(query.trim());
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[#001c28]/97 font-montserrat backdrop-blur-sm"
        >
          <div ref={panelRef} className="mx-auto max-w-3xl px-6 pt-24">
            <form onSubmit={handleSubmit} className="flex items-center gap-4 border-b-2 border-white/20 focus-within:border-[#e21938]">
              <Search size={20} className="shrink-0 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products"
                aria-label="Search products"
                className="flex-1 bg-transparent py-3 text-2xl text-white placeholder:text-gray-500 outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="shrink-0 text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              )}
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Close search"
                className="shrink-0 rounded p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <X size={22} />
              </button>
            </form>

            <AnimatePresence>
              {filtered.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-2 overflow-hidden rounded-md border border-white/10 bg-[#00222e]"
                >
                  {filtered.map((item) => (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => goToResult(item)}
                      className="flex w-full items-center justify-between gap-4 border-b border-white/5 px-4 py-3 text-left last:border-0 hover:bg-white/5"
                    >
                      <span>
                        <span className="block text-sm font-semibold text-white">{item.label}</span>
                        <span className="block text-xs text-gray-400">{item.description}</span>
                      </span>
                      <ArrowRight size={16} className="shrink-0 text-[#e21938]" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <p className="mt-4 text-xs text-gray-500">Press Enter to search &bull; ESC to close</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
