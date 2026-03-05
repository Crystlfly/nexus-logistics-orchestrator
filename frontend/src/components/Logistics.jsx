import React from 'react';
import {
  Package,
  TrendingUp,
  Clock,
  MapPin,
  Search,
  Filter,
  Loader2,
  MoreVertical
} from "lucide-react";
import { useState, useEffect } from 'react';



const Logistics = () => {
  const [logisticData, setLogicticData]= useState([]);
  const [isLoading, setIsLoading]= useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0); 
  const [searchQueryLogistic, setSearchQueryLogistic] = useState("");
  const [statusFilterLogistic, setStatusFilterLogistic] = useState("");
  const [vehicleFilterLogistic, setVehicleFilterLogistic] = useState("");
  const itemsPerPage = 10;

  useEffect(()=>{
    const fetchLogistics=async()=>{
     try{
        const params = new URLSearchParams({
          page: currentPage,
          limit: itemsPerPage,
          search: searchQueryLogistic,
          status: statusFilterLogistic,
          vehicle: vehicleFilterLogistic
        });
        const response=await fetch(`http://localhost:3000/api/logistics?${params}`)
       if(!response.ok){
        setLogicticData([]);
       }
        const data =await response.json();
        setLogicticData(data.data || []);
        setTotalPages(data?.totalPages || 0);
     }catch(err){
        console.error("Logistics API Error:",err);
        setLogicticData([]);
     }finally{
        setIsLoading(false);
     }
    }
    const timer = setTimeout(() => {
        fetchLogistics();
    }, 500);
    return () => clearTimeout(timer);
  }, [currentPage, searchQueryLogistic, statusFilterLogistic, vehicleFilterLogistic]);

  useEffect(() => {
      setCurrentPage(1);
  }, [searchQueryLogistic, statusFilterLogistic, vehicleFilterLogistic]);

  if (isLoading) return <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center text-zinc-500"><Loader2 className="animate-spin mr-2" /> Loading...</div>;
  
  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <header className="my-5 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Logistics Operations</h1>
          <p className="text-sm text-zinc-500 mt-1">Track and manage shipments in real-time</p>
        </div>
        <div className="flex gap-3">
          {/* <button className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm font-bold transition-all">
            <Filter size={16} /> Filter
          </button> */}
          <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg text-sm font-bold transition-all">
            <Package size={16} /> New Shipment
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<Package />} label="Total Shipments" value={logisticData.length} trend="+18%" color="emerald" />
        <StatCard icon={<TrendingUp />} label="In Transit" value={logisticData.filter(s => s.order_status === 'In Transit').length} trend="+5%" color="emerald" />
        <StatCard icon={<Clock />} label="Avg. Delivery Time" value={logisticData.length > 0 ? `${(logisticData.reduce((sum, s) => sum + (s.eta ? parseInt(s.eta) : 0), 0) / logisticData.length).toFixed(1)}h` : "0h"} trend="-12%" color="rose" />
        <StatCard icon={<MapPin />} label="Active Routes" value={logisticData.filter(s => s.order_status === 'In Transit').length} trend="+8%" color="emerald" />
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4 bg-[#0F1219] p-4 rounded-xl border border-zinc-800">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"><Search size={16} /></span>
          <input 
            type="text" 
            value={searchQueryLogistic}
            onChange={(e) => setSearchQueryLogistic(e.target.value)}
            placeholder="Search shipments by ID, origin, or destination..." 
            className="w-full bg-[#0B0E14] border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <select 
        value={statusFilterLogistic}
        onChange={(e) => setStatusFilterLogistic(e.target.value)}
        className="bg-[#0B0E14] border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-300 outline-none">
          <option value="">All Statuses</option>
          <option value="Dispatched">In Transit</option>
          <option value="Delayed">Delayed</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      {/* Shipments List */}
      <div className="bg-[#0F1219] border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="text-white font-bold text-sm">Active Shipments</h3>
          <span className="text-[10px] text-zinc-500 font-bold uppercase">{logisticData.length} Total Shipments</span>
        </div>
        
        <div className="divide-y divide-zinc-800">
          {/* <ShipmentRow id="SHP-9281" origin="Dallas DC" dest="Austin, TX" progress={68} status="In Transit" eta="1h 25m" carrier="FastTrack Logistics" weight="2,450 lbs" color="blue" />
          <ShipmentRow id="SHP-9280" origin="Miami Port" dest="Orlando, FL" progress={42} status="Delayed" eta="3h 10m" carrier="Ocean Express" weight="5,120 lbs" color="rose" />
          <ShipmentRow id="SHP-9279" origin="Chicago Central" dest="Detroit, MI" progress={85} status="In Transit" eta="45m" carrier="RapidShip Co." weight="1,890 lbs" color="blue" />
          <ShipmentRow id="SHP-9278" origin="LA Distribution" dest="San Diego, CA" progress={100} status="Delivered" eta="Completed" carrier="Coast Freight" weight="3,200 lbs" color="emerald" /> */}
          {logisticData.map((shipment) => {
            // 1. Determine color based on status
            const statusColor = 
              shipment.order_status === 'Delivered' ? 'emerald' : 
              shipment.order_status === 'Delayed' ? 'rose' : 'blue';

            // 2. Handle null/missing data with fallbacks
            const carrierName = shipment.carrier || "Unassigned";
            const progressValue = shipment.progress || 45; // Default percentage if API is missing it
            const etaValue = shipment.eta || "2 Days";
            const weightValue = shipment.weight || "1,200 lbs";

            return (
              <ShipmentRow
                key={shipment.order_id}
                id={`#SHP-${shipment.order_id}`} // Format ID nicely
                origin={shipment.origin}
                dest={shipment.destination}
                status={shipment.order_status}
                carrier={carrierName}
                
                // 3. PASS THE MISSING PROPS
                color={statusColor}        // <--- Critical for colors to work
                progress={progressValue}   // <--- Critical for progress bar
                eta={etaValue}             
                weight={weightValue}       
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ icon, label, value, trend, color }) => (
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

const ShipmentRow = ({ id, origin, dest, progress, status, eta, carrier, weight, color }) => {
  const barColor = { blue: 'bg-blue-500', rose: 'bg-rose-500', emerald: 'bg-emerald-500' }[color];
  const textColor = { blue: 'text-blue-400', rose: 'text-rose-400', emerald: 'text-emerald-400' }[color];
  const bgColor = { blue: 'bg-blue-500/10', rose: 'bg-rose-500/10', emerald: 'bg-emerald-500/10' }[color];

  return (
    <div className="p-4 hover:bg-white/[0.02] transition-colors grid grid-cols-1 md:grid-cols-5 gap-4 items-center group">
      {/* Column 1: Shipment ID */}
      <div>
        <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Shipment ID</p>
        <p className="text-emerald-500 font-mono text-sm font-bold">{id}</p>
      </div>

      {/* Column 2: Route */}
      <div>
        <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Route</p>
        <p className="text-white text-xs font-medium">{origin} <span className="text-zinc-600 px-1">→</span> {dest}</p>
      </div>

      {/* Column 3: Progress Bar */}
      <div className="col-span-1">
        <div className="flex justify-between text-[10px] font-bold mb-1.5">
          <span className="text-zinc-500 uppercase tracking-tighter">Progress</span>
          <span className="text-zinc-300">{progress}%</span>
        </div>
        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
          <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Column 4: Status Pill & ETA */}
      <div className="flex flex-col items-center">
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-current ${textColor} ${bgColor}`}>
          {status}
        </span>
        <span className="text-[9px] text-zinc-600 mt-1 font-bold">ETA: {eta}</span>
      </div>

      {/* --- Modified Last Column: Carrier info + Menu Button --- */}
      <div className="flex items-center justify-end gap-4 text-right">
        <div>
          <p className="text-white text-xs font-bold">{carrier}</p>
          <p className="text-[10px] text-zinc-600 font-medium">{weight}</p>
        </div>
        
        {/* Triple Dot Button (Visible on Hover) */}
        <button className="text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100">
          <MoreVertical size={16} />
        </button>
      </div>
    </div>
  );
};

export default Logistics;