import React from 'react';
import { 
  Home, Activity, Users, Target, Clock, 
  CheckCircle, BarChart3, Search, Download, Plus 
} from 'lucide-react';

const WarehouseManagement = () => {
  return (
    <div className="p-6 bg-[#0B0E14] min-h-screen text-zinc-300">
      {/* Header */}
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Warehouse Management</h1>
          <p className="text-sm text-zinc-500 mt-1">Monitor facilities, zones, and operations across all warehouses</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-zinc-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-zinc-800 transition-all">
            <Download size={16} /> Export Report
          </button>
          <button className="flex items-center gap-2 bg-emerald-500 text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-400 transition-all">
            <Plus size={16} /> Add Warehouse
          </button>
        </div>
      </header>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MetricCard icon={<Home />} label="Total Warehouses" value="10" sub="9 operational" color="emerald" />
        <MetricCard icon={<Activity />} label="Storage Utilization" value="86.5%" sub="400,700 / 463,000 sq ft" color="blue" />
        <MetricCard icon={<Users />} label="Total Staff" value="722" sub="+12 this month" color="purple" />
        <MetricCard icon={<Target />} label="Avg. Accuracy" value="98.9%" sub="+0.4% vs last month" color="emerald" />
      </div>

      {/* Performance Overview (Sub-metrics) */}
      <div className="bg-[#0F1219] border border-zinc-800 rounded-xl p-6 mb-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Performance Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <SubMetric label="Avg. Pick Time" value="2.4 min" trend="-8%" trendUp={false} />
          <SubMetric label="Order Accuracy" value="98.9%" trend="+0.3%" trendUp={true} />
          <SubMetric label="Dock Utilization" value="87%" trend="+5%" trendUp={true} />
          <SubMetric label="Labor Efficiency" value="92%" trend="+2%" trendUp={true} />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input 
            type="text" 
            placeholder="Search by warehouse ID, name, or location..." 
            className="w-full bg-[#0F1219] border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:border-emerald-500/50 outline-none"
          />
        </div>
        <select className="bg-[#0F1219] border border-zinc-800 rounded-lg px-4 text-sm outline-none"><option>All Types</option></select>
        <select className="bg-[#0F1219] border border-zinc-800 rounded-lg px-4 text-sm outline-none"><option>All Statuses</option></select>
      </div>

      {/* Facility Table */}
      <div className="bg-[#0F1219] border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.02] border-b border-zinc-800 text-zinc-500">
            <tr>
              <th className="p-4 font-bold uppercase text-[10px]">ID</th>
              <th className="p-4 font-bold uppercase text-[10px]">Warehouse Name</th>
              <th className="p-4 font-bold uppercase text-[10px]">Capacity Utilization</th>
              <th className="p-4 font-bold uppercase text-[10px]">Accuracy</th>
              <th className="p-4 font-bold uppercase text-[10px]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            <WarehouseRow id="WH-001" name="Dallas Distribution Center" city="Dallas, TX" util={77} acc="99.2%" status="Operational" />
            <WarehouseRow id="WH-002" name="New York Hub" city="Newark, NJ" util={91} acc="98.8%" status="Operational" />
            <WarehouseRow id="WH-004" name="Chicago Central" city="Chicago, IL" util={93} acc="97.2%" status="Maintenance" />
          </tbody>
        </table>
      </div>
      {/* Bottom Section: Zone Management & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        {/* Zone Management (Left - 2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Zone Management</h3>
            <button className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-tighter">View All Zones</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ZoneCard 
              name="Receiving Dock A" 
              location="Dallas DC • Z-A1" 
              items={456} 
              capacity={2500} 
              temp={22} 
              occupancy={84} 
              type="Inbound" 
            />
            <ZoneCard 
              name="Cold Storage" 
              location="New York Hub • Z-B1" 
              items={892} 
              capacity={5000} 
              temp={4} 
              occupancy={90} 
              type="Storage" 
              alert={true} 
            />
            <ZoneCard 
              name="High Value Zone" 
              location="LA Distribution • Z-C1" 
              items={567} 
              capacity={4000} 
              temp={21} 
              occupancy={78} 
              type="Storage" 
            />
            <ZoneCard 
              name="Dispatch Zone B" 
              location="New York Hub • Z-B2" 
              items={678} 
              capacity={3500} 
              temp={22} 
              occupancy={80} 
              type="Outbound" 
            />
          </div>
        </div>

        {/* Recent Activity (Right - 1/3 width) */}
        <div className="bg-[#0F1219] border border-zinc-800 rounded-xl flex flex-col h-full">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Recent Activity</h3>
            <Activity size={16} className="text-emerald-500" />
          </div>
          
          <div className="p-4 space-y-6 flex-1 overflow-y-auto max-h-[500px] scrollbar-hide">
            <ActivityItem 
              type="Inbound Receipt" 
              loc="Dallas DC" 
              id="PO-28451" 
              qty="1,200" 
              time="2 mins ago" 
              status="Completed" 
            />
            <ActivityItem 
              type="Outbound Shipment" 
              loc="New York Hub" 
              id="SO-19872" 
              qty="850" 
              time="5 mins ago" 
              status="Completed" 
            />
            <ActivityItem 
              type="Stock Transfer" 
              loc="LA Distribution" 
              id="TR-45612" 
              qty="500" 
              time="12 mins ago" 
              status="In Progress" 
            />
            <ActivityItem 
              type="Cycle Count" 
              loc="Chicago Central" 
              id="CC-00234" 
              qty="3,200" 
              time="25 mins ago" 
              status="In Progress" 
            />
          </div>
          
          <button className="m-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg transition-colors">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, sub, color }) => (
  <div className="bg-[#0F1219] border border-zinc-800 p-5 rounded-xl">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 
      ${color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 
        color === 'blue' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
      {icon}
    </div>
    <p className="text-[11px] text-zinc-500 uppercase font-black tracking-widest">{label}</p>
    <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
    <p className="text-[10px] text-zinc-600 mt-1">{sub}</p>
  </div>
);

const SubMetric = ({ label, value, trend, trendUp }) => (
  <div>
    <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">{label}</p>
    <div className="flex items-center gap-3">
      <span className="text-lg font-bold text-white">{value}</span>
      <span className={`text-[10px] font-bold ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
        {trendUp ? '↗' : '↘'} {trend}
      </span>
    </div>
  </div>
);

const WarehouseRow = ({ id, name, city, util, acc, status }) => (
  <tr className="hover:bg-white/[0.01] transition-colors">
    <td className="p-4 text-emerald-500 font-mono text-xs font-bold">{id}</td>
    <td className="p-4">
      <p className="text-white font-bold">{name}</p>
      <p className="text-[10px] text-zinc-500">{city}</p>
    </td>
    <td className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-zinc-800 h-1.5 rounded-full overflow-hidden w-24">
          <div 
            className={`h-full ${util > 90 ? 'bg-rose-500' : util > 80 ? 'bg-orange-500' : 'bg-emerald-500'}`} 
            style={{ width: `${util}%` }} 
          />
        </div>
        <span className="text-xs font-bold text-zinc-400">{util}%</span>
      </div>
    </td>
    <td className="p-4 text-emerald-500 font-bold">{acc}</td>
    <td className="p-4">
      <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border 
        ${status === 'Operational' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : 'text-orange-400 border-orange-500/20 bg-orange-500/10'}`}>
        {status}
      </span>
    </td>
  </tr>
);

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
        <div 
          className={`h-full transition-all duration-1000 ${alert ? 'bg-rose-500' : 'bg-orange-500'}`} 
          style={{ width: `${occupancy}%` }} 
        />
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
      ${status === 'Completed' ? 'bg-emerald-500' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]'}`} 
    />
    
    <div className="flex justify-between items-start">
      <div>
        <h5 className="text-[11px] font-black text-white uppercase tracking-wider">{type}</h5>
        <p className="text-[10px] text-zinc-500 font-bold">{loc}</p>
      </div>
      <span className="text-[9px] text-zinc-600 font-bold flex items-center gap-1">
        <Clock size={10} /> {time}
      </span>
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