import React, { useState } from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { useAuth } from '../context/AuthContext';
import { IZone, ZoneType, SeverityLevel } from '../types';
import {
  ShieldAlert,
  Plus,
  Trash2,
  MapPin,
  AlertTriangle,
  Info,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';

export const ZonesPage: React.FC = () => {
  const { zones, refreshAll } = useMonitoring();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newId, setNewId] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newType, setNewType] = useState<ZoneType>('security');
  const [newSeverity, setNewSeverity] = useState<SeverityLevel>('critical');
  const [newWarningDist, setNewWarningDist] = useState<number>(1500);

  // Default offshore polygon coordinates in Gulf of Mannar
  const [coordsStr, setCoordsStr] = useState<string>(
    `77.5300, 7.9700\n77.6200, 7.9700\n77.6200, 8.0300\n77.5300, 8.0300`
  );

  const handleDeleteZone = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete zone ${id}?`)) return;
    try {
      await api.delete(`/zones/${id}`);
      await refreshAll();
    } catch (err) {
      console.error('Failed to delete zone', err);
    }
  };

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Parse coordinates [lon, lat]
      const lines = coordsStr.trim().split('\n');
      const ring: [number, number][] = lines.map((line) => {
        const [lon, lat] = line.split(',').map((s) => parseFloat(s.trim()));
        return [lon, lat];
      });

      // Ensure ring is closed
      if (
        ring.length > 0 &&
        (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])
      ) {
        ring.push([...ring[0]]);
      }

      await api.post('/zones', {
        id: newId || undefined,
        name: newName,
        description: newDesc,
        zoneType: newType,
        severity: newSeverity,
        warningDistance: newWarningDist,
        geometry: {
          type: 'Polygon',
          coordinates: [ring]
        },
        status: 'active'
      });

      setShowAddModal(false);
      await refreshAll();
    } catch (err) {
      alert('Failed to create zone: ' + (err as any).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0a1120] border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 font-mono">
              Restricted Maritime Zones
            </h1>
            <p className="text-xs text-slate-400">
              Offshore geofenced corridors, defense sectors, and marine sanctuaries
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-cyan-950/50"
          >
            <Plus className="w-4 h-4" />
            <span>Define Restricted Zone</span>
          </button>
        )}
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {zones.map((zone) => {
          const isCritical = zone.severity === 'critical';
          const ring = zone.geometry.coordinates[0];

          return (
            <div
              key={zone.id}
              className={`p-4 rounded-xl border transition-all ${
                isCritical
                  ? 'bg-red-950/20 border-red-500/40'
                  : 'bg-[#09111e] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-cyan-400 text-sm">{zone.id}</span>
                    <span className="text-[11px] text-slate-400 uppercase font-mono">• {zone.zoneType}</span>
                  </div>
                  <h3 className="font-semibold text-slate-100 text-sm mt-0.5">{zone.name}</h3>
                </div>

                <span
                  className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded uppercase ${
                    isCritical
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : zone.severity === 'high'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  }`}
                >
                  {zone.severity}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-3">{zone.description}</p>

              {/* GeoJSON Geometry Stats */}
              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Warning Distance Buffer:</span>
                  <span className="text-amber-400 font-bold">{zone.warningDistance} meters</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Geometry Polygon Vertices:</span>
                  <span className="text-slate-200">{ring.length} points</span>
                </div>
                <div className="pt-1 border-t border-slate-800/80 text-[10px] text-slate-500 truncate">
                  SW: {ring[0]?.[1]?.toFixed(3)}°N, {ring[0]?.[0]?.toFixed(3)}°E
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[10px]">
                  Created: {new Date(zone.createdAt).toLocaleDateString()}
                </span>

                {isAdmin && (
                  <button
                    onClick={() => handleDeleteZone(zone.id)}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                    title="Delete Zone"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Zone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0c1424] border border-slate-700 rounded-xl shadow-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <span>Define Offshore Restricted Zone</span>
            </h2>

            <form onSubmit={handleCreateZone} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Zone ID (e.g. Z004)</label>
                  <input
                    type="text"
                    placeholder="Z004"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Zone Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ZoneType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="security">Security</option>
                    <option value="restricted">Restricted</option>
                    <option value="protected">Protected Sanctuary</option>
                    <option value="no-entry">No-Entry Perimeter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Zone Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kanyakumari Naval Defense Sector Alpha"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Operational rationale and legal maritime restrictions..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Threat Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as SeverityLevel)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Warning Buffer (Meters)</label>
                  <input
                    type="number"
                    value={newWarningDist}
                    onChange={(e) => setNewWarningDist(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1 font-mono">
                  Offshore Polygon Coordinates (One "lon, lat" pair per line):
                </label>
                <textarea
                  rows={4}
                  required
                  value={coordsStr}
                  onChange={(e) => setCoordsStr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-cyan-400 font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-900 text-slate-300 hover:bg-slate-800 rounded font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded font-bold text-xs transition-colors"
                >
                  Create Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
