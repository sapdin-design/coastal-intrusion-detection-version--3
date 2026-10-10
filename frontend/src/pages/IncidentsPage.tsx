import React, { useState } from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { useAuth } from '../context/AuthContext';
import { IIncident, IncidentStatus } from '../types';
import {
  FileWarning,
  Clock,
  CheckCircle,
  AlertOctagon,
  User,
  Plus,
  Send,
  ArrowRight,
  Shield,
  Activity
} from 'lucide-react';
import api from '../services/api';

export const IncidentsPage: React.FC = () => {
  const { incidents, refreshAll, updateIncidentStatus } = useMonitoring();
  const { user } = useAuth();

  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || '');
  const [newNote, setNewNote] = useState<string>('');

  const selectedIncident =
    incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    if (!selectedIncident) return;
    try {
      await updateIncidentStatus(selectedIncident.id, newStatus, `Status updated to ${newStatus.toUpperCase()}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !newNote.trim()) return;

    try {
      await api.post(`/incidents/${selectedIncident.id}/notes`, {
        event: 'Operator Field Observation',
        details: newNote.trim()
      });
      setNewNote('');
      await refreshAll();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0a1120] border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <FileWarning className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 font-mono">
              Incident Response & Investigation Management
            </h1>
            <p className="text-xs text-slate-400">
              Complete maritime security incident lifecycle and chronological event timeline
            </p>
          </div>
        </div>
      </div>

      {/* Main Split: Incidents List (Left) + Detailed Incident Dossier (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incidents List (1 Column) */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Active Incidents ({incidents.length})
          </h2>

          <div className="space-y-2.5 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
            {incidents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 font-mono bg-[#09111e] rounded-xl border border-slate-800">
                No incidents created yet. Launch an Intrusion Demo to generate security incident dossiers.
              </div>
            ) : (
              incidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                const isCritical = inc.severity === 'critical';

                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : isCritical && inc.status === 'open'
                        ? 'bg-red-950/20 border-red-500/40 critical-glow'
                        : 'bg-[#09111e] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-cyan-400 text-xs">{inc.id}</span>
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          inc.status === 'open'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : inc.status === 'investigating'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {inc.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-slate-100 line-clamp-1">{inc.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">
                      Target: {inc.vesselName} ({inc.vesselId})
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {new Date(inc.createdAt).toLocaleString()}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Detailed Incident Dossier (2 Columns) */}
        {selectedIncident ? (
          <div className="lg:col-span-2 space-y-5 p-5 rounded-xl bg-[#09111e] border border-slate-800 shadow-xl">
            {/* Dossier Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-cyan-400 text-sm">
                    {selectedIncident.id}
                  </span>
                  <span className="text-xs text-slate-400">• Alert Ref: {selectedIncident.alertId}</span>
                </div>
                <h2 className="text-base font-bold text-slate-100 mt-1">{selectedIncident.title}</h2>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center space-x-1.5 font-mono text-xs">
                {(['open', 'acknowledged', 'investigating', 'resolved', 'closed'] as IncidentStatus[]).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                        selectedIncident.status === st
                          ? 'bg-cyan-500 text-slate-950 shadow'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Description & Overview */}
            <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs space-y-2">
              <p className="text-slate-200 leading-relaxed">{selectedIncident.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 font-mono text-[11px] text-slate-400">
                <div>
                  Target Vessel: <span className="text-slate-200">{selectedIncident.vesselName}</span>
                </div>
                <div>
                  Zone: <span className="text-cyan-400">{selectedIncident.zoneName || 'Z001'}</span>
                </div>
                <div>
                  Assigned Duty Officer: <span className="text-amber-400">{selectedIncident.assignedOperator || user?.name || 'Operator Murugan'}</span>
                </div>
              </div>
            </div>

            {/* Chronological Incident Timeline (PRD Section 21) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Chronological Incident Timeline & Audit Trail</span>
              </h3>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
                {selectedIncident.timeline.map((event, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-[#09111e]"></div>
                    <div className="p-3 rounded-lg bg-slate-950/90 border border-slate-800/90 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">{event.event}</span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{event.details}</p>
                      {event.operator && (
                        <p className="text-[10px] text-slate-500 font-mono">
                          Officer: {event.operator}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Operator Observation / Log Note */}
            <form onSubmit={handleAddNote} className="pt-3 border-t border-slate-800 flex space-x-2">
              <input
                type="text"
                placeholder="Add operator notes, coast guard dispatch updates, interception logs..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Log Event</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="lg:col-span-2 p-12 text-center text-xs text-slate-400 font-mono bg-[#09111e] rounded-xl border border-slate-800">
            Select an incident on the left to view timeline dossier.
          </div>
        )}
      </div>
    </div>
  );
};
