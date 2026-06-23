import React, { useState } from 'react';
import { Play, Volume2, FileText, Download, ExternalLink } from 'lucide-react';
import ShowcaseTile from './ShowcaseTile';

export default function ShowcaseMediaSections() {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

      <ShowcaseTile title="Video Thumbnail Card" desc="Clickable video card with overlay play button — links to YouTube." prompt="Video card, relative rounded-xl overflow-hidden, bg image, dark overlay, centered Play button circle bg-white/20 hover:bg-white/40 border border-white/30, title bottom-left text-white font-bold">
        <div className="relative rounded-xl overflow-hidden w-full max-w-xs h-32 cursor-pointer group" onClick={() => setPlaying(p => !p)}>
          <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/20 group-hover:bg-white/40 border border-white/40 flex items-center justify-center transition-all">
              {playing ? <Volume2 size={16} className="text-white" /> : <Play size={16} className="text-white ml-0.5" />}
            </div>
          </div>
          <div className="absolute bottom-3 left-3 text-white text-xs font-bold">Navigator Series — Product Demo</div>
        </div>
      </ShowcaseTile>

      <ShowcaseTile title="Document Downloads" desc="PDF / spec sheet row list — links to file downloads." prompt="Document list, white bg border border-gray-200 rounded-xl divide-y divide-gray-100, each row flex items-center gap-3, FileText icon text-[#003580], label font-semibold text-gray-900 text-xs, file size text-gray-400 text-[10px] flex-1, Download icon button hover:text-[#003580]">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden w-full max-w-xs divide-y divide-gray-100">
          {[
            ['NAV-48 Spec Sheet', '1.2 MB', 'PDF'],
            ['Installation Guide', '3.4 MB', 'PDF'],
            ['Wiring Diagram', '890 KB', 'PDF'],
          ].map(([name, size, type]) => (
            <div key={name} className="flex items-center gap-3 px-4 py-3">
              <FileText size={14} className="text-[#003580] shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-[11px]">{name}</div>
                <div className="text-gray-400 text-[10px]">{type} · {size}</div>
              </div>
              <Download size={13} className="text-gray-400 hover:text-[#003580] cursor-pointer transition-colors" />
            </div>
          ))}
        </div>
      </ShowcaseTile>

      <ShowcaseTile title="Image Gallery Strip" desc="Scrollable thumbnail strip — product gallery navigation." prompt="Image gallery, flex gap-2 overflow-x-auto, each img w-16 h-16 rounded-lg object-cover border-2 border-transparent hover:border-[#003580] cursor-pointer, selected state border-[#003580]">
        <div className="flex gap-2 overflow-x-auto pb-1 w-full max-w-xs">
          {['photo-1544620347','photo-1568605117036','photo-1512316609839','photo-1558618666','photo-1609752716955'].map((id, i) => (
            <img
              key={id}
              src={`https://images.unsplash.com/${id}-c4fd4a3d5957?w=100&q=70`}
              alt=""
              className={`w-14 h-14 rounded-lg object-cover shrink-0 border-2 cursor-pointer transition-all ${i === 0 ? 'border-[#003580]' : 'border-transparent hover:border-gray-400'}`}
            />
          ))}
        </div>
      </ShowcaseTile>

    </div>
  );
}