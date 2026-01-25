import React from 'react';
import { useEffect } from 'react';
import { Truck, MapPin, Gauge, Fuel, Calendar, Plus, Search } from 'lucide-react';

const Fleet = () => {
  const [fleetData, setFleetData] = React.useState([]);
  useEffect(() => {
    fetch("http://localhost:3000/api/fleet")
    .then((res)=>res.json())
    .then((response)=> {
      // console.log("Fleet Data:",data);
      if (response.status === 200) {
        setFleetData(response.data);
      }
    })
    .catch((err)=>console.error("Fleet API Error:",err));
  }, []);
  return (
    <div className="animate-in fade-in duration-500">
      <header className="my-5 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Fleet Management</h1>
          <p className="text-sm text-zinc-500 mt-1">Monitor vehicles, drivers, and maintenance schedules</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm font-bold transition-all">
            <Calendar size={16} /> Schedule Maintenance
          </button>
          <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg text-sm font-bold transition-all">
            <Plus size={16} /> Add Vehicle
          </button>
        </div>
      </header>

      {/* Fleet Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <FleetStat icon={<Truck />} label="Total Vehicles" value={fleetData.length} trend="+4 new" color="emerald" />
      <FleetStat icon={<MapPin />} label="Active on Routes" value={fleetData.filter(v => v.status === "In-Transit").length} trend={fleetData.length > 0 
      ? (fleetData.filter(v => v.status === "In-Transit").length / fleetData.length * 100).toFixed(1) + "%" 
      : "0%"} color="emerald" />
        <FleetStat icon={<Gauge />} label="Idle / Available" value={fleetData.filter(v => v.status === "Idle").length} trend={fleetData.length > 0
        ? (fleetData.filter(v => v.status === "Idle").length / fleetData.length * 100).toFixed(1) + "%" 
        : "0%"} color="emerald" />
        <FleetStat icon={<Fuel />} label="Maintenance Due" value={fleetData.filter(v => v.status === "Maintenance").length} trend={fleetData.length > 0
        ? (fleetData.filter(v => v.status === "Maintenance").length / fleetData.length * 100).toFixed(1) + "%" 
        : "0%"} color="rose" />
      </div>

      {/* Search Bar */}
      <div className="flex gap-4 bg-[#0F1219] p-4 rounded-xl border border-zinc-800 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input type="text" placeholder="Search by vehicle ID, driver, or location..." className="w-full bg-[#0B0E14] border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50" />
        </div>
        <select className="bg-[#0B0E14] border border-zinc-800 rounded-lg px-4 text-sm text-zinc-300 outline-none"><option>All Types</option></select>
        <select className="bg-[#0B0E14] border border-zinc-800 rounded-lg px-4 text-sm text-zinc-300 outline-none"><option>All Statuses</option></select>
      </div>

      {/* Fleet List */}
      <div className="bg-[#0F1219] border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-white/[0.02]">
          <h3 className="text-white font-bold text-sm">Fleet Overview</h3>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{fleetData.length} vehicles shown</span>
        </div>
        <div className="divide-y divide-zinc-800/50">
          {fleetData.map((vehicle) => (
            <FleetRow 
              key={vehicle.vehicle_id}
              id={`VEH-${vehicle.vehicle_id.toString().padStart(4, '0')}`}
              type={vehicle.vehicle_type}
              driver={vehicle.driver_name}
              status={vehicle.status}
              loc={vehicle.warehouse_location}
              // New dynamic data from your updated schema
              dist={`${vehicle.odometer.toLocaleString()} km`} 
              route={vehicle.current_route} 
              prog={vehicle.progress} 
              fuel={vehicle.fuel_level} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const FleetStat = ({ icon, label, value, trend, color }) => (
  <div className="bg-[#0F1219] border border-zinc-800 p-5 rounded-xl">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold ${color === 'emerald' ? 'text-emerald-500' : 'text-rose-500'}`}>{trend}</span>
    </div>
    <p className="text-[11px] text-zinc-500 uppercase font-bold tracking-tight">{label}</p>
    <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
  </div>
);

const FleetRow = ({ id, type, driver, dist, route, loc, prog, fuel, status }) => (
  <div className="p-4 hover:bg-white/[0.02] transition-colors grid grid-cols-1 md:grid-cols-6 gap-6 items-center">
    <div>
      <p className="text-emerald-500 font-mono text-xs font-bold">{id}</p>
      <p className="text-[10px] text-zinc-500 uppercase font-bold">{type}</p>
    </div>
    <div>
      <p className="text-white text-xs font-bold">{driver}</p>
      <p className="text-[10px] text-zinc-600">{dist}</p>
    </div>
    <div>
      <p className="text-white text-xs font-bold">{route}</p>
      <p className="text-[10px] text-zinc-600 flex items-center gap-1"><MapPin size={8}/> {loc}</p>
    </div>
    <div className="col-span-2 flex gap-4">
      <div className="flex-1">
        <div className="flex justify-between text-[9px] font-bold mb-1"><span className="text-zinc-500 uppercase">Progress</span><span className="text-zinc-300">{prog}%</span></div>
        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${prog}%` }} /></div>
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-[9px] font-bold mb-1"><span className="text-zinc-500 uppercase flex items-center gap-1"><Fuel size={8}/> Fuel: {fuel}%</span></div>
        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden"><div className={`h-full ${fuel < 20 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${fuel}%` }} /></div>
      </div>
    </div>
    <div className="text-right">
      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${status === 'In-Transit' ? 'text-blue-400 border-blue-500/20 bg-blue-500/10' : status === 'Maintenance' ? 'text-rose-400 border-rose-500/20 bg-rose-500/10' : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'}`}>
        {status}
      </span>
    </div>
  </div>
);

export default Fleet;