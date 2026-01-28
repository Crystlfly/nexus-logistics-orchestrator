import React, { useEffect, useMemo, useState } from 'react';
import { 
  Home, Activity, Users, DollarSign, Clock, 
  Search, Download, Plus, MapPin, 
  Anchor, Truck, Package, Loader2, X, Filter
} from 'lucide-react';

const WarehouseManagement = () => {
  const [warehouseData, setWarehouseData] = useState([]);
  const [zoneData, setZoneData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 🆕 STATE FOR MODAL
  const [showAllZones, setShowAllZones] = useState(false);

  // ✅ 1. Safe Fetch for Warehouses
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/warehouses");
        if (!response.ok) throw new Error('Failed to fetch data');
        const json = await response.json();
        const rawData = json.data || json;

        const mappedData = rawData.map(row => ({
          id: `WH-${row.warehouse_id}`,
          name: row.location_name,            
          location: row.city || row.location_name, 
          type: row.warehouse_type,           
          cost: Number(row.operating_cost_per_day), 
          staff: Number(row.total_staff),
          totalCap: Number(row.total_capacity_sqft),
          usedCap: Number(row.used_capacity_sqft),
          status: row.status
        }));
        setWarehouseData(mappedData);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ 2. Safe Fetch for Zones
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/zones");
        if (!response.ok) throw new Error('Failed to fetch zone data');
        const json = await response.json();
        const rawData = json.data || json;
        
        const mappedData = rawData.map(row => ({
          name: row.zone_name,                          
          location: `${row.warehouse_name} • Zone ${row.zone_id}`,
          items: row.current_occupancy,
          capacity: row.capacity_limit,
          temp: row.temperature,
          occupancy: Math.round((row.current_occupancy / row.capacity_limit) * 100),
          type: row.zone_type,
          alert: (row.current_occupancy / row.capacity_limit) > 0.9
        }));
        setZoneData(mappedData);
      } catch (err) {
        console.error("Fetch Zones Error:", err);
      }
    };
    fetchZones();
  }, []);

  // ✅ 3. Dashboard Logic: Sort & Limit to Top 6
  const dashboardZones = useMemo(() => {
    return [...zoneData]
      .sort((a, b) => {
        if (a.alert && !b.alert) return -1;
        if (!a.alert && b.alert) return 1;
        return b.occupancy - a.occupancy;
      })
      .slice(0, 6); // ✂️ Only show top 6 on dashboard
  }, [zoneData]);

  // ✅ 4. Derived Metrics
  const metrics = useMemo(() => {
    if (!warehouseData.length) return { cost: 0, staff: 0, totalCap: 0, usedCap: 0, util: 0, active: 0 };
    const cost = warehouseData.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
    const staff = warehouseData.reduce((acc, curr) => acc + (Number(curr.staff) || 0), 0);
    const totalCap = warehouseData.reduce((acc, curr) => acc + (Number(curr.totalCap) || 0), 0);
    const usedCap = warehouseData.reduce((acc, curr) => acc + (Number(curr.usedCap) || 0), 0);
    const active = warehouseData.filter(w => w.status === 'Active').length;
    const util = totalCap > 0 ? ((usedCap / totalCap) * 100).toFixed(1) : 0;
    return { cost, staff, totalCap, usedCap, util, active };
  }, [warehouseData]);

  if (isLoading) return <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center text-zinc-500"><Loader2 className="animate-spin mr-2" /> Loading...</div>;
  if (error) return <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center text-rose-500">Error: {error}</div>;

  return (
    <div className="p-6 bg-[#0B0E14] min-h-screen text-zinc-300 font-sans relative">
      
      {/* 🆕 MODAL: Only renders when showAllZones is true */}
      {showAllZones && (
        <ZonesModal 
          data={zoneData} 
          onClose={() => setShowAllZones(false)} 
        />
      )}

      {/* Header */}
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Warehouse Management</h1>
          <p className="text-sm text-zinc-500 mt-1">Real-time facility operations & cost analysis</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-800 transition-all">
            <Download size={16} /> Export CSV
          </button>
          <button className="flex items-center gap-2 bg-emerald-500 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-400 transition-all">
            <Plus size={16} /> Add Facility
          </button>
        </div>
      </header>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard icon={<Home />} label="Total Warehouses" value={warehouseData.length} sub={`${metrics.active} Active`} color="emerald" />
        <MetricCard icon={<Activity />} label="Global Utilization" value={`${metrics.util}%`} sub={`${(metrics.usedCap/1000).toFixed(1)}k / ${(metrics.totalCap/1000).toFixed(1)}k sqft`} color="blue" />
        <MetricCard icon={<Users />} label="Total Staff" value={metrics.staff} sub="Across all sites" color="purple" />
        <MetricCard icon={<DollarSign />} label="Daily Ops Cost" value={`$${metrics.cost.toLocaleString()}`} sub="Total daily burn rate" color="orange" />
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input type="text" placeholder="Search by ID, name, or type..." className="w-full bg-[#0F1219] border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:border-emerald-500/50 outline-none text-white" />
        </div>
        <select className="bg-[#0F1219] border border-zinc-800 rounded-lg px-4 text-sm outline-none text-zinc-400">
          <option>All Types</option>
          <option>Distribution</option>
          <option>Port</option>
        </select>
      </div>

      {/* Main Table */}
      <div className="bg-[#0F1219] border border-zinc-800 rounded-xl overflow-hidden shadow-xl mb-6">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.02] border-b border-zinc-800 text-zinc-500">
            <tr>
              <th className="p-4 font-bold uppercase text-[10px] tracking-wider">Warehouse Info</th>
              <th className="p-4 font-bold uppercase text-[10px] tracking-wider">Type</th>
              <th className="p-4 font-bold uppercase text-[10px] tracking-wider">Staffing</th>
              <th className="p-4 font-bold uppercase text-[10px] tracking-wider w-1/4">Capacity (Sq Ft)</th>
              <th className="p-4 font-bold uppercase text-[10px] tracking-wider text-right">Daily Cost</th>
              <th className="p-4 font-bold uppercase text-[10px] tracking-wider text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {warehouseData.map((wh) => (
              <WarehouseRow key={wh.id} data={wh} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Critical Zones (Top 6) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Critical Zones Overview</h3>
            
            {/* 🆕 BUTTON TRIGGERS MODAL */}
            <button 
              onClick={() => setShowAllZones(true)}
              className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-tighter"
            >
              View All Zones ({zoneData.length})
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboardZones.map((zone, idx) => (
              <ZoneCard key={idx} {...zone} />
            ))}
            {dashboardZones.length === 0 && (
              <div className="col-span-2 p-8 text-center text-zinc-500 text-sm border border-dashed border-zinc-800 rounded-xl">No active zones found.</div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#0F1219] border border-zinc-800 rounded-xl flex flex-col h-full">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Recent Activity</h3>
            <Activity size={16} className="text-emerald-500" />
          </div>
          <div className="p-4 space-y-6 flex-1 overflow-y-auto max-h-[500px] scrollbar-hide">
            <ActivityItem type="Inbound Receipt" loc="Dallas DC" id="PO-28451" qty="1,200" time="2 mins ago" status="Completed" />
            <ActivityItem type="Outbound Shipment" loc="New York Hub" id="SO-19872" qty="850" time="5 mins ago" status="Completed" />
            <ActivityItem type="Stock Transfer" loc="LA Distribution" id="TR-45612" qty="500" time="12 mins ago" status="In Progress" />
            <ActivityItem type="Cycle Count" loc="Chicago Central" id="CC-00234" qty="3,200" time="25 mins ago" status="In Progress" />
          </div>
          <button className="m-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg transition-colors">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------- 🆕 NEW MODAL COMPONENT ----------------

const ZonesModal = ({ data, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0F1219] border border-zinc-800 w-full max-w-5xl h-[80vh] rounded-2xl flex flex-col shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-white">All Warehouse Zones</h2>
            <p className="text-sm text-zinc-500">Real-time status of all {data.length} registered zones</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-4 m-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input type="text" placeholder="Search by ID, name, or type..." className="w-full bg-[#0F1219] border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:border-emerald-500/50 outline-none text-white" />
        </div>
        <select className="bg-[#0F1219] border border-zinc-800 rounded-lg px-4 text-sm outline-none text-zinc-400">
          <option>All Types</option>
          <option>Distribution</option>
          <option>Port</option>
        </select>
      </div>

        {/* Modal Content - Scrollable Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((zone, idx) => (
              <ZoneCard key={idx} {...zone} />
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-white text-black font-bold text-sm rounded-lg hover:bg-zinc-200">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------- EXISTING SUB COMPONENTS ----------------

const MetricCard = ({ icon, label, value, sub, color }) => (
  <div className="bg-[#0F1219] border border-zinc-800 p-5 rounded-xl hover:border-zinc-700 transition-colors">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 
      ${color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 
        color === 'blue' ? 'bg-blue-500/10 text-blue-500' : 
        color === 'purple' ? 'bg-purple-500/10 text-purple-500' : 
        'bg-orange-500/10 text-orange-500'}`}>
      {icon}
    </div>
    <p className="text-[11px] text-zinc-500 uppercase font-black tracking-widest">{label}</p>
    <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
    <p className="text-[11px] text-zinc-600 mt-1 font-medium">{sub}</p>
  </div>
);

const WarehouseRow = ({ data }) => {
  const util = data.totalCap > 0 ? Math.round((data.usedCap / data.totalCap) * 100) : 0;
  const getTypeIcon = (type) => {
    if(type === 'Port') return <Anchor size={12} />;
    if(type === 'Distribution') return <Truck size={12} />;
    return <Package size={12} />;
  };
  return (
    <tr className="hover:bg-white/[0.02] transition-colors group">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold text-[10px]">
            {data.id ? data.id.split('-')[1] : '##'}
          </div>
          <div>
            <p className="text-white font-bold text-sm">{data.name}</p>
            <div className="flex items-center gap-1 text-zinc-500 mt-0.5">
              <MapPin size={10} />
              <span className="text-[11px]">{data.location}</span>
            </div>
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border
          ${data.type === 'Port' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
            data.type === 'Distribution' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
            'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
          {getTypeIcon(data.type)}
          {data.type}
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2 text-zinc-300">
          <Users size={14} className="text-zinc-500" />
          <span className="font-bold text-xs">{data.staff}</span>
        </div>
      </td>
      <td className="p-4">
        <div className="w-full max-w-[180px]">
          <div className="flex justify-between mb-1.5">
            <span className="text-[10px] font-bold text-zinc-400">
              {(data.usedCap || 0).toLocaleString()} <span className="text-zinc-600 font-normal">/ {(data.totalCap || 0).toLocaleString()}</span>
            </span>
            <span className={`text-[10px] font-bold ${util > 90 ? 'text-rose-500' : 'text-emerald-500'}`}>
              {util}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${util > 90 ? 'bg-rose-500' : util > 75 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${util}%` }} />
          </div>
        </div>
      </td>
      <td className="p-4 text-right">
        <p className="text-zinc-300 font-mono font-bold text-xs">${(data.cost || 0).toLocaleString()}</p>
        <p className="text-[9px] text-zinc-600 uppercase">Per Day</p>
      </td>
      <td className="p-4 text-right">
         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border 
          ${data.status === 'Active' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' : 'text-orange-400 border-orange-500/20 bg-orange-500/5'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${data.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'}`} />
          {data.status}
        </span>
      </td>
    </tr>
  );
};

const ZoneCard = ({ name, location, items, capacity, temp, occupancy, type, alert }) => (
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

const ActivityItem = ({ type, loc, id, qty, time, status }) => (
  <div className="relative pl-6 border-l border-zinc-800 group cursor-default">
    <div className={`absolute -left-1.5 top-0 w-3 h-3 rounded-full border-2 border-[#0B0E14] 
      ${status === 'Completed' ? 'bg-emerald-500' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]'}`} />
    <div className="flex justify-between items-start">
      <div>
        <h5 className="text-[11px] font-black text-white uppercase tracking-wider">{type}</h5>
        <p className="text-[10px] text-zinc-500 font-bold">{loc}</p>
      </div>
      <span className="text-[9px] text-zinc-600 font-bold flex items-center gap-1"><Clock size={10} /> {time}</span>
    </div>
    <div className="mt-2 flex justify-between items-center bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/50 group-hover:border-zinc-700 transition-colors">
      <span className="text-emerald-500 font-mono text-[10px] font-bold">{id}</span>
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-zinc-600 font-bold uppercase">Qty:</span>
        <span className="text-[10px] text-zinc-300 font-black">{qty}</span>
      </div>
    </div>
  </div>
);

export default WarehouseManagement;