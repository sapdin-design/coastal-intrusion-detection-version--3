import React from 'react';
import { IVessel } from '../../types';
import { Shield, Navigation, Gauge, Radio, Clock, AlertTriangle } from 'lucide-react';

interface VesselPopupProps {
  vessel: IVessel;
  onViewDetails?: (vessel: IVessel) => void;
}

export const VesselPopup: React.FC<VesselPopupProps> = ({ vessel, onViewDetails }) => {
  const getStatusBadge = () => {
    switch (vessel.status) {
      case 'intrusion':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-red-600 text-white uppercase animate-pulse">
            CRITICAL INTRUSION
          </span>
        );
      case 'approaching':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500 text-black uppercase">
            ZONE APPROACH
          </span>
        );
      case 'offline':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-700 text-slate-300 uppercase">
            OFFLINE
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
            NORMAL
          </span>
        );
    }
  };

  return (
    <div className="p-3 w-64 text-slate-100 font-sans text-xs">
      {/* Header */}
      <div className="flex items-start justify-between pb-2 mb-2 border-b border-slate-700/80">
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="font-mono font-bold text-cyan-400 text-sm">{vessel.id}</span>
            <span className="text-[11px] text-slate-400">• {vessel.type}</span>
          </div>
          <p className="font-semibold text-slate-200 text-xs mt-0.5">{vessel.name}</p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Telemetry Metrics */}
      <div className="grid grid-cols-2 gap-2 my-2 bg-slate-900/80 p-2 rounded border border-slate-800 font-mono text-[11px]">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase">Speed</span>
          <span className="text-slate-100 font-semibold">{vessel.speed.toFixed(1)} kts</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block uppercase">Heading</span>
          <span className="text-slate-100 font-semibold">{vessel.heading}°</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block uppercase">Latitude</span>
          <span className="text-cyan-400">{vessel.latitude.toFixed(4)}°N</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block uppercase">Longitude</span>
          <span className="text-cyan-400">{vessel.longitude.toFixed(4)}°E</span>
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-1 text-[11px] text-slate-300">
        <div className="flex justify-between">
          <span className="text-slate-400">Authorization:</span>
          <span
            className={`font-semibold capitalize ${
              vessel.authorizationStatus === 'authorized'
                ? 'text-emerald-400'
                : 'text-red-400'
            }`}
          >
            {vessel.authorizationStatus}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Registration:</span>
          <span className="font-mono text-slate-200">{vessel.registrationNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Owner:</span>
          <span className="truncate max-w-[130px] text-slate-200" title={vessel.owner}>
            {vessel.owner}
          </span>
        </div>
        {vessel.nearestZoneDistance !== undefined && (
          <div className="flex justify-between pt-1 border-t border-slate-800">
            <span className="text-slate-400">Zone Proximity:</span>
            <span className="font-mono font-semibold text-amber-400">
              {vessel.nearestZoneDistance} m
            </span>
          </div>
        )}
      </div>

      {onViewDetails && (
        <button
          onClick={() => onViewDetails(vessel)}
          className="w-full mt-3 py-1 bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 rounded font-semibold text-[11px] transition-colors"
        >
          Inspect Vessel Telemetry
        </button>
      )}
    </div>
  );
};
