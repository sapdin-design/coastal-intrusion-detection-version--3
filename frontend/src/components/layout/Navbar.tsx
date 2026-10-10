import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMonitoring } from '../../context/MonitoringContext';
import {
  Radio,
  Bell,
  Volume2,
  VolumeX,
  User,
  LogOut,
  Shield,
  Activity,
  AlertTriangle,
  Play,
  RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    alerts,
    stats,
    simulator,
    isAudioMuted,
    toggleAudioMute,
    startSimulation,
    resetSimulation
  } = useMonitoring();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentUtc, setCurrentUtc] = useState<string>('');
  const [showAlertsDropdown, setShowAlertsDropdown] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
      setCurrentUtc(
        now.toLocaleTimeString('en-GB', {
          timeZone: 'UTC',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }) + ' UTC'
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeAlerts = alerts.filter((a) => a.status !== 'resolved');
  const criticalCount = alerts.filter((a) => a.severity === 'critical' && a.status !== 'resolved').length;

  return (
    <header className="h-16 bg-[#09111e]/90 backdrop-blur border-b border-slate-800/80 px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Brand & Sector Header */}
      <div className="flex items-center space-x-3">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold tracking-wider text-base text-slate-100 font-mono">
                CIDRTM
              </span>
              {/* Prominent SIMULATION MODE Banner as mandated by PRD */}
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                SIMULATION MODE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Kanyakumari Sector <span className="font-mono text-cyan-400/90">(8.078°N, 77.555°E)</span>
            </p>
          </div>
        </Link>
      </div>

      {/* Center Status Indicators & Time */}
      <div className="hidden lg:flex items-center space-x-6 text-xs">
        {/* System Health */}
        <div className="flex items-center space-x-2 px-2.5 py-1 rounded bg-slate-900/60 border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="text-slate-400">System:</span>
          <span className="text-emerald-400 font-mono font-medium">OPERATIONAL</span>
        </div>

        {/* Live Simulator Ticker */}
        <div className="flex items-center space-x-2 px-2.5 py-1 rounded bg-slate-900/60 border border-slate-800 font-mono">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Sim:</span>
          <span
            className={
              simulator.isRunning
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-500 font-semibold'
            }
          >
            {simulator.isRunning ? `${simulator.speedMultiplier}x RUNNING` : 'STANDBY'}
          </span>
        </div>

        {/* Live Clock IST & UTC */}
        <div className="flex items-center space-x-3 px-3 py-1 rounded bg-slate-950/80 border border-slate-800/80 font-mono text-xs">
          <div className="text-slate-400">
            IST <span className="text-slate-200 font-semibold">{currentTime}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="text-slate-400">
            {currentUtc}
          </div>
        </div>
      </div>

      {/* Right Controls & User Info */}
      <div className="flex items-center space-x-3">
        {/* Quick Intrusion Demo Button */}
        <button
          onClick={() => startSimulation('intrusion_demo', 2)}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-red-950/40 border border-red-500/40 text-red-300 hover:bg-red-900/50 hover:border-red-400 transition-all shadow-[0_0_10px_rgba(239,68,68,0.15)]"
          title="Instantly launch the primary Intrusion Demo scenario"
        >
          <Play className="w-3.5 h-3.5 fill-red-400 text-red-400" />
          <span>Launch Intrusion Demo</span>
        </button>

        {/* Audio Mute Toggle */}
        <button
          onClick={toggleAudioMute}
          className={`p-2 rounded-md border transition-colors ${
            isAudioMuted
              ? 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'
              : 'bg-cyan-950/30 border-cyan-500/40 text-cyan-400 hover:border-cyan-400'
          }`}
          title={isAudioMuted ? 'Unmute Audio Alarms' : 'Mute Audio Alarms'}
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Alerts Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className={`relative p-2 rounded-md border transition-colors ${
              criticalCount > 0
                ? 'bg-red-950/50 border-red-500/60 text-red-400 critical-glow'
                : activeAlerts.length > 0
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-400'
                : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Bell className={`w-4 h-4 ${criticalCount > 0 ? 'animate-bounce' : ''}`} />
            {activeAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-[10px] font-bold font-mono text-white flex items-center justify-center">
                {activeAlerts.length > 9 ? '9+' : activeAlerts.length}
              </span>
            )}
          </button>

          {/* Alerts Dropdown Modal */}
          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0c1424] border border-slate-800 rounded-lg shadow-2xl z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Live Tactical Alerts ({activeAlerts.length})
                  </span>
                </div>
                <Link
                  to="/alerts"
                  onClick={() => setShowAlertsDropdown(false)}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                {activeAlerts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No active maritime alerts. All sectors secure.
                  </div>
                ) : (
                  activeAlerts.slice(0, 5).map((a) => (
                    <div key={a.id} className="p-3 hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                            a.severity === 'critical'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {a.severity}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(a.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 line-clamp-2">{a.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-none">
              {user?.name || 'Operator Murugan'}
            </p>
            <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider mt-0.5">
              {user?.role === 'admin' ? 'ADMINISTRATOR' : 'OPERATOR'}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-red-400 transition-colors ml-1"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
