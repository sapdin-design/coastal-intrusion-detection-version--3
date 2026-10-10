import React, { useState } from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { MaritimeMap } from '../components/map/MaritimeMap';
import { IVessel, VesselType, VesselStatus } from '../types';
import {
  Compass,
  Ship,
  Filter,
  Search,
  Crosshair,
  Radio,
  Gauge,
  Shield,
  Activity,
  AlertTriangle,
  Play,
  RotateCcw
} from 'lucide-react';

export const LiveMonitoringPage: React.FC = () => {
  const {
    vessels,
    zones,
    selectedVessel,
    selectVessel,
    latestNmea,
    simulator,
    startSimulation,
    resetSimulation
  } = useMonitoring();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredVessels = vessels.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'intrusion' && v.status === 'intrusion') ||
      (statusFilter === 'approaching' && v.status === 'approaching') ||
      (statusFilter === 'authorized' && v.authorizationStatus === 'authorized') ||
      (statusFilter === 'unauthorized' && v.authorizationStatus === 'unauthorized');

    const matchesType = typeFilter === 'all' || v.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="h-[calc(100vh-6.5rem)] flex flex-col space-y-3">
      {/* Top Tactical Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0a1120] border border-slate-800 rounded-xl shadow-lg shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              Live Tactical Monitoring Deck
            </h1>
            <p className="text-[11px] text-slate-400">
              Real-time GNSS Telemetry • Kanyakumari Maritime Surveillance
            </p>
          </div>
        </div>

        {/* Quick Simulator Controller */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-400">Simulator:</span>
          <span className={`font-semibold ${simulator.isRunning ? 'text-cyan-400' : 'text-slate-500'}`}>
            {simulator.isRunning ? `${simulator.speedMultiplier}x ACTIVE` : 'IDLE'}
          </span>
          {!simulator.isRunning ? (
            <button
              onClick={() => startSimulation('intrusion_demo', 2)}
              className="px-2.5 py-1 bg-red-950/60 border border-red-500/40 text-red-300 hover:bg-red-900/60 rounded text-xs flex items-center space-x-1"
            >
              <Play className="w-3 h-3 fill-red-400" />
              <span>Launch Demo</span>
            </button>
          ) : (
            <button
              onClick={resetSimulation}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split Layout: Map (Left) + Tactical Fleet Inspector (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-3 min-h-0">
        {/* Full-Deck Map View (3 Columns) */}
        <div className="lg:col-span-3 h-full rounded-xl overflow-hidden flex flex-col">
          <MaritimeMap
            vessels={filteredVessels}
            zones={zones}
            selectedVessel={selectedVessel}
            onSelectVessel={selectVessel}
            height="100%"
            zoomLevel={11}
          />
        </div>

        {/* Tactical Fleet Sidebar / Inspector (1 Column) */}
        <div className="h-full bg-[#09111e] border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-xl">
          {/* Filters & Search */}
          <div className="p-3 border-b border-slate-800 space-y-2 shrink-0 bg-slate-900/60">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search vessel name, ID, reg..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950/80 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="all">All Statuses</option>
                <option value="intrusion">Intrusions</option>
                <option value="approaching">Approaching</option>
                <option value="authorized">Authorized</option>
                <option value="unauthorized">Unauthorized</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-950/80 border border-slate-800 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="all">All Types</option>
                <option value="Patrol Boat">Patrol Boat</option>
                <option value="Fishing Boat">Fishing Boat</option>
                <option value="Cargo Ship">Cargo Ship</option>
                <option value="Passenger Ferry">Ferry</option>
                <option value="Speed Boat">Speed Boat</option>
                <option value="Rescue Boat">Rescue Boat</option>
              </select>
            </div>
          </div>

          {/* Fleet Vessel List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredVessels.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-mono">
                No matching vessels found.
              </div>
            ) : (
              filteredVessels.map((vessel) => {
                const isSelected = selectedVessel?.id === vessel.id;
                const isCritical = vessel.status === 'intrusion';
                const isApproaching = vessel.status === 'approaching';

                return (
                  <div
                    key={vessel.id}
                    onClick={() => selectVessel(vessel)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                        : isCritical
                        ? 'bg-red-950/30 border-red-500/50 critical-glow'
                        : isApproaching
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-cyan-400 text-xs">
                          {vessel.id}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded font-mono uppercase ${
                            vessel.authorizationStatus === 'authorized'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {vessel.authorizationStatus}
                        </span>
                      </div>
                      <div className="text-right">
                        {isCritical ? (
                          <span className="text-[9px] font-black text-red-400 uppercase font-mono animate-pulse">
                            INTRUSION
                          </span>
                        ) : isApproaching ? (
                          <span className="text-[9px] font-bold text-amber-400 uppercase font-mono">
                            APPROACH
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-400 font-mono">NORMAL</span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs font-semibold text-slate-200 truncate">{vessel.name}</p>
                    <p className="text-[10px] text-slate-400">{vessel.type}</p>

                    {/* Coordinates & Speed */}
                    <div className="grid grid-cols-2 gap-1 mt-2 pt-2 border-t border-slate-800/80 font-mono text-[10px] text-slate-300">
                      <div>
                        Lat: <span className="text-cyan-400">{vessel.latitude.toFixed(3)}°N</span>
                      </div>
                      <div>
                        Lon: <span className="text-cyan-400">{vessel.longitude.toFixed(3)}°E</span>
                      </div>
                      <div>
                        Spd: <span className="text-slate-100">{vessel.speed.toFixed(1)} kts</span>
                      </div>
                      <div>
                        Hdg: <span className="text-slate-100">{vessel.heading}°</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Telemetry Stream Console in Footer */}
          {latestNmea && (
            <div className="p-2.5 bg-black/80 border-t border-slate-800 font-mono text-[9px] text-emerald-400 shrink-0 select-text overflow-hidden">
              <div className="flex items-center justify-between text-slate-500 text-[8px] uppercase mb-1">
                <span>Simulated NMEA 0183 GNSS Stream</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <pre className="truncate text-[9px] leading-tight text-emerald-300/90 font-mono">
                {latestNmea.split('\n')[0]}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
