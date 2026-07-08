import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { NAV_VERTICALS } from '@/config/navigationVerticals';

interface NavVertical {
  id: string;
  label: string;
  path: string | null;
}

const VERTICAL_LINKS = (NAV_VERTICALS as NavVertical[]).filter((vertical) => !!vertical.path);

const QUICK_LINKS = [
  { label: 'My Workspace', path: '/workspace' },
  { label: 'Saved Products', path: '/saved-products' },
  { label: 'Cart', path: '/cart' },
];

export interface GlobalSearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (query: string) => void;
}

/**
 * Command-palette style global search, built on the harvested cmdk-based
 * Command primitive (ui/command.tsx) inside a Dialog — adapted from
 * prompt-showcase-by-team44's GlobalSearch pattern, restyled onto the
 * Federal Signal navy/red palette. Falls back to /search?q= for free-text
 * queries with no direct match.
 */
export default function GlobalSearchOverlay({ open, onOpenChange, onSubmit }: GlobalSearchOverlayProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function go(path: string) {
    navigate(path);
    onOpenChange(false);
    setQuery('');
  }

  function searchAll() {
    onSubmit(query.trim());
    setQuery('');
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setQuery('');
      }}
    >
      <DialogContent className="max-w-2xl gap-0 overflow-hidden border-white/10 bg-[#001c28] p-0 font-montserrat text-white shadow-2xl [&>button]:text-gray-400 [&>button]:hover:text-white">
        <Command className="bg-transparent text-white" shouldFilter>
          <div className="flex items-center border-b border-white/10 px-1" cmdk-input-wrapper="">
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search for products, or jump to a section..."
              className="h-14 border-none text-base text-white placeholder:text-gray-500 focus-visible:ring-0"
            />
          </div>
          <CommandList className="max-h-[400px] p-2">
            <CommandEmpty className="py-8 text-center text-sm text-gray-400">
              {query.trim() ? (
                <button
                  type="button"
                  onClick={searchAll}
                  className="text-sm text-gray-300 underline-offset-4 hover:text-white hover:underline"
                >
                  Search all products for &ldquo;{query.trim()}&rdquo;
                </button>
              ) : (
                'No results found.'
              )}
            </CommandEmpty>

            <CommandGroup
              heading="Shop By Vertical"
              className="text-gray-400 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-gray-500"
            >
              {VERTICAL_LINKS.map((vertical) => (
                <CommandItem
                  key={vertical.id}
                  value={vertical.label}
                  onSelect={() => go(vertical.path as string)}
                  className="text-gray-200 aria-selected:bg-[#e21938]/20 aria-selected:text-white"
                >
                  {vertical.label}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup
              heading="Quick Links"
              className="text-gray-400 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-gray-500"
            >
              {QUICK_LINKS.map((link) => (
                <CommandItem
                  key={link.path}
                  value={link.label}
                  onSelect={() => go(link.path)}
                  className="text-gray-200 aria-selected:bg-[#e21938]/20 aria-selected:text-white"
                >
                  {link.label}
                </CommandItem>
              ))}
            </CommandGroup>

            {query.trim() && (
              <CommandGroup
                heading="Search"
                className="text-gray-400 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-gray-500"
              >
                <CommandItem
                  value={`search-all-${query}`}
                  onSelect={searchAll}
                  className="text-gray-200 aria-selected:bg-[#e21938]/20 aria-selected:text-white"
                >
                  Search all products for &ldquo;{query.trim()}&rdquo;
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
