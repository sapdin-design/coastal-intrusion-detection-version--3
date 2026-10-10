import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Ship,
  ShieldAlert,
  BellRing,
  FileWarning,
  History,
  BarChart3,
  Cpu,
  HeartPulse,
  Settings
} from 'lucide-react';
import { useMonitoring } from '../../context/MonitoringContext';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  badgeCount?: number;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { alerts, incidents } = useMonitoring();

  const activeAlertsCount = alerts.filter((a) => a.status !== 'resolved').length;
  const openIncidentsCount = incidents.filter((i) => i.status === 'open' || i.status === 'investigating').length;

  const navItems: NavItem[] = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/monitoring', label: 'Live Monitoring', icon: Compass },
    { to: '/simulator', label: 'GPS Simulator', icon: Cpu },
    { to: '/vessels', label: 'Vessels Fleet', icon: Ship },
    { to: '/zones', label: 'Restricted Zones', icon: ShieldAlert },
    {
      to: '/alerts',
      label: 'Alerts Dispatch',
      icon: BellRing,
      badgeCount: activeAlertsCount,
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    },
    {
      to: '/incidents',
      label: 'Incidents',
      icon: FileWarning,
      badgeCount: openIncidentsCount,
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30'
    },
    { to: '/history', label: 'Vessel History', icon: History },
    { to: '/analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { to: '/system-health', label: 'System Health & AI', icon: HeartPulse }
  ];

  return (
    <aside className="w-64 bg-[#080e1a] border-r border-slate-800/80 flex flex-col h-[calc(100vh-4rem)] select-none shrink-0">
      {/* Sector Badge */}
      <div className="p-3 mx-3 my-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center space-x-3">
        <div className="w-8 h-8 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold text-xs">
          TN-KK
        </div>
        <div className="overflow-hidden">
          <p className="text-xs font-semibold text-slate-200 truncate">Kanyakumari Sector</p>
          <p className="text-[10px] text-cyan-400/80 font-mono uppercase">Tactical Maritime</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badgeCount !== undefined && item.badgeCount > 0 && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                    item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badgeCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Mini Simulation Status Card in Sidebar Footer */}
      <div className="p-3 m-3 rounded-lg bg-[#0c1424] border border-slate-800 text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
            GNSS Simulator
          </span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
        </div>
        <p className="text-[11px] text-slate-300 font-medium">Offshore Virtual Waypoints</p>
        <p className="text-[10px] text-slate-500 font-mono mt-0.5">Coords: 7.85°N – 8.10°N</p>
      </div>
    </aside>
  );
};
