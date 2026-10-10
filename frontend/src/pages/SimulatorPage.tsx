import React, { useState } from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { SimulationScenario } from '../types';
import {
  Cpu,
  Play,
  Pause,
  RotateCcw,
  Square,
  Gauge,
  Compass,
  Navigation,
  Activity,
  Terminal,
  AlertTriangle,
  Radio,
  Send,
  CheckCircle,
  Clock
} from 'lucide-react';
import api from '../services/api';

export const SimulatorPage: React.FC = () => {
  const {
    simulator,
    vessels,
    zones,
    latestNmea,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    stopSimulation,
    resetSimulation,
    setSimulationSpeed
  } = useMonitoring();

  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario>(simulator.scenario || 'intrusion_demo');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(simulator.speedMultiplier || 1);
  const [selectedVesselId, setSelectedVesselId] = useState<string>('V005');

  // Manual coordinate injector state
  const [customLat, setCustomLat] = useState<string>('8.0000');
  const [customLon, setCustomLon] = useState<string>('77.5750');
  const [customSpeed, setCustomSpeed] = useState<string>('15');
  const [customHeading, setCustomHeading] = useState<string>('0');
  const [injectStatus, setInjectStatus] = useState<string>('');

  const targetVessel = vessels.find((v) => v.id === selectedVesselId) || vessels[0];

  const handleStart = async () => {
    await startSimulation(selectedScenario, speedMultiplier);
  };

  const handleSpeedChange = async (spd: number) => {
    setSpeedMultiplier(spd);
    if (simulator.isRunning) {
      await setSimulationSpeed(spd);
    }
  };

  const handleManualInject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setInjectStatus('Transmitting GNSS fix...');
      await api.post('/simulator/inject', {
        vesselId: selectedVesselId,
        latitude: parseFloat(customLat),
        longitude: parseFloat(customLon),
        speed: parseFloat(customSpeed),
        heading: parseFloat(customHeading)
      });
      setInjectStatus('Position Fix Injected Successfully!');
      setTimeout(() => setInjectStatus(''), 3000);
    } catch (err) {
      setInjectStatus('Injection failed.');
    }
  };

  // Scenario descriptions
  const scenarioInfo: Record<SimulationScenario, { title: string; desc: string; expectedResult: string }> = {
    intrusion_demo: {
      title: 'Scenario 2 — Intrusion Demo (Primary Academic Demonstration)',
      desc: 'Unauthorized Fishing Boat V005 departs open ocean (7.900°N), approaches offshore security zone Z001, crosses boundary (7.970°N), and triggers automated critical alarm and incident lifecycle.',
      expectedResult: 'NORMAL → APPROACHING → BOUNDARY CROSSING → INTRUSION → CRITICAL ALERT → INCIDENT CREATED'
    },
    normal_patrol: {
      title: 'Scenario 1 — Normal Patrol',
      desc: 'Authorized Coast Guard vessel V001 (Sea Guardian) conducts routine surveillance patrol along offshore corridor parallel to Cape Comorin.',
      expectedResult: 'STATUS: NORMAL (Authorized Entry & Clearance)'
    },
    multiple_vessels: {
      title: 'Scenario 3 — Multiple Independent Vessels',
      desc: 'Multiple vessels (patrol, fishing trawler, cargo carrier, passenger ferry) navigate independent offshore maritime lanes concurrently.',
      expectedResult: 'SIMULTANEOUS MULTI-VESSEL FLEET TRACKING'
    },
    zone_approach: {
      title: 'Scenario 4 — Zone Approach & Evasion',
      desc: 'High-speed suspicious vessel V006 approaches within 800m warning threshold of Z001, triggers Zone Approach Warning alert, and veers away to international waters.',
      expectedResult: 'NORMAL → APPROACHING WARNING → VEERS AWAY → CLEAR'
    },
    full_demonstration: {
      title: 'Scenario 5 — Full Coordinated Security Demonstration',
      desc: 'Multi-stage tactical escalation: fleet monitoring, unauthorized intrusion by V005, alert dispatch, automated interception vector by Coast Guard V001.',
      expectedResult: 'FULL INCIDENT LIFECYCLE & TACTICAL RESOLUTION'
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-[#0a1324] via-[#0d1a33] to-[#0a1324] border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100 font-mono">
                GPS Simulator Command Center
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                SIMULATION MODE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Generates simulated offshore GNSS telemetry for Kanyakumari coastal sector (₹0–₹1,000 Software Model)
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center space-x-3 px-3.5 py-2 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-xs">
          <div className="flex items-center space-x-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                simulator.isRunning
                  ? simulator.isPaused
                    ? 'bg-amber-500'
                    : 'bg-emerald-500 animate-ping'
                  : 'bg-slate-600'
              }`}
            ></span>
            <span className="text-slate-300 font-bold uppercase">
              {simulator.isRunning
                ? simulator.isPaused
                  ? 'PAUSED'
                  : `RUNNING (${simulator.speedMultiplier}x)`
                : 'STOPPED'}
            </span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="text-slate-400">
            Ticks: <span className="text-cyan-400 font-semibold">{simulator.currentTick}</span>
          </div>
        </div>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Config & Simulation Controls (Takes 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Simulation Control Deck */}
          <div className="p-5 rounded-xl bg-[#09111e] border border-slate-800 shadow-xl space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Simulation Execution Parameters</span>
            </h2>

            {/* Scenario Selection Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Select Simulation Scenario:
              </label>
              <select
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value as SimulationScenario)}
                disabled={simulator.isRunning}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium disabled:opacity-50"
              >
                <option value="intrusion_demo">Scenario 2 — Intrusion Demo (Primary Academic Showcase)</option>
                <option value="normal_patrol">Scenario 1 — Normal Patrol (Authorized Vessel)</option>
                <option value="zone_approach">Scenario 4 — Zone Approach & Evasion</option>
                <option value="multiple_vessels">Scenario 3 — Multiple Independent Vessels Fleet</option>
                <option value="full_demonstration">Scenario 5 — Full Coordinated Security Demonstration</option>
              </select>
            </div>

            {/* Scenario Explanation Card */}
            <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
              <p className="font-semibold text-cyan-400">{scenarioInfo[selectedScenario]?.title}</p>
              <p className="text-slate-300 leading-relaxed">{scenarioInfo[selectedScenario]?.desc}</p>
              <div className="mt-2 pt-2 border-t border-slate-800/80 font-mono text-[11px] text-amber-400/90">
                Expected Flow: {scenarioInfo[selectedScenario]?.expectedResult}
              </div>
            </div>

            {/* Target Vessel & Speed Multipliers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Vessel Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Target Vessel:</label>
                <select
                  value={selectedVesselId}
                  onChange={(e) => setSelectedVesselId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                >
                  {vessels.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.id} — {v.name} ({v.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Speed Multipliers */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Simulation Speed Multiplier:
                </label>
                <div className="grid grid-cols-4 gap-2 font-mono">
                  {[1, 2, 5, 10].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => handleSpeedChange(spd)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        speedMultiplier === spd
                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {spd}×
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800">
              {!simulator.isRunning ? (
                <button
                  onClick={handleStart}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/50 transition-colors"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>START SIMULATION</span>
                </button>
              ) : simulator.isPaused ? (
                <button
                  onClick={resumeSimulation}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>RESUME</span>
                </button>
              ) : (
                <button
                  onClick={pauseSimulation}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  <span>PAUSE</span>
                </button>
              )}

              {simulator.isRunning && (
                <button
                  onClick={stopSimulation}
                  className="py-2.5 px-4 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 font-semibold text-xs flex items-center space-x-1.5 transition-colors"
                >
                  <Square className="w-3.5 h-3.5 fill-red-400 text-red-400" />
                  <span>STOP</span>
                </button>
              )}

              <button
                onClick={resetSimulation}
                className="py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs flex items-center space-x-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESET STATE</span>
              </button>
            </div>
          </div>

          {/* Manual Telemetry Coordinate Injector (For Testing / Defense Grading) */}
          <div className="p-4 rounded-xl bg-[#09111e] border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Send className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Manual Coordinate Injection (Examiner Evaluation Tool)
                </h3>
              </div>
              {injectStatus && (
                <span className="text-[10px] font-mono text-emerald-400">{injectStatus}</span>
              )}
            </div>

            <form onSubmit={handleManualInject} className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Latitude (°N)</label>
                <input
                  type="text"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-cyan-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Longitude (°E)</label>
                <input
                  type="text"
                  value={customLon}
                  onChange={(e) => setCustomLon(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-cyan-400 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Speed (kts)</label>
                <input
                  type="text"
                  value={customSpeed}
                  onChange={(e) => setCustomSpeed(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Heading (°)</label>
                <input
                  type="text"
                  value={customHeading}
                  onChange={(e) => setCustomHeading(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-1.5 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 rounded font-semibold text-xs transition-colors"
                >
                  Inject Fix
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Live Target Telemetry & NMEA Console (Takes 1 Column) */}
        <div className="space-y-6">
          {/* Target Vessel Telemetry Gauge */}
          {targetVessel && (
            <div className="p-4 rounded-xl bg-[#09111e] border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Live Target Telemetry
                  </span>
                </div>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                    targetVessel.status === 'intrusion'
                      ? 'bg-red-500/20 text-red-400 critical-glow'
                      : targetVessel.status === 'approaching'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {targetVessel.status}
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-200">{targetVessel.name}</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  ID: {targetVessel.id} • {targetVessel.authorizationStatus.toUpperCase()}
                </p>
              </div>

              {/* Coordinates & Compass Rose Box */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Latitude</span>
                  <span className="text-cyan-400 font-semibold">{targetVessel.latitude.toFixed(4)}°N</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Longitude</span>
                  <span className="text-cyan-400 font-semibold">{targetVessel.longitude.toFixed(4)}°E</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Speed</span>
                  <span className="text-slate-100 font-semibold">{targetVessel.speed.toFixed(1)} kts</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Heading</span>
                  <span className="text-slate-100 font-semibold">{targetVessel.heading}°</span>
                </div>
              </div>

              {targetVessel.nearestZoneDistance !== undefined && (
                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between font-mono">
                  <span className="text-slate-400">Distance to Zone:</span>
                  <span className="text-amber-400 font-bold">
                    {targetVessel.nearestZoneDistance >= 1000
                      ? `${(targetVessel.nearestZoneDistance / 1000).toFixed(2)} km`
                      : `${targetVessel.nearestZoneDistance} m`}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Raw Simulated NMEA 0183 / GNSS Stream */}
          <div className="p-4 rounded-xl bg-[#09111e] border border-slate-800 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Simulated GNSS Stream
                </span>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 uppercase">4800 BAUD</span>
            </div>

            <div className="p-3 bg-black/90 rounded-lg border border-slate-900 font-mono text-[10px] text-emerald-400 space-y-1 select-text overflow-x-auto">
              {latestNmea ? (
                latestNmea.split('\n').map((line, idx) => (
                  <div key={idx} className="leading-tight">
                    {line}
                  </div>
                ))
              ) : (
                <div className="text-slate-600 italic">Awaiting GNSS satellite lock...</div>
              )}
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Standard NMEA 0183 ($GPRMC & $GPGGA) strings formatted in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
