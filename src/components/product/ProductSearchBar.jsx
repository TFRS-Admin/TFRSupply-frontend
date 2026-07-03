import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

/**
 * Controlled search input for product discovery. Purely presentational —
 * callers own debouncing/navigation via onSearch.
 */
export default function ProductSearchBar({ value = '', onSearch, placeholder = 'Search products...' }) {
  const [query, setQuery] = useState(value);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  function submit(e) {
    e.preventDefault();
    onSearch(query.trim());
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', alignItems: 'stretch', border: '1.5px solid #d0d0d0', borderRadius: 2, overflow: 'hidden' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
        style={{ flex: 1, padding: '10px 16px', fontSize: 14, color: '#333', border: 'none', outline: 'none', fontFamily: "'Roboto','Inter',sans-serif" }}
      />
      <button
        type="submit"
        aria-label="Search"
        style={{ background: '#c8102e', border: 'none', padding: '0 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#a50d25'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#c8102e'; }}
      >
        <Search size={17} color="#fff" />
      </button>
    </form>
  );
}
