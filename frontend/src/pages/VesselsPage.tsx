import React, { useState } from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { useAuth } from '../context/AuthContext';
import { IVessel, VesselType, AuthorizationStatus } from '../types';
import {
  Ship,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import api from '../services/api';

export const VesselsPage: React.FC = () => {
  const { vessels, refreshAll } = useMonitoring();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [authFilter, setAuthFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Add Vessel Form State
  const [newId, setNewId] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newType, setNewType] = useState<VesselType>('Fishing Boat');
  const [newReg, setNewReg] = useState<string>('');
  const [newOwner, setNewOwner] = useState<string>('');
  const [newAuth, setNewAuth] = useState<AuthorizationStatus>('authorized');
  const [newLat, setNewLat] = useState<number>(8.02);
  const [newLon, setNewLon] = useState<number>(77.55);

  const isAdmin = user?.role === 'admin';

  const filteredVessels = vessels.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.owner.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAuth = authFilter === 'all' || v.authorizationStatus === authFilter;

    return matchesSearch && matchesAuth;
  });

  const handleToggleAuthorization = async (vessel: IVessel) => {
    const nextAuth: AuthorizationStatus =
      vessel.authorizationStatus === 'authorized' ? 'unauthorized' : 'authorized';
    try {
      await api.put(`/vessels/${vessel.id}/authorization`, { authorizationStatus: nextAuth });
      await refreshAll();
    } catch (err) {
      console.error('Failed to change authorization status', err);
    }
  };

  const handleDeleteVessel = async (id: string) => {
    if (!window.confirm(`Are you sure you want to remove vessel ${id}?`)) return;
    try {
      await api.delete(`/vessels/${id}`);
      await refreshAll();
    } catch (err) {
      console.error('Failed to delete vessel', err);
    }
  };

  const handleCreateVessel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/vessels', {
        id: newId,
        name: newName,
        type: newType,
        registrationNumber: newReg,
        owner: newOwner,
        authorizationStatus: newAuth,
        latitude: newLat,
        longitude: newLon,
        speed: 12.0,
        heading: 90
      });
      setShowAddModal(false);
      await refreshAll();
    } catch (err) {
      alert('Failed to create vessel: ' + (err as any).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0a1120] border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Ship className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 font-mono">
              Vessels Fleet Registry
            </h1>
            <p className="text-xs text-slate-400">
              Manage maritime vessels, authorizations, and identification data
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-cyan-950/50"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Vessel</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#09111e] border border-slate-800 shadow">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search vessels by ID, name, registration, owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={authFilter}
            onChange={(e) => setAuthFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Authorizations</option>
            <option value="authorized">Authorized Only</option>
            <option value="unauthorized">Unauthorized / Rogue</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Vessels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVessels.map((vessel) => {
          const isAuthorized = vessel.authorizationStatus === 'authorized';
          const isCritical = vessel.status === 'intrusion';

          return (
            <div
              key={vessel.id}
              className={`p-4 rounded-xl border transition-all ${
                isCritical
                  ? 'bg-red-950/20 border-red-500/50 critical-glow'
                  : 'bg-[#09111e] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between pb-3 mb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-cyan-400 text-sm">
                      {vessel.id}
                    </span>
                    <span className="text-[11px] text-slate-400">• {vessel.type}</span>
                  </div>
                  <h3 className="font-semibold text-slate-100 text-sm mt-0.5">{vessel.name}</h3>
                </div>

                <span
                  className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded uppercase ${
                    isAuthorized
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}
                >
                  {vessel.authorizationStatus}
                </span>
              </div>

              {/* Details & Telemetry */}
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px]">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Coordinates</span>
                    <span className="text-cyan-400 font-semibold">
                      {vessel.latitude.toFixed(3)}°N, {vessel.longitude.toFixed(3)}°E
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase">Speed / Heading</span>
                    <span className="text-slate-200 font-semibold">
                      {vessel.speed.toFixed(1)} kts @ {vessel.heading}°
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-slate-300 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Registration:</span>
                    <span className="font-mono text-slate-200">{vessel.registrationNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Owner:</span>
                    <span className="text-slate-200 truncate max-w-[170px]" title={vessel.owner}>
                      {vessel.owner}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Status:</span>
                    <span
                      className={`font-bold font-mono uppercase ${
                        isCritical
                          ? 'text-red-400 animate-pulse'
                          : vessel.status === 'approaching'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {vessel.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                {isAdmin && (
                  <button
                    onClick={() => handleToggleAuthorization(vessel)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded border transition-colors ${
                      isAuthorized
                        ? 'bg-red-950/40 border-red-500/40 text-red-300 hover:bg-red-900/50'
                        : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                    }`}
                  >
                    {isAuthorized ? 'Revoke Auth' : 'Authorize Vessel'}
                  </button>
                )}

                {isAdmin && (
                  <button
                    onClick={() => handleDeleteVessel(vessel.id)}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                    title="Delete Vessel"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Vessel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0c1424] border border-slate-700 rounded-xl shadow-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Ship className="w-4 h-4 text-cyan-400" />
              <span>Register New Coastal Vessel</span>
            </h2>

            <form onSubmit={handleCreateVessel} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Vessel ID (e.g. V009)</label>
                  <input
                    type="text"
                    required
                    placeholder="V009"
                    value={newId}
                    onChange={(e) => setNewId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as VesselType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Patrol Boat">Patrol Boat</option>
                    <option value="Fishing Boat">Fishing Boat</option>
                    <option value="Cargo Ship">Cargo Ship</option>
                    <option value="Passenger Ferry">Passenger Ferry</option>
                    <option value="Speed Boat">Speed Boat</option>
                    <option value="Rescue Boat">Rescue Boat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Vessel Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kumari Pearl Trawler"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Registration</label>
                  <input
                    type="text"
                    placeholder="TN-07-XX-9901"
                    value={newReg}
                    onChange={(e) => setNewReg(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Authorization</label>
                  <select
                    value={newAuth}
                    onChange={(e) => setNewAuth(e.target.value as AuthorizationStatus)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="authorized">Authorized</option>
                    <option value="unauthorized">Unauthorized</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Owner / Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Coastal Maritime Cooperative"
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
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
                  Register Vessel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
