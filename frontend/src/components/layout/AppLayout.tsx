import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useMonitoring } from '../../context/MonitoringContext';
import { AlertOctagon, X, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const {
    activeIntrusionNotification,
    dismissIntrusionNotification,
    acknowledgeAlert
  } = useMonitoring();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#060b13] text-slate-100">
      <Navbar />

      {/* Critical Intrusion Banner (Real-Time Notification) */}
      {activeIntrusionNotification && (
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-b border-red-500/60 px-4 py-2.5 flex items-center justify-between z-40 animate-pulse-fast critical-glow">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-red-600/30 border border-red-500 flex items-center justify-center text-red-300 shrink-0">
              <AlertOctagon className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider text-red-200 bg-red-600 px-1.5 py-0.5 rounded font-mono">
                  CRITICAL INTRUSION
                </span>
                <span className="text-xs font-bold text-white truncate">
                  Unauthorized Vessel {activeIntrusionNotification.vessel.name} ({activeIntrusionNotification.vessel.id})
                </span>
              </div>
              <p className="text-[11px] text-red-200/90 font-mono">
                Crossed restricted boundary into {activeIntrusionNotification.zoneName} at {activeIntrusionNotification.vessel.latitude.toFixed(4)}°N, {activeIntrusionNotification.vessel.longitude.toFixed(4)}°E
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => {
                acknowledgeAlert(activeIntrusionNotification.alert.id);
                dismissIntrusionNotification();
              }}
              className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold bg-red-800/80 hover:bg-red-700 text-white rounded border border-red-400/50 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Acknowledge</span>
            </button>
            <button
              onClick={() => {
                dismissIntrusionNotification();
                navigate('/incidents');
              }}
              className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 text-slate-200 rounded border border-slate-700 transition-colors"
            >
              <span>Incident Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={dismissIntrusionNotification}
              className="p-1 text-red-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[#060b13] p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
