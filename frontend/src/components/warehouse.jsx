import React, { useEffect, useMemo, useState } from 'react';
import { 
  Home, Activity, Users, DollarSign, Clock, 
  Search, Download, Plus, MapPin, 
  Anchor, Truck, Package, Loader2, MoreVertical, ChevronLeft, ChevronRight, Edit, Trash2
} from 'lucide-react';

// IMPORT SUB-COMPONENTS
import WarehouseModal from './WarehouseModal'; // You said you have this
import Zones from './Zones'; // The file we just created

const WarehouseManagement = () => {
  // --- STATE: WAREHOUSES ---
  const [warehouseData, setWarehouseData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Pagination & Filter
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0); 
  const [searchQueryWarehouse, setSearchQueryWarehouse] = useState("");
  const [typeFilterWarehouse, setTypeFilterWarehouse] = useState("All Types");
  const itemsPerPage = 10;

  // --- FETCH WAREHOUSES ---
  const fetchWarehouses = async () => {
      try {
        const params = new URLSearchParams({
          page: currentPage,
          limit: itemsPerPage,
          search: searchQueryWarehouse,
          type: typeFilterWarehouse !== "All Types" ? typeFilterWarehouse : ""
        });

        const response = await fetch(`http://localhost:3000/api/warehouses?${params}`);
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
        setTotalPages(json.pagination?.totalPages || 1);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
        if (currentPage !== 1 && (searchQueryWarehouse || typeFilterWarehouse !== "All Types")) {
            setCurrentPage(1);
        } else {
            fetchWarehouses();
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [currentPage, searchQueryWarehouse, typeFilterWarehouse]);

  // --- METRICS ---
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

  // --- HANDLERS ---
  const toggleMenu = (id) => setOpenMenuId(openMenuId === id ? null : id);
  const handleUpdate = (item) => { setSelectedItem(item); setIsOpen(true); };
  const handleCloseModal = () => { setIsOpen(false); setSelectedItem(null); fetchWarehouses(); };
  
  // Close menu on click outside
  useEffect(() => { toggleMenu(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        const token = localStorage.getItem('nexus_token'); 
        const numericId = id.replace('WH-', '');
        const response = await fetch(`http://localhost:3000/api/deleteWarehouse/${numericId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (response.ok) { setOpenMenuId(null); fetchWarehouses(); }
        else { const e = await response.json(); alert(e.error); }
      } catch (err) { console.error(err); }
    }
  };

  if (isLoading && currentPage === 1 && warehouseData.length === 0) return <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center text-zinc-500"><Loader2 className="animate-spin mr-2" /> Loading...</div>;

  return (
    <div className="p-6 bg-[#0B0E14] min-h-screen text-zinc-300 font-sans relative">
      
      {/* Warehouse Modal */}
      <WarehouseModal isOpen={isOpen} onCloseAction={handleCloseModal} initialToBeUpdatedData={selectedItem}/>

      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Warehouse Management</h1>
          <p className="text-sm text-zinc-500 mt-1">Real-time facility operations & cost analysis</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-800 transition-all">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={()=>setIsOpen(true)} className="flex items-center gap-2 bg-emerald-500 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-400 transition-all">
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

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input type="text" value={searchQueryWarehouse} onChange={(e) => setSearchQueryWarehouse(e.target.value)} placeholder="Search..." className="w-full bg-[#0F1219] border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:border-emerald-500/50 outline-none text-white" />
        </div>
        <select value={typeFilterWarehouse} onChange={(e) => setTypeFilterWarehouse(e.target.value)} className="bg-[#0F1219] border border-zinc-800 rounded-lg px-4 text-sm outline-none text-zinc-400">
          <option>All Types</option>
          <option>Distribution</option>
          <option>Port</option>
          <option>Fulfilment</option>
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
              <th className="p-4 font-bold uppercase text-[10px] tracking-wider w-1/4">Capacity</th>
              <th className="p-4 font-bold uppercase text-[10px] tracking-wider text-right">Daily Cost</th>
              <th className="p-4 font-bold uppercase text-[10px] tracking-wider text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {warehouseData.map((wh) => (
              <WarehouseRow key={wh.id} data={wh} isOpen={openMenuId === wh.id} onToggle={() => toggleMenu(wh.id)} onDelete={() => handleDelete(wh.id)} onUpdate={handleUpdate} />
            ))}
          </tbody>
        </table>
        {/* Pagination */}
        <div className="p-4 border-t border-zinc-800 flex justify-between items-center bg-white/[0.02]">
            <button onClick={() => currentPage > 1 && setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-white disabled:opacity-30"><ChevronLeft size={14} /> Previous</button>
            <span className="text-xs text-zinc-500 font-medium">Page <span className="text-white">{currentPage}</span> of {totalPages}</span>
            <button onClick={() => currentPage < totalPages && setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-white disabled:opacity-30">Next <ChevronRight size={14} /></button>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: ZONES COMPONENT (Imported) */}
        <div className="lg:col-span-2">
            <Zones />
        </div>

        {/* RIGHT: ACTIVITY FEED (Inline for simplicity or move to separate file) */}
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
        </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS (Can stay in WarehouseManagement to avoid too many files) ---

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

const WarehouseRow = ({ data, isOpen, onToggle, onDelete, onUpdate }) => {
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
      </td>
      <td className="px-6 py-4 text-right relative">
        <div className="relative">
          <button onClick={() => onToggle(data.id)} className="text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100">
            <MoreVertical size={16} />
          </button>
          {isOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-zinc-900 border border-zinc-700 rounded-md shadow-xl z-50 overflow-hidden">
              <button onClick={() => onUpdate(data)} className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-2">
                <Edit size={14} /> Update
              </button>
              <button onClick={() => onDelete(data.id)} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

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