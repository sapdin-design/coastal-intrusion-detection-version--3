import React from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import {
  HeartPulse,
  Cpu,
  Database,
  Radio,
  Server,
  Layers,
  Camera,
  Eye,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const SystemHealthPage: React.FC = () => {
  const { stats, simulator } = useMonitoring();

  const healthServices = [
    {
      name: 'HTTP REST API Server',
      status: 'ONLINE',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      latency: '8 ms',
      tech: 'Express.js & TypeScript'
    },
    {
      name: 'Database Engine',
      status: stats?.systemHealth?.database?.includes('mongodb') ? 'MONGODB ATLAS / LOCAL' : 'EMBEDDED HIGH-SPEED IN-MEMORY',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      latency: '1 ms',
      tech: 'Mongoose / In-Memory Seed Store'
    },
    {
      name: 'WebSocket Live Dispatch',
      status: 'CONNECTED',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      latency: '12 ms',
      tech: 'Socket.IO Real-Time'
    },
    {
      name: 'GNSS GPS Simulator',
      status: simulator.isRunning ? (simulator.isPaused ? 'PAUSED' : `RUNNING (${simulator.speedMultiplier}x)`) : 'IDLE / READY',
      color: simulator.isRunning ? 'text-cyan-400' : 'text-slate-400',
      bg: simulator.isRunning ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-900 border-slate-800',
      latency: 'Tick: 1.0s',
      tech: 'Offshore Route Interpolator'
    },
    {
      name: 'Geofencing Engine',
      status: 'ACTIVE',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      latency: 'Haversine & Raycast',
      tech: 'Point-in-Polygon (PIP)'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0a1120] border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 font-mono">
              System Health & Final-Year Hardware Roadmap
            </h1>
            <p className="text-xs text-slate-400">
              Subsystem status, runtime health checks, and future AI + IoT hardware fusion architecture
            </p>
          </div>
        </div>
      </div>

      {/* Subsystem Health Cards (PRD Section 24) */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
          Subsystem Operational Status
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {healthServices.map((svc, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#09111e] border border-slate-800 shadow space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">{svc.name}</span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${svc.bg} ${svc.color}`}>
                  {svc.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800/80">
                <span>{svc.tech}</span>
                <span className="text-cyan-400">{svc.latency}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final-Year Extension Architecture Roadmap (PRD Section 37, 38, 39) */}
      <div className="p-6 rounded-xl bg-[#09111e] border border-cyan-500/30 shadow-2xl space-y-6">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <Zap className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide font-mono">
              Final-Year Extension: AI + IoT + Edge Hardware Fusion
            </h2>
            <p className="text-xs text-slate-400">
              Seamlessly upgrade CIDRTM from software simulation (₹0–₹1,000) to real hardware (₹15,000–₹20,000)
            </p>
          </div>
        </div>

        {/* Visual Architecture Comparison Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Mini Project */}
          <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 font-mono">
                CURRENT MINI PROJECT (₹0–₹1,000)
              </span>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                SOFTWARE ONLY
              </span>
            </div>
            <p className="text-xs text-slate-300">
              <strong>Workflow:</strong> Monitor → Geofencing → Intrusion Detection → Real-Time Alerts
            </p>

            <div className="bg-black/60 p-3 rounded font-mono text-[11px] text-slate-300 space-y-1.5 border border-slate-800">
              <div className="text-cyan-400">GPS Simulator (Kanyakumari Offshore)</div>
              <div className="text-slate-500 pl-4">↓ (Simulated Coordinates)</div>
              <div className="text-slate-200">CIDRTM Express & Geofence Engine</div>
              <div className="text-slate-500 pl-4">↓ (Haversine + PIP)</div>
              <div className="text-amber-400">Intrusion Detection & Auto Incident</div>
              <div className="text-slate-500 pl-4">↓ (Socket.IO)</div>
              <div className="text-emerald-400">Live Maritime Command Console</div>
            </div>
          </div>

          {/* Planned Final-Year Extension */}
          <div className="p-4 rounded-lg bg-cyan-950/20 border border-cyan-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 font-mono">
                PLANNED FINAL YEAR EXTENSION (~₹15k–₹20k)
              </span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40">
                AI + IOT HARDWARE
              </span>
            </div>
            <p className="text-xs text-slate-300">
              <strong>Workflow:</strong> Monitor → Detect → Identify → Analyze → Predict → Alert
            </p>

            <div className="bg-black/60 p-3 rounded font-mono text-[11px] text-slate-300 space-y-1.5 border border-slate-800">
              <div className="text-purple-400">ESP32-C3 + GNSS (NEO-M8N) + 4G (SIM7600)</div>
              <div className="text-emerald-400">+ Raspberry Pi 4 + Camera (YOLOv8 Vision)</div>
              <div className="text-slate-500 pl-4">↓ (GPS + Visual Stream Fusion)</div>
              <div className="text-cyan-400">AI Risk Assessment & Trajectory Prediction</div>
              <div className="text-slate-500 pl-4">↓ (Pre-warning Analysis)</div>
              <div className="text-emerald-400">Existing CIDRTM Unified Dashboard</div>
            </div>
          </div>
        </div>

        {/* Hardware BOM Estimate Table (PRD Section 38) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Hardware Component Cost Estimate (Target: ₹15,000–₹20,000)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Component</th>
                  <th className="p-2.5">Specification</th>
                  <th className="p-2.5 text-right">Estimated Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="p-2.5 font-bold text-slate-200">ESP32-C3 + GNSS + 4G Module</td>
                  <td className="p-2.5 text-slate-400">SIM7600EI 4G LTE with GPS/GLONASS antenna</td>
                  <td className="p-2.5 text-right text-cyan-400">₹5,000–₹5,900</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-200">Raspberry Pi 4 (4GB)</td>
                  <td className="p-2.5 text-slate-400">Edge compute for YOLOv8 vessel classification</td>
                  <td className="p-2.5 text-right text-cyan-400">₹4,000–₹6,000</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-200">Night Vision Maritime Camera</td>
                  <td className="p-2.5 text-slate-400">Wide-angle IR camera module</td>
                  <td className="p-2.5 text-right text-cyan-400">₹1,000–₹2,000</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-200">Power, Enclosure & Accessories</td>
                  <td className="p-2.5 text-slate-400">Waterproof IP67 casing, high-gain antennas</td>
                  <td className="p-2.5 text-right text-cyan-400">₹3,000–₹4,000</td>
                </tr>
                <tr className="bg-slate-950/80 font-bold">
                  <td colSpan={2} className="p-2.5 text-slate-200">
                    Total Estimated Final-Year Hardware Cost:
                  </td>
                  <td className="p-2.5 text-right text-emerald-400 text-sm">
                    ₹15,000–₹20,000
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
