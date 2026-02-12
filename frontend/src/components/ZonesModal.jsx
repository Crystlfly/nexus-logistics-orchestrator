import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';

// --- 1. SHARED ZONE CARD COMPONENT (Exported for use in Zones.jsx) ---
export const ZoneCard = ({ name, location, items, capacity, temp, occupancy, type, alert }) => (
  <div className={`p-4 rounded-xl border ${alert ? 'border-rose-500/30 bg-rose-500/5' : 'border-zinc-800 bg-[#0F1219]'} transition-all hover:border-zinc-700`}>
    <div className="flex justify-between items-start mb-4">
      <div>
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-black text-white uppercase">{name}</h4>
          <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tighter
            ${type === 'Inbound' ? 'bg-emerald-500/10 text-emerald-500' : 
              type === 'Outbound' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
            {type}
          </span>
        </div>
        <p className="text-[10px] text-zinc-600 font-bold mt-0.5">{location}</p>
      </div>
      <div className="text-right">
        <p className="text-xs font-black text-white">{temp}°C</p>
        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Temp</p>
      </div>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <p className="text-[10px] text-zinc-400 font-bold">{items} items</p>
        <p className="text-[10px] text-zinc-500 font-bold">{occupancy}% occupied</p>
      </div>
      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
        <div className={`h-full transition-all duration-1000 ${alert ? 'bg-rose-500' : 'bg-orange-500'}`} style={{ width: `${occupancy}%` }} />
      </div>
      <div className="flex justify-between text-[8px] text-zinc-600 font-black uppercase">
        <span>{items.toLocaleString()} sq ft used</span>
        <span>{capacity.toLocaleString()} sq ft total</span>
      </div>
    </div>
  </div>
);

// --- 2. MAIN MODAL COMPONENT ---
const ZonesModal = ({ data, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");

  // Internal filtering for the modal view
  const filteredData = useMemo(() => {
    return data.filter(zone => {
      const matchesSearch = zone.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            zone.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "All Types" || zone.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [data, searchQuery, typeFilter]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0F1219] border border-zinc-800 w-full max-w-5xl h-[80vh] rounded-2xl flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-white">All Warehouse Zones</h2>
            <p className="text-sm text-zinc-500">Real-time status of {filteredData.length} zones</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 m-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, name, or type..." 
                className="w-full bg-[#0F1219] border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:border-emerald-500/50 outline-none text-white" 
              />
            </div>
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)} 
              className="bg-[#0F1219] border border-zinc-800 rounded-lg px-4 text-sm outline-none text-zinc-400"
            >
              <option>All Types</option>
              <option>Inbound</option>
              <option>Outbound</option>
              <option>Storage</option>
              <option>Picking</option>
            </select>
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredData.map((zone, idx) => (
              <ZoneCard key={idx} {...zone} />
            ))}
            {filteredData.length === 0 && (
                <div className="col-span-full text-center py-10 text-zinc-500">
                    No zones found matching your filters.
                </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-white text-black font-bold text-sm rounded-lg hover:bg-zinc-200">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZonesModal;