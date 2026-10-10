import React from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { MaritimeMap } from '../components/map/MaritimeMap';
import {
  Ship,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  FileWarning,
  Activity,
  Play,
  Pause,
  RotateCcw,
  Zap,
  ArrowUpRight,
  Compass,
  Radar
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SimulationScenario } from '../types';

export const DashboardPage: React.FC = () => {
  const {
    vessels,
    zones,
    alerts,
    incidents,
    stats,
    simulator,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    resetSimulation,
    acknowledgeAlert
  } = useMonitoring();

  const navigate = useNavigate();

  const activeIntrusionsCount = vessels.filter((v) => v.status === 'intrusion').length;
  const approachingCount = vessels.filter((v) => v.status === 'approaching').length;
  const authorizedCount = vessels.filter((v) => v.authorizationStatus === 'authorized').length;
  const unauthorizedCount = vessels.filter((v) => v.authorizationStatus === 'unauthorized').length;
  const activeAlerts = alerts.filter((a) => a.status !== 'resolved');
  const openIncidents = incidents.filter((i) => i.status !== 'closed');

  // Maritime Security Threat Level calculation
  const threatLevel =
    activeIntrusionsCount > 0
      ? { level: 'CRITICAL', color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/40', desc: 'Active Offshore Intrusion in Progress' }
      : approachingCount > 0
      ? { level: 'ELEVATED', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/40', desc: 'Vessels Approaching Defense Perimeters' }
      : { level: 'GUARDED / NORMAL', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/40', desc: 'All Maritime Sectors Clear' };

  const handleQuickScenario = async (sc: SimulationScenario) => {
    await startSimulation(sc, 2);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Threat Readiness & Quick Action Deck */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-[#0a1222] via-[#0e192f] to-[#0a1222] border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Radar className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-100 tracking-wide font-sans">
                Coastal Security Command Console
              </h1>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${threatLevel.bg} ${threatLevel.color}`}>
                THREAT: {threatLevel.level}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{threatLevel.desc}</p>
          </div>
        </div>

        {/* Quick Simulation Launchers */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-xs text-slate-400 font-mono mr-1">Quick Scenarios:</span>
          <button
            onClick={() => handleQuickScenario('intrusion_demo')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-950/50 border border-red-500/50 text-red-300 hover:bg-red-900/60 transition-all shadow-[0_0_12px_rgba(239,68,68,0.2)]"
          >
            <Zap className="w-3.5 h-3.5 fill-red-400 text-red-400" />
            <span>Intrusion Demo</span>
          </button>
          <button
            onClick={() => handleQuickScenario('normal_patrol')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
          >
            <Play className="w-3 h-3 text-emerald-400" />
            <span>Normal Patrol</span>
          </button>
          <button
            onClick={() => handleQuickScenario('zone_approach')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
          >
            <Play className="w-3 h-3 text-amber-400" />
            <span>Zone Approach</span>
          </button>
          <button
            onClick={resetSimulation}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Reset All State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Grid (PRD Section 7 metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total & Active Vessels */}
        <div className="p-3.5 rounded-xl bg-[#09111e] border border-slate-800/90 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Fleet Tracked</span>
            <Ship className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-100">{vessels.length}</span>
            <span className="text-[11px] font-mono text-emerald-400">
              {vessels.filter((v) => v.isActive).length} Active
            </span>
          </div>
        </div>

        {/* Authorized vs Unauthorized */}
        <div className="p-3.5 rounded-xl bg-[#09111e] border border-slate-800/90 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Auth / Rogue</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">{authorizedCount}</span>
            <span className="text-slate-500 font-mono">/</span>
            <span className="text-2xl font-bold font-mono text-red-400">{unauthorizedCount}</span>
          </div>
        </div>

        {/* Approaching */}
        <div className="p-3.5 rounded-xl bg-[#09111e] border border-slate-800/90 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Approaching</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-bold font-mono ${approachingCount > 0 ? 'text-amber-400' : 'text-slate-100'}`}>
              {approachingCount}
            </span>
            <span className="text-[10px] text-slate-500">near zone</span>
          </div>
        </div>

        {/* Active Intrusions */}
        <div className={`p-3.5 rounded-xl bg-[#09111e] border shadow transition-all ${
          activeIntrusionsCount > 0
            ? 'border-red-500/60 bg-red-950/20 critical-glow'
            : 'border-slate-800/90'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Active Intrusions</span>
            <AlertOctagon className={`w-4 h-4 ${activeIntrusionsCount > 0 ? 'text-red-500 animate-bounce' : 'text-slate-500'}`} />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-bold font-mono ${activeIntrusionsCount > 0 ? 'text-red-400' : 'text-slate-100'}`}>
              {activeIntrusionsCount}
            </span>
            {activeIntrusionsCount > 0 && (
              <span className="text-[10px] font-mono text-red-400 uppercase font-bold animate-pulse">
                CRITICAL
              </span>
            )}
          </div>
        </div>

        {/* Active Alerts */}
        <div className="p-3.5 rounded-xl bg-[#09111e] border border-slate-800/90 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Active Alerts</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-100">{activeAlerts.length}</span>
            <span className="text-[10px] text-slate-500 font-mono">unresolved</span>
          </div>
        </div>

        {/* Open Incidents */}
        <div className="p-3.5 rounded-xl bg-[#09111e] border border-slate-800/90 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Open Incidents</span>
            <FileWarning className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-cyan-400">{openIncidents.length}</span>
            <span className="text-[10px] text-slate-500 font-mono">{zones.length} zones</span>
          </div>
        </div>
      </div>

      {/* Main Tactical Map Preview & Operational Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tactical Map View (Takes 2 Columns) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Tactical Offshore Map (Live Kanyakumari Sector)
              </h2>
            </div>
            <Link
              to="/monitoring"
              className="flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              <span>Full Screen Deck</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <MaritimeMap
            vessels={vessels}
            zones={zones}
            height="460px"
            zoomLevel={11}
          />
        </div>

        {/* Live Alerts & Incident Streams (Takes 1 Column) */}
        <div className="space-y-6">
          {/* Active Alerts Dispatch Box */}
          <div className="p-4 rounded-xl bg-[#09111e] border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Live Alert Stream ({activeAlerts.length})
                </h3>
              </div>
              <Link to="/alerts" className="text-[11px] text-cyan-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {activeAlerts.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No active alerts. All offshore sectors secure.
                </div>
              ) : (
                activeAlerts.slice(0, 4).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-2.5 rounded-lg border transition-all ${
                      alert.severity === 'critical'
                        ? 'bg-red-950/30 border-red-500/50 critical-glow'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                          alert.severity === 'critical'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(alert.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-snug line-clamp-2">
                      {alert.message}
                    </p>
                    {alert.status === 'new' && (
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="text-[10px] font-semibold px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded border border-slate-700"
                        >
                          Acknowledge
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Incidents Summary Box */}
          <div className="p-4 rounded-xl bg-[#09111e] border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileWarning className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Recent Incidents ({openIncidents.length})
                </h3>
              </div>
              <Link to="/incidents" className="text-[11px] text-cyan-400 hover:underline">
                Manage
              </Link>
            </div>

            <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
              {incidents.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No incidents logged.
                </div>
              ) : (
                incidents.slice(0, 3).map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => navigate('/incidents')}
                    className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-cyan-400">{inc.id}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                          inc.status === 'open'
                            ? 'bg-red-500/20 text-red-400'
                            : inc.status === 'investigating'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {inc.status}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-200 truncate">{inc.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      {inc.timeline.length} timeline events • {new Date(inc.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
