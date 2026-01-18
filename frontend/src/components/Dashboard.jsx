import React from 'react';

const Dashboard = ({ children }) => {
  return (
    <div className="flex w-full min-h-screen bg-[#0B0E14] text-zinc-400 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F1219] border-r border-zinc-800 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center text-black font-bold">N</div>
          <div>
            <h2 className="text-white font-bold leading-none">Nexus</h2>
            <span className="text-[10px] text-zinc-500 uppercase">Supply Chain</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4">
          <SideItem icon="📊" label="Dashboard" active />
          <SideItem icon="📦" label="Logistics" />
          <SideItem icon="🏭" label="Inventory" />
          <SideItem icon="🚛" label="Fleet" />
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
        <header className="h-20 flex items-center justify-between px-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Nexus</h1>
            <p className="text-xs text-zinc-500">Logistics Command Center</p>
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
            <span className="text-lg">+</span> Place New Order
          </button>
        </header>
        
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