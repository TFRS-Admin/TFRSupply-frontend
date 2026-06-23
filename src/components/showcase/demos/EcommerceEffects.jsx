import React, { useState } from 'react';
import { EffectCard } from '../ShowcaseCategoryPage';

function ProductCard() {
  const [added, setAdded] = useState(false);
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden w-40 shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-24 bg-gray-100">
        <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80" alt="Product" className="w-full h-full object-cover" />
        <span className="absolute top-2 left-2 text-[9px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded-full">SALE</span>
      </div>
      <div className="p-3">
        <div className="text-xs font-bold text-gray-900 mb-0.5">Premium Watch</div>
        <div className="flex items-center gap-1 text-[10px] mb-2">
          <span className="text-yellow-400">★★★★★</span><span className="text-gray-400">(128)</span>
        </div>
        <div className="flex items-center justify-between">
          <div><div className="text-xs font-black text-blue-600">$89</div><div className="text-[9px] text-gray-400 line-through">$129</div></div>
          <button onClick={() => { setAdded(true); setTimeout(() => setAdded(false), 2000); }}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${added ? 'bg-green-500' : 'bg-blue-600'} text-white`}>
            {added ? '✓' : '+'}
          </button>
        </div>
      </div>
    </div>
  );
}

function WishlistBtn() {
  const [saved, setSaved] = useState(false);
  return (
    <button onClick={() => setSaved(s => !s)} className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-full text-xs font-semibold hover:border-red-300 transition-colors">
      <span className={`text-lg transition-all ${saved ? 'scale-110' : ''}`}>{saved ? '❤️' : '🤍'}</span>
      <span className={saved ? 'text-red-500 font-bold' : 'text-gray-600'}>{saved ? 'Saved' : 'Save'}</span>
    </button>
  );
}

function StarRating() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {[1,2,3,4,5].map(s => (
          <button key={s} onClick={() => setRating(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
            className={`text-2xl transition-transform ${(hover || rating) >= s ? 'text-yellow-400 scale-110' : 'text-gray-300'}`}>★</button>
        ))}
      </div>
      {rating > 0 && <div className="text-xs text-gray-500 font-semibold">{['','Poor','Fair','Good','Great','Excellent'][rating]}</div>}
    </div>
  );
}

function FilterChips() {
  const [selected, setSelected] = useState(['Under $100']);
  const chips = ['Under $50','Under $100','Brand A','Brand B','In Stock','On Sale'];
  return (
    <div className="flex flex-wrap gap-1.5 max-w-xs">
      {chips.map(c => (
        <button key={c} onClick={() => setSelected(s => s.includes(c) ? s.filter(x => x !== c) : [...s, c])}
          className={`text-[11px] font-semibold px-3 py-1 rounded-full border transition-colors ${selected.includes(c) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
          {c}
        </button>
      ))}
    </div>
  );
}

function CartItem() {
  const [qty, setQty] = useState(1);
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3 w-64">
      <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&q=80" alt="" className="w-12 h-12 object-cover rounded-lg" />
      <div className="flex-1">
        <div className="font-bold text-gray-900 text-xs">Premium Watch</div>
        <div className="text-[10px] text-gray-400">Black / One size</div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg">
            <button onClick={() => setQty(q => Math.max(1,q-1))} className="w-6 h-6 text-gray-500 font-bold text-sm flex items-center justify-center">-</button>
            <span className="text-xs font-bold w-5 text-center">{qty}</span>
            <button onClick={() => setQty(q => q+1)} className="w-6 h-6 text-gray-500 font-bold text-sm flex items-center justify-center">+</button>
          </div>
          <div className="font-black text-blue-600 text-sm">${89*qty}</div>
        </div>
      </div>
    </div>
  );
}

export default function EcommerceEffects() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <EffectCard title="Product Card" desc="E-commerce tile with image, rating, and add to cart" whenToUse="Product grids, search results, recommendations." prompt="Create a product card with an image, SALE badge, title, star rating, original/discounted price, and an animated add-to-cart button that turns green with a checkmark when clicked." code={`function ProductCard() {\n  const [added, setAdded] = useState(false);\n  return (\n    <div className="bg-white border rounded-xl overflow-hidden">\n      <div className="relative h-24 bg-gray-100">\n        <img src={url} className="w-full h-full object-cover" />\n        <span className="absolute top-2 left-2 text-[9px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded-full">SALE</span>\n      </div>\n      <div className="p-3">\n        <div className="font-bold text-xs">Premium Watch</div>\n        <div className="flex items-center gap-1 text-[10px] my-2">\n          <span className="text-yellow-400">★★★★★</span><span>(128)</span>\n        </div>\n        <div className="flex justify-between items-center">\n          <div><div className="font-black text-blue-600">$89</div><div className="line-through text-[9px]">$129</div></div>\n          <button onClick={() => { setAdded(true); setTimeout(()=>setAdded(false),2000); }}\n            className={\`w-7 h-7 rounded-full \${added?'bg-green-500':'bg-blue-600'} text-white\`}>\n            {added ? '✓' : '+'}\n          </button>\n        </div>\n      </div>\n    </div>\n  );\n}`}><ProductCard /></EffectCard>

      <EffectCard title="Wishlist Button" desc="Save/heart toggle animation" whenToUse="Product pages, catalog, saved items." prompt="Create a wishlist toggle button with a heart emoji that grows on click. When saved it shows '❤️ Saved' in red, when not saved it shows '🤍 Save' in gray." code={`function WishlistBtn() {\n  const [saved, setSaved] = useState(false);\n  return (\n    <button onClick={() => setSaved(s => !s)}\n      className="flex items-center gap-2 border px-4 py-2 rounded-full">\n      <span className={\`text-lg \${saved ? 'scale-110' : ''} transition-all\`}>{saved ? '❤️' : '🤍'}</span>\n      <span className={saved ? 'text-red-500 font-bold' : 'text-gray-600'}>{saved ? 'Saved' : 'Save'}</span>\n    </button>\n  );\n}`}><WishlistBtn /></EffectCard>

      <EffectCard title="Star Rating" desc="Interactive 5-star rating with labels" whenToUse="Product reviews, feedback forms, ratings." prompt="Create an interactive star rating where hovering over stars highlights them and clicking locks the rating. Show a text label (Poor/Fair/Good/Great/Excellent) based on the selected rating." code={`function StarRating() {\n  const [rating, setRating] = useState(0);\n  const [hover, setHover] = useState(0);\n  return (\n    <div className="flex flex-col items-center gap-2">\n      <div className="flex gap-1">\n        {[1,2,3,4,5].map(s => (\n          <button key={s} onClick={() => setRating(s)}\n            onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}\n            className={\`text-2xl \${(hover||rating)>=s ? 'text-yellow-400' : 'text-gray-300'}\`}>★</button>\n        ))}\n      </div>\n      {rating>0 && <div className="text-xs text-gray-500">{labels[rating]}</div>}\n    </div>\n  );\n}`}><StarRating /></EffectCard>

      <EffectCard title="Filter Chips" desc="Toggle filter pills for product browsing" whenToUse="Category pages, search results, product filtering." prompt="Create toggleable filter chips. Each chip toggles on/off. Active chips are blue, inactive are white with gray border. Show selected state with blue-600 background." code={`const [selected, setSelected] = useState([]);\nconst chips = ['Under $50','Under $100','Brand A','In Stock','On Sale'];\n<div className="flex flex-wrap gap-1.5">\n  {chips.map(c => (\n    <button onClick={() => toggle(c)}\n      className={\`text-xs font-semibold px-3 py-1 rounded-full border \${selected.includes(c) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'}\`}>\n      {c}\n    </button>\n  ))}\n</div>`}><FilterChips /></EffectCard>

      <EffectCard title="Cart Item" desc="Quantity control with total price" whenToUse="Shopping carts, order summaries." prompt="Create a cart item row with product image, name, variant, a +/- quantity control, and a dynamic price that updates based on quantity. Use font-black text-blue-600 for the price." code={`function CartItem() {\n  const [qty, setQty] = useState(1);\n  return (\n    <div className="flex items-center gap-3 border rounded-xl p-3">\n      <img src={img} className="w-12 h-12 object-cover rounded-lg" />\n      <div className="flex-1">\n        <div className="font-bold text-xs">Premium Watch</div>\n        <div className="flex items-center justify-between mt-1">\n          <div className="flex border rounded-lg">\n            <button onClick={() => setQty(q => Math.max(1,q-1))}>-</button>\n            <span>{qty}</span>\n            <button onClick={() => setQty(q => q+1)}>+</button>\n          </div>\n          <div className="font-black text-blue-600">&#36;{89*qty}</div>\n        </div>\n      </div>\n    </div>\n  );\n}`}><CartItem /></EffectCard>
    </div>
  );
}