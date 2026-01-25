import React, { use } from 'react';
import { Package, TrendingDown, TrendingUp, AlertCircle, Search, Download, Plus } from 'lucide-react';
import { useEffect } from 'react';

const Inventory = () => {
  const [inventoryData, setInventoryData] = React.useState([]);
  useEffect(() => {
    fetch("http://localhost:3000/api/inventory")
    .then((res)=>res.json())
    .then((response)=> {
      // console.log("Inventory Data:",data);
      if (response.status === 200) {
        setInventoryData(response.data);
      }
    })
    .catch((err)=>console.error("Inventory API Error:",err));
  }, []);

  return (
    <div className="animate-in fade-in duration-500">
      <header className="my-5 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Inventory Management</h1>
          <p className="text-sm text-zinc-500 mt-1">Monitor and optimize stock levels across warehouses</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm font-bold transition-all">
            <Download size={16} /> Export Report
          </button>
          <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Plus size={16} /> Add New SKU
          </button>
        </div>
      </header>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <InvStatCard icon={<Package />} label="Total SKUs" value={inventoryData.length} trend="+124" color="emerald" />
        <InvStatCard icon={<TrendingDown />} label="Low Stock Items" value={inventoryData.filter(item => item.status === "Low Stock").length} trend="+23" color="rose" />
        <InvStatCard icon={<TrendingUp />} label="Overstocked" value={inventoryData.filter(item => item.status === "In-Stock").length} trend="-12" color="emerald" />
        <InvStatCard icon={<AlertCircle />} label="Out of Stock" value={inventoryData.filter(item => item.status === "Out of Stock").length} trend="-8" color="rose" />
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4 bg-[#0F1219] p-4 rounded-xl border border-zinc-800 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by SKU, product name, or warehouse..." 
            className="w-full bg-[#0B0E14] border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>
        <select className="bg-[#0B0E14] border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-300 outline-none">
          <option>All Categories</option>
          <option>Hardware</option>
          <option>Fluids</option>
          <option>Electronics</option>
        </select>
        <select className="bg-[#0B0E14] border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-300 outline-none">
          <option>All Statuses</option>
          <option>Critical</option>
          <option>Low Stock</option>
          <option>Optimal</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#0F1219] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-white/[0.02]">
          <h3 className="text-white font-bold text-sm">Inventory Levels</h3>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">9 items shown</span>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] uppercase font-black text-zinc-500 tracking-wider border-b border-zinc-800 bg-[#161a23]">
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4">Product Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Warehouse</th>
              <th className="px-6 py-4">Current / Optimal</th>
              <th className="px-6 py-4">Stock Level</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {/* <InventoryRow sku="SKU-4821" name="Steel Fasteners M12" cat="Hardware" wh="Dallas DC" cur={45} opt={200} status="Critical" val="$2,340" />
            <InventoryRow sku="SKU-4820" name="Hydraulic Fluid 5L" cat="Fluids" wh="Miami Port" cur={12} opt={150} status="Critical" val="$960" />
            <InventoryRow sku="SKU-4819" name="Circuit Boards Type-A" cat="Electronics" wh="New York Hub" cur={78} opt={100} status="Low Stock" val="$15,600" />
            <InventoryRow sku="SKU-4818" name="Industrial Filters" cat="Parts" wh="Chicago Central" cur={450} opt={300} status="Optimal" val="$9,000" />
          </tbody> */}
            {inventoryData.map((item) => (
              <InventoryRow 
                key={item.product_id}
                sku={item.sku}
                name={item.name}
                cat={item.category}
                wh={item.warehouse_location}
                cur={item.current_stock}
                opt={item.reorder_level}
                status={item.status}
                val={`$${item.unit_price.toLocaleString()}`}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const InvStatCard = ({ icon, label, value, trend, color }) => (
  <div className="bg-[#0F1219] border border-zinc-800 p-5 rounded-xl group hover:border-zinc-700 transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold ${color === 'emerald' ? 'text-emerald-500' : 'text-rose-500'}`}>{trend}</span>
    </div>
    <p className="text-[11px] text-zinc-500 uppercase font-bold tracking-tight">{label}</p>
    <h3 className="text-2xl font-bold text-white mt-1 group-hover:text-emerald-400 transition-colors">{value}</h3>
  </div>
);

const InventoryRow = ({ sku, name, cat, wh, cur, opt, status, val }) => {
  const percent = Math.min((cur / opt) * 100, 100);
  const getStatusColor = (s) => {
    if (s === 'Out of Stock') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    if (s === 'Low Stock') return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  };

  return (
    <tr className="hover:bg-white/[0.02] transition-colors group">
      <td className="px-6 py-4 text-xs font-mono font-bold text-emerald-500/80">{sku}</td>
      <td className="px-6 py-4 text-xs font-bold text-white">{name}</td>
      <td className="px-6 py-4 text-[11px] text-zinc-500">{cat}</td>
      <td className="px-6 py-4 text-[11px] text-zinc-400 font-medium">{wh}</td>
      <td className="px-6 py-4 text-xs font-bold text-zinc-300">
        {cur} <span className="text-zinc-600 font-normal">/ {opt}</span>
      </td>
      <td className="px-6 py-4 min-w-[120px]">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-zinc-500 w-6">{Math.round(percent)}%</span>
          <div className="flex-1 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-700 ${percent < 25 ? 'bg-rose-500' : percent < 50 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(status)}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 text-right text-xs font-bold text-white">{val}</td>
    </tr>
  );
};

export default Inventory;