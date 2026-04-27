import React from 'react';
import {
  Package,
  LayoutDashboard,
  Truck,
  Warehouse,
  Plus,
  CirclePile,
  LogOut,
  User
} from "lucide-react";
import { NavLink } from 'react-router-dom';

const formatRole = (role) => {
  if (!role) return "";

  return role
    .toLowerCase()
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getInitials = (name) => {
  if (!name) return "U"; 

  return name
    .replace(/_/g, " ")       
    .split(" ")
    .filter(Boolean)
    .map(word => word[0].toUpperCase())
    .slice(0, 2)              
    .join(" ");
};

const Dashboard = ({ children, onLogout}) => {
    const userRole = (localStorage.getItem('nexus_user_role'));
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
          <SideItem to="/" icon={<LayoutDashboard size={18}/>} label="Dashboard" end />
          <SideItem to="/orders" icon={<Package size={18}/>} label="Orders" />
          <SideItem to="/logistics" icon={<Package size={18}/>} label="Logistics" />
          <SideItem to="/inventory" icon={<CirclePile size={18}/>} label="Inventory" />
          {userRole !== 'inventory_manager' && (
            <SideItem to="/fleet" icon={<Truck size={18}/>} label="Fleet" />
          )}
          
          <SideItem to="/warehouse" icon={<Warehouse size={18}/>} label="Warehouse" />
          
          {userRole === 'system_admin' && (
            <SideItem to="/user" icon={<User size={18}/>} label="Users" />
          )}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] text-white">{getInitials(localStorage.getItem('nexus_user_role'))}</div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{formatRole(localStorage.getItem('nexus_user_role'))}</p>
              {/* <p className="text-[10px] text-zinc-500 truncate">manager@nexus.io</p> */}
            </div>
          </div>
          <button 
          onClick={onLogout}
          className="w-full hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-all">
            <LogOut size={16} className="inline-block mr-2" />
            Logout
          </button>
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

const SideItem = ({ icon, label, to, end }) => (
  <NavLink 
    to={to} 
    end={end}
    className={({ isActive }) => 
      `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
        isActive 
          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
          : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
      }`
    }
  >
    <span>{icon}</span>
    {label}
  </NavLink>
);

export default Dashboard;