import Dashboard from './components/Dashboard';
import RealMap from './components/RealMap';
import Orders from './components/Orders.jsx';
import Logistics from './components/Logistics.jsx';
import Inventory from './components/Inventory';
import Fleet from './components/Fleet.jsx';
import WarehouseManagement from './components/warehouse.jsx';
import User from './components/User.jsx';
import Signup from './components/Signup.jsx';
import Login from './components/Login.jsx';
import NexusSplash from './components/NexusSplash.jsx';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ResetPasswordPage from './components/ResetPassword.jsx';
import { jwtDecode } from 'jwt-decode';
import OrderModal from './components/OrderModal.jsx';
import {getRoleFromToken} from './components/getRoleFromToken';

import { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  Truck,
  Activity,
  Plus
} from "lucide-react";

// const WAREHOUSE_POINTS = [
//   { lat: 32.7767, lng: -96.7970, name: "Dallas DC", status: "Active" },
//   { lat: 25.7617, lng: -80.1918, name: "Miami Port", status: "High Alert" },
//   { lat: 40.7128, lng: -74.0060, name: "New York Hub", status: "Active" },
//   { lat: 34.0522, lng: -118.2437, name: "LA Warehouse", status: "Active" },
// ];



function App() {
  // 1. State for View Switching
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem('nexus_token');
    
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000; // Convert to seconds

      if (decoded.exp < currentTime) {
        console.warn("Token expired. Clearing storage.");
        localStorage.removeItem('nexus_token');
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  });

  const userRole = getRoleFromToken(localStorage.getItem('nexus_token'));

  const [WAREHOUSE_POINTS, setWAREHOUSE_POINTS] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogin = (token) => {
    localStorage.setItem('nexus_token', token);
    // localStorage.setItem('nexus_user', JSON.stringify(userData));
    setIsLoggedIn(true);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    // localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_token');
    setIsLoggedIn(false);
    setActiveTab('login');
  };

  useEffect(() => {
    fetch("http://localhost:3000/api/logistics/coordinates")
      .then((res) => res.json())
      .then((json) => {
        setWAREHOUSE_POINTS(json.data);
      })
      .catch(err => console.error("API Error:", err));
  }, []);

  useEffect(() => {
    // Check if token exists on initial load
    const token = localStorage.getItem('nexus_token');
    if (token) {
      setIsLoggedIn(true);
    }
    
    // Simulate a brief delay for a smoother "Nexus" splash experience
    setTimeout(() => {
      setIsLoading(false);
    }, 800); 
  }, []);

  if (isLoading) {
    return <NexusSplash />;
  }

  return (
    <Router>
      <Routes>
        {/* Dynamic Reset Password Route - THIS FIXES THE "CANNOT GET" ERROR */}
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Catch-all route for your main Dashboard/Login logic */}
        <Route path="*" element={
          !isLoggedIn ? (
            activeTab === 'signup' ? (
              <Signup onLoginClick={() => setActiveTab('login')} />
            ) : (
              <Login onLogin={handleLogin} onSignupClick={() => setActiveTab('signup')} />
            )
          ) : (
    <Dashboard setActiveTab={setActiveTab} activeTab={activeTab} onLogout={handleLogout}>
      
      {/* 2. Conditional Rendering Logic */}
      {activeTab === 'dashboard' && (
        <>
          {/* Top Stats Cards */}
          <header className="my-5 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Nexus</h1>
              <p className="text-sm text-zinc-500 mt-1">Logistics Command Center</p>
            </div>
            <button 
            onClick={()=>setIsOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
              <Plus size={16} /> Place New Order
            </button>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard icon={<Package />} label="Total Active Orders" value="1,847" trend="+12.3%" color="emerald" />
            <StatCard icon={<AlertTriangle />} label="Critical Inventory Alerts" value="23" trend="+5 new" color="rose" />
            <StatCard icon={<Truck />} label="Fleet Availability" value="78%" sub="142 Idle / 40 In-Transit" color="emerald" />
            <StatCard icon={<Activity />} label="Operational Uptime" value="99.4%" trend="+0.2%" color="emerald" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#0F1219] border border-zinc-800 rounded-xl overflow-hidden relative min-h-[400px]">
              <div className="absolute top-4 left-4 z-[1000] bg-[#0F1219]/80 p-2 rounded border border-zinc-700">
                <h3 className="text-white font-bold text-xs uppercase tracking-widest text-[10px]">Live Network</h3>
              </div>
              <RealMap points={WAREHOUSE_POINTS} />
            </div>

            <div className="bg-[#0F1219] border border-zinc-800 rounded-xl flex flex-col">
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="text-white font-bold text-sm">Inventory Health</h3>
                <span className="text-[10px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded border border-rose-500/20">7 Alerts</span>
              </div>
              <div className="p-4 space-y-3 flex-1">
                <InventoryItem name="Steel Fasteners M12" loc="Dallas DC" stock={45} target={200} alert={false} />
                <InventoryItem name="Hydraulic Fluid 5L" loc="Miami Port" stock={12} target={150} alert={true} />
                <InventoryItem name="Circuit Boards Type-A" loc="New York Hub" stock={78} target={300} alert={false} />
              </div>
              <button className="m-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-lg transition-colors">
                View All Alerts
              </button>
            </div>
          </div>
        </>
      )
      }
      {activeTab === 'orders' && <Orders />}
      {activeTab === 'logistics' && <Logistics />}
      {activeTab === 'inventory' && <Inventory />}
      {activeTab === 'fleet' && <Fleet />}
      {activeTab === 'warehouse' && <WarehouseManagement />}
      {activeTab === 'user' && userRole === 'system_admin' && <User />}
    </Dashboard>
    )
    } />
      </Routes>
      <OrderModal isOpen={isOpen} onCloseAction={()=> setIsOpen(false)}/>
    </Router>
  );
}

// Sub-components
const StatCard = ({ icon, label, value, trend, sub, color }) => (
  <div className="bg-[#0F1219] border border-zinc-800 p-5 rounded-xl">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${color === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
        {icon}
      </div>
      {trend && <span className={`text-[10px] font-bold ${color === 'emerald' ? 'text-emerald-500' : 'text-rose-500'}`}>{trend}</span>}
    </div>
    <p className="text-[11px] text-zinc-500 uppercase font-bold tracking-tight">{label}</p>
    <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
    {sub && <p className="text-[10px] text-zinc-600 mt-1">{sub}</p>}
  </div>
);

const InventoryItem = ({ name, loc, stock, target, alert }) => (
  <div className={`p-3 rounded-lg border ${alert ? 'border-rose-500/30 bg-rose-500/5' : 'border-zinc-800 bg-zinc-900/50'}`}>
    <div className="flex justify-between items-start mb-2">
      <div>
        <h4 className="text-xs font-bold text-white">{name}</h4>
        <p className="text-[10px] text-zinc-500">{loc}</p>
      </div>
      {alert && <span className="text-[8px] bg-rose-500 text-white px-1.5 py-0.5 rounded font-black">HIGH ALERT</span>}
    </div>
    <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
      <div className={`h-full ${alert ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${(stock/target)*100}%` }}></div>
    </div>
    <div className="flex justify-between mt-2 text-[9px]">
      <span className={alert ? 'text-rose-400 font-bold' : 'text-zinc-400'}>Current: {stock} units</span>
      <span className="text-zinc-600 font-bold">Threshold: {target}</span>
    </div>
  </div>
);

const MapPoint = ({ top, left, color }) => (
  <div className="absolute w-4 h-4 rounded-full flex items-center justify-center" style={{ top, left }}>
    <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${color === 'emerald' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
    <div className={`w-2 h-2 rounded-full relative z-10 ${color === 'emerald' ? 'bg-emerald-500' : 'bg-rose-500'} shadow-[0_0_10px_rgba(16,185,129,0.5)]`}></div>
  </div>
);

export default App;