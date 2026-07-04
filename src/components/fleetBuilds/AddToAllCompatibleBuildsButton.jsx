import React from 'react';
import { Layers } from 'lucide-react';
import { useFleetBuilds } from '@/context/FleetBuildsContext';
import { toast } from '@/components/ui/use-toast';

const FS = { fontFamily: "'Roboto','Inter',sans-serif" };

/**
 * Summarizes an AddToAllCompatibleBuildsResult into a toast-ready
 * title/description, exported so the summary text is unit-testable without
 * rendering a toast.
 */
export function summarizeAddToAllResult(result) {
  if (!result || result.totalBuilds === 0) {
    return {
      title: 'No fleet builds yet',
      description: 'Start a fleet build from the Fleet Builds tab, then add products to it from here.',
    };
  }

  const addedCount = result.added.length;
  const skippedCount = result.skipped.length;
  const title = addedCount > 0
    ? `Added to ${addedCount} build${addedCount === 1 ? '' : 's'}`
    : 'Not added to any builds';

  if (skippedCount === 0) {
    return { title, description: 'Every fleet build was updated.' };
  }

  const reasons = result.skipped.slice(0, 3).map((entry) => `${entry.buildName}: ${entry.message}`).join(' — ');
  return {
    title,
    description: `Skipped ${skippedCount} build${skippedCount === 1 ? '' : 's'}. ${reasons}`,
  };
}

/**
 * "Add to all compatible builds" — adds a product to the matching upfit
 * category on every fleet build whose compatibility can be confirmed (see
 * addProductToAllCompatibleBuilds), then surfaces the added/skipped summary
 * as a toast. Renders nothing until at least one fleet build exists, so
 * customers who haven't opted into fleet mode see no change to ProductCard
 * or the product detail CTA row.
 */
export default function AddToAllCompatibleBuildsButton({ product, variant = 'icon', className = '' }) {
  const { builds, addToAllCompatibleBuilds } = useFleetBuilds();
  if (!product?.id || builds.length === 0) return null;

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const result = addToAllCompatibleBuilds(product);
    toast(summarizeAddToAllResult(result));
  }

  const title = 'Add to all compatible fleet builds';

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={title}
        title={title}
        className={className}
        style={{
          position: 'absolute', bottom: 8, right: 8, width: 30, height: 30, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none',
          background: 'rgba(255,255,255,0.92)', color: '#1a2744', cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)', zIndex: 2, padding: 0,
        }}
      >
        <Layers size={15} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={title}
      className={className}
      style={{
        ...FS, background: '#fff', color: '#1a2744', border: '2px solid #1a2744',
        fontSize: 13, fontWeight: 700, padding: '12px 16px', minHeight: 44,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        cursor: 'pointer', transition: 'background-color 0.15s, color 0.15s',
      }}
      onMouseEnter={(e) => Object.assign(e.currentTarget.style, { background: '#1a2744', color: '#fff' })}
      onMouseLeave={(e) => Object.assign(e.currentTarget.style, { background: '#fff', color: '#1a2744' })}
    >
      <Layers size={15} /> Add to All Compatible Builds
    </button>
  );
}
