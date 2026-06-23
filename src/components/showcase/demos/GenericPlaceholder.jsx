import React from 'react';
import { CATEGORIES } from '../showcaseData';

export default function GenericPlaceholder({ categoryId }) {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">🚧</div>
      <h2 className="text-xl font-black text-gray-900 mb-2">{cat?.label || 'Coming Soon'}</h2>
      <p className="text-gray-500 text-sm max-w-sm mx-auto">
        This category ({cat?.count} effects) is coming soon. Browse the categories above to find available demos.
      </p>
    </div>
  );
}