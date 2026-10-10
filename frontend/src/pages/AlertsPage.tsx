import React, { useState } from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { IAlert, SeverityLevel, AlertStatus } from '../types';
import {
  BellRing,
  CheckCircle2,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Filter,
  Search,
  Volume2,
  VolumeX,
  Clock,
  Shield,
  MapPin
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const {
    alerts,
    acknowledgeAlert,
    resolveAlert,
    isAudioMuted,
    toggleAudioMute
  } = useMonitoring();

  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    const matchesSearch =
      alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.vesselName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSeverity && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0a1120] border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 font-mono">
              Alerts Dispatch Center
            </h1>
            <p className="text-xs text-slate-400">
              Real-time geofence breaches, zone approach alarms, and security alerts
            </p>
          </div>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={toggleAudioMute}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
            isAudioMuted
              ? 'bg-slate-900 border-slate-700 text-slate-400'
              : 'bg-cyan-950/40 border-cyan-500/50 text-cyan-400'
          }`}
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span>{isAudioMuted ? 'Sound Alarms Muted' : 'Audio Alarms Active'}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#09111e] border border-slate-800 shadow">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search alerts by vessel, zone, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Statuses</option>
            <option value="new">New (Unacknowledged)</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 font-mono bg-[#09111e] rounded-xl border border-slate-800">
            No maritime alerts match the selected criteria.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'critical';
            const isNew = alert.status === 'new';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isCritical && isNew
                    ? 'bg-red-950/30 border-red-500/50 critical-glow'
                    : isNew
                    ? 'bg-[#0c1527] border-amber-500/40'
                    : 'bg-[#09111e] border-slate-800/80 opacity-90'
                }`}
              >
                {/* Left info */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono font-bold text-xs text-cyan-400">{alert.id}</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        isCritical
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : alert.severity === 'high'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase bg-slate-900 px-1.5 py-0.5 rounded">
                      {alert.alertType}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase ${
                        alert.status === 'new'
                          ? 'text-red-400 font-bold animate-pulse'
                          : alert.status === 'acknowledged'
                          ? 'text-amber-400 font-semibold'
                          : 'text-emerald-400'
                      }`}
                    >
                      • {alert.status}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-100 leading-snug">{alert.message}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 font-mono pt-1">
                    <div>
                      Coords: <span className="text-cyan-400">{alert.latitude.toFixed(4)}°N, {alert.longitude.toFixed(4)}°E</span>
                    </div>
                    <div>
                      Logged: <span className="text-slate-300">{new Date(alert.createdAt).toLocaleTimeString()}</span>
                    </div>
                    {alert.acknowledgedBy && (
                      <div>
                        Ack by: <span className="text-amber-400">{alert.acknowledgedBy}</span>
                      </div>
                    )}
                    {alert.resolvedBy && (
                      <div>
                        Resolved by: <span className="text-emerald-400">{alert.resolvedBy}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center space-x-2 shrink-0">
                  {alert.status === 'new' && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-3 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 font-semibold text-xs transition-colors flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Acknowledge</span>
                    </button>
                  )}

                  {alert.status !== 'resolved' && (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 font-semibold text-xs transition-colors flex items-center space-x-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
