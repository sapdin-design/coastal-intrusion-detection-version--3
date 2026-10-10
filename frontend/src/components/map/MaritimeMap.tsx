import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  Polyline,
  Circle,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import { IVessel, IZone } from '../../types';
import { createVesselLeafletIcon } from './VesselMarker';
import { VesselPopup } from './VesselPopup';
import { Layers, Eye, Compass, ShieldAlert, Crosshair, MapPin } from 'lucide-react';

interface MaritimeMapProps {
  vessels: IVessel[];
  zones: IZone[];
  selectedVessel?: IVessel | null;
  onSelectVessel?: (vessel: IVessel) => void;
  showRadarSweep?: boolean;
  height?: string;
  zoomLevel?: number;
}

// Helper to auto-pan when selected vessel changes
const MapRecenter: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);
  return null;
};

export const MaritimeMap: React.FC<MaritimeMapProps> = ({
  vessels,
  zones,
  selectedVessel,
  onSelectVessel,
  showRadarSweep = true,
  height = 'calc(100vh - 12rem)',
  zoomLevel = 11
}) => {
  // Center of Kanyakumari coastal offshore sector
  const defaultCenter: [number, number] = [8.015, 77.56];
  const [activeTileLayer, setActiveTileLayer] = useState<'dark' | 'satellite' | 'ocean'>('dark');
  const [showZones, setShowZones] = useState<boolean>(true);
  const [showBuffers, setShowBuffers] = useState<boolean>(true);
  const [showTrails, setShowTrails] = useState<boolean>(true);
  const [trailsMap, setTrailsMap] = useState<Record<string, [number, number][]>>({});

  // Accumulate breadcrumb trails for vessels in real-time
  useEffect(() => {
    setTrailsMap((prev) => {
      const next = { ...prev };
      vessels.forEach((v) => {
        if (!next[v.id]) {
          next[v.id] = [];
        }
        const last = next[v.id][next[v.id].length - 1];
        if (!last || last[0] !== v.latitude || last[1] !== v.longitude) {
          next[v.id] = [...next[v.id].slice(-30), [v.latitude, v.longitude]];
        }
      });
      return next;
    });
  }, [vessels]);

  const tileUrls = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    ocean: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}'
  };

  const getZoneColor = (severity: string, zoneType: string) => {
    if (severity === 'critical') return '#ef4444';
    if (severity === 'high') return '#f97316';
    if (severity === 'medium') return '#f59e0b';
    return '#06b6d4';
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-[#060b13]">
      {/* Tactical Map Header Overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-[#0c1424]/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-2.5 shadow-xl flex items-center space-x-3 text-xs">
        <div className="flex items-center space-x-2 border-r border-slate-700 pr-3">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span className="font-mono font-bold text-slate-200">KANYAKUMARI SECTOR</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-300 font-mono">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>Fleet: {vessels.length} Tracked</span>
          <span className="text-slate-600">|</span>
          <span>Zones: {zones.length} Active</span>
        </div>
      </div>

      {/* Layer Controls Floating Widget */}
      <div className="absolute top-3 right-3 z-[1000] bg-[#0c1424]/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-2 shadow-xl flex items-center space-x-1 text-xs">
        <button
          onClick={() => setActiveTileLayer('dark')}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
            activeTileLayer === 'dark'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Tactical Dark
        </button>
        <button
          onClick={() => setActiveTileLayer('satellite')}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
            activeTileLayer === 'satellite'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => setActiveTileLayer('ocean')}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
            activeTileLayer === 'ocean'
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Nautical
        </button>
        <span className="text-slate-700 px-1">|</span>
        <button
          onClick={() => setShowZones(!showZones)}
          className={`p-1.5 rounded transition-colors ${
            showZones ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-500'
          }`}
          title="Toggle Zones"
        >
          <ShieldAlert className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowTrails(!showTrails)}
          className={`p-1.5 rounded transition-colors ${
            showTrails ? 'text-cyan-400 bg-cyan-500/10' : 'text-slate-500'
          }`}
          title="Toggle Trails"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Radar Sweep Effect Overlay */}
      {showRadarSweep && (
        <div className="absolute inset-0 pointer-events-none z-[400] overflow-hidden opacity-25">
          <div className="w-[800px] h-[800px] absolute -top-[200px] left-1/2 -translate-x-1/2 rounded-full border border-cyan-500/20">
            <div className="w-full h-full rounded-full border border-cyan-500/10 scale-75"></div>
            <div className="w-full h-full rounded-full border border-cyan-500/10 scale-50"></div>
            <div className="w-full h-full rounded-full border border-cyan-500/10 scale-25"></div>
            <div className="absolute top-1/2 left-1/2 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent origin-left animate-radar-sweep"></div>
          </div>
        </div>
      )}

      {/* Main Leaflet Map */}
      <MapContainer
        center={defaultCenter}
        zoom={zoomLevel}
        style={{ height, width: '100%', backgroundColor: '#060b13' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a> CIDRTM Maritime Surveillance'
          url={tileUrls[activeTileLayer]}
          maxZoom={18}
        />

        {selectedVessel && (
          <MapRecenter center={[selectedVessel.latitude, selectedVessel.longitude]} />
        )}

        {/* Offshore Restricted Zones */}
        {showZones &&
          zones.map((zone) => {
            const color = getZoneColor(zone.severity, zone.zoneType);
            // Invert GeoJSON [lon, lat] coordinates to Leaflet [lat, lon]
            const positions = zone.geometry.coordinates[0].map(([lon, lat]) => [
              lat,
              lon
            ]) as [number, number][];

            return (
              <React.Fragment key={zone.id}>
                <Polygon
                  positions={positions}
                  pathOptions={{
                    color,
                    weight: 2,
                    fillColor: color,
                    fillOpacity: zone.severity === 'critical' ? 0.25 : 0.15,
                    dashArray: zone.zoneType === 'security' ? '6, 6' : undefined
                  }}
                >
                  <Popup>
                    <div className="p-2.5 w-56 text-xs text-slate-100 font-sans">
                      <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-700">
                        <span className="font-mono font-bold text-cyan-400">{zone.id}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                            zone.severity === 'critical'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {zone.severity}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-200 text-xs mb-1">{zone.name}</p>
                      <p className="text-[11px] text-slate-400 leading-snug mb-2">{zone.description}</p>
                      <div className="text-[10px] text-slate-300 font-mono bg-slate-900/80 p-1.5 rounded border border-slate-800">
                        <div>Type: <span className="text-slate-100 uppercase">{zone.zoneType}</span></div>
                        <div>Warning Buffer: <span className="text-cyan-400">{zone.warningDistance} m</span></div>
                      </div>
                    </div>
                  </Popup>
                </Polygon>
              </React.Fragment>
            );
          })}

        {/* Vessel Breadcrumb Trails */}
        {showTrails &&
          Object.entries(trailsMap).map(([vesselId, path]) => {
            if (path.length < 2) return null;
            const vessel = vessels.find((v) => v.id === vesselId);
            const isIntruder = vessel?.status === 'intrusion';
            const color = isIntruder ? '#ef4444' : '#06b6d4';

            return (
              <Polyline
                key={`trail-${vesselId}`}
                positions={path}
                pathOptions={{
                  color,
                  weight: isIntruder ? 2.5 : 1.5,
                  opacity: 0.6,
                  dashArray: isIntruder ? '4, 4' : undefined
                }}
              />
            );
          })}

        {/* Real-time Vessel Markers */}
        {vessels.map((vessel) => (
          <Marker
            key={vessel.id}
            position={[vessel.latitude, vessel.longitude]}
            icon={createVesselLeafletIcon(vessel)}
            eventHandlers={{
              click: () => {
                if (onSelectVessel) {
                  onSelectVessel(vessel);
                }
              }
            }}
          >
            <Popup>
              <VesselPopup
                vessel={vessel}
                onViewDetails={(v) => {
                  if (onSelectVessel) onSelectVessel(v);
                }}
              />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
