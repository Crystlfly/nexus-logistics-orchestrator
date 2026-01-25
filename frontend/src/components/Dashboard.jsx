import React from 'react';
import {
  Package,
  LayoutDashboard,
  Truck,
  Warehouse,
  Plus,
  CirclePile
} from "lucide-react";

const Dashboard = ({ children, setActiveTab, activeTab }) => {
  return (
    <div className="flex w-full min-h-screen bg-[#0B0E14] text-zinc-400 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F1219] border-r border-zinc-800 flex flex-col h-screen overflow-hidden sticky top-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center text-black font-bold">N</div>
          <div>
            <h2 className="text-white font-bold leading-none">Nexus</h2>
            <span className="text-[10px] text-zinc-500 uppercase">Supply Chain</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4">
          <button onClick={() => setActiveTab('dashboard')} className="w-full">
            <SideItem icon={<LayoutDashboard size={18}/>} label="Dashboard" active={activeTab === 'dashboard'} />
          </button>
          <button onClick={() => setActiveTab('logistics')} className="w-full">
            <SideItem icon={<Package size={18}/>} label="Logistics" active={activeTab === 'logistics'} />
          </button>
          <button onClick={() => setActiveTab('inventory')} className="w-full">
            <SideItem icon={<CirclePile size={18}/>} label="Inventory" active={activeTab === 'inventory'} />
          </button>
          <button onClick={()=> setActiveTab('fleet')} className="w-full">
            <SideItem icon={<Truck size={18}/>} label="Fleet" active={activeTab === 'fleet'}/>
          </button>
          <button onClick={()=> setActiveTab('warehouse')} className="w-full">
            <SideItem icon={<Warehouse size={18}/>} label="Warehouse" active={activeTab === 'warehouse'} />
          </button>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] text-white">OM</div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">Ops Manager</p>
              <p className="text-[10px] text-zinc-500 truncate">manager@nexus.io</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col overflow-hidden">
               
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {children}
        </div>
      </main>
    </div>
  );
};

const SideItem = ({ icon, label, active = false }) => (
  <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'hover:bg-zinc-800'}`}>
    <span>{icon}</span>
    {label}
  </a>
);

export default Dashboard;