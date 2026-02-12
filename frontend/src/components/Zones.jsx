import React, { useState, useEffect, useMemo } from 'react';
import ZonesModal, { ZoneCard } from './ZonesModal'; // Importing Modal and the shared Card

const Zones = () => {
  const [zoneData, setZoneData] = useState([]);
  const [showZonesModal, setShowZonesModal] = useState(false);

  // --- FETCH ZONES DATA ---
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/zones`);
        if (!response.ok) throw new Error('Failed to fetch zone data');
        const json = await response.json();
        const rawData = json.data || json;
        
        const mappedData = rawData.map(row => ({
          name: row.zone_name,                          
          location: `${row.warehouse_name || 'Unknown'} • Zone ${row.zone_id}`,
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

  // --- DASHBOARD LOGIC: TOP 6 CRITICAL ---
  const dashboardZones = useMemo(() => {
    return [...zoneData]
      .sort((a, b) => {
        if (a.alert && !b.alert) return -1; // Alerts first
        if (!a.alert && b.alert) return 1;
        return b.occupancy - a.occupancy; // Then highest occupancy
      })
      .slice(0, 6);
  }, [zoneData]);

  return (
    <>
      {/* The Modal (Only shown when state is true) */}
      {showZonesModal && (
        <ZonesModal 
          data={zoneData} 
          onClose={() => setShowZonesModal(false)} 
        />
      )}

      {/* The Dashboard Section */}
      <div className="space-y-4 h-full">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-white">Critical Zones Overview</h3>
          
          <button 
            onClick={() => setShowZonesModal(true)}
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
            <div className="col-span-2 p-8 text-center text-zinc-500 text-sm border border-dashed border-zinc-800 rounded-xl">
              No active zones found.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Zones;