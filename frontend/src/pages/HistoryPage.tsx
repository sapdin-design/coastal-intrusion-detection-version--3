import React, { useState, useEffect } from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { ILocationLog, IVessel } from '../types';
import {
  History,
  Play,
  Pause,
  RotateCcw,
  Navigation,
  Gauge,
  Calendar,
  Compass,
  Ship,
  TrendingUp
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import api from '../services/api';
import { MaritimeMap } from '../components/map/MaritimeMap';

export const HistoryPage: React.FC = () => {
  const { vessels, zones } = useMonitoring();
  const [selectedVesselId, setSelectedVesselId] = useState<string>(vessels[0]?.id || 'V005');
  const [locationLogs, setLocationLogs] = useState<ILocationLog[]>([]);
  const [playbackIndex, setPlaybackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const selectedVessel = vessels.find((v) => v.id === selectedVesselId) || vessels[0];

  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedVesselId) return;
      setIsLoading(true);
      try {
        const res = await api.get(`/vessels/${selectedVesselId}/locations?limit=100`);
        const logs: ILocationLog[] = res.data.data || [];
        setLocationLogs(logs);
        setPlaybackIndex(logs.length > 0 ? logs.length - 1 : 0);
      } catch (err) {
        console.error('Failed to fetch history', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [selectedVesselId]);

  // Route playback timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && locationLogs.length > 0) {
      timer = setInterval(() => {
        setPlaybackIndex((prev) => {
          if (prev >= locationLogs.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 800);
    }
    return () => clearInterval(timer);
  }, [isPlaying, locationLogs]);

  const currentPoint = locationLogs[playbackIndex] || (selectedVessel ? {
    latitude: selectedVessel.latitude,
    longitude: selectedVessel.longitude,
    speed: selectedVessel.speed,
    heading: selectedVessel.heading,
    status: selectedVessel.status,
    timestamp: selectedVessel.lastSeen
  } : null);

  // Prepare Recharts chart data
  const chartData = locationLogs.map((log, idx) => ({
    index: idx + 1,
    time: new Date(log.timestamp).toLocaleTimeString(),
    speed: log.speed,
    heading: log.heading,
    status: log.status
  }));

  // Reconstructed simulated historical vessel object for map rendering
  const historicalVesselSnapshot: IVessel[] = currentPoint && selectedVessel ? [
    {
      ...selectedVessel,
      latitude: currentPoint.latitude,
      longitude: currentPoint.longitude,
      speed: currentPoint.speed,
      heading: currentPoint.heading,
      status: currentPoint.status
    }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0a1120] border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 font-mono">
              Vessel Historical Track & Route Replay
            </h1>
            <p className="text-xs text-slate-400">
              Audit trails, historical GNSS coordinates, and route reconstruction
            </p>
          </div>
        </div>

        {/* Vessel Selector Dropdown */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-mono">Inspect Vessel:</span>
          <select
            value={selectedVesselId}
            onChange={(e) => setSelectedVesselId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-cyan-400 font-mono font-bold focus:outline-none focus:border-cyan-500"
          >
            {vessels.map((v) => (
              <option key={v.id} value={v.id}>
                {v.id} — {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Replay Controls & Map + Telemetry Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map & Playback Slider (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <MaritimeMap
            vessels={historicalVesselSnapshot}
            zones={zones}
            height="380px"
            zoomLevel={11}
          />

          {/* Route Playback Scrubbing Console */}
          <div className="p-4 rounded-xl bg-[#09111e] border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 font-mono text-xs text-slate-300">
                <span>Waypoint:</span>
                <span className="text-cyan-400 font-bold">
                  {playbackIndex + 1} / {Math.max(1, locationLogs.length)}
                </span>
                {currentPoint && (
                  <span className="text-slate-500 text-[11px]">
                    ({new Date(currentPoint.timestamp).toLocaleTimeString()})
                  </span>
                )}
              </div>

              {/* Play / Pause / Reset Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 py-1 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 rounded text-xs font-semibold flex items-center space-x-1"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-cyan-400" />}
                  <span>{isPlaying ? 'Pause' : 'Replay'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setPlaybackIndex(0);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-200"
                  title="Reset to Start"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Time Scrubber Slider */}
            <input
              type="range"
              min={0}
              max={Math.max(0, locationLogs.length - 1)}
              value={playbackIndex}
              onChange={(e) => setPlaybackIndex(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>

        {/* Telemetry Charts (1 Column) */}
        <div className="space-y-4">
          {/* Speed Chart */}
          <div className="p-4 rounded-xl bg-[#09111e] border border-slate-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span>Speed Profile (Knots)</span>
              </span>
              <span className="font-mono text-cyan-400 font-bold">
                {currentPoint?.speed.toFixed(1) || 0} kts
              </span>
            </div>

            <div className="h-36 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" hide />
                    <YAxis stroke="#64748b" fontSize={10} domain={[0, 'auto']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0c1424', borderColor: '#334155', fontSize: '11px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="speed"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  No telemetry logged yet.
                </div>
              )}
            </div>
          </div>

          {/* Heading Compass Chart */}
          <div className="p-4 rounded-xl bg-[#09111e] border border-slate-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>Heading Orientation (Degrees)</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {currentPoint?.heading || 0}°
              </span>
            </div>

            <div className="h-36 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" hide />
                    <YAxis stroke="#64748b" fontSize={10} domain={[0, 360]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0c1424', borderColor: '#334155', fontSize: '11px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="heading"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  No telemetry logged yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
