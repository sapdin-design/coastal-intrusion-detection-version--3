import React from 'react';
import L from 'leaflet';
import { IVessel } from '../../types';

export const getVesselStatusColors = (status: IVessel['status'], authStatus: IVessel['authorizationStatus']) => {
  if (status === 'intrusion') {
    return {
      bg: '#ef4444',
      border: '#f87171',
      pulse: 'rgba(239, 68, 68, 0.6)',
      glowClass: 'critical-glow'
    };
  }
  if (status === 'approaching') {
    return {
      bg: '#f59e0b',
      border: '#fbbf24',
      pulse: 'rgba(245, 158, 11, 0.5)',
      glowClass: 'warning-glow'
    };
  }
  if (authStatus === 'unauthorized') {
    return {
      bg: '#f97316',
      border: '#fb923c',
      pulse: 'transparent',
      glowClass: ''
    };
  }
  if (authStatus === 'authorized') {
    return {
      bg: '#10b981',
      border: '#34d399',
      pulse: 'transparent',
      glowClass: 'radar-glow'
    };
  }
  return {
    bg: '#64748b',
    border: '#94a3b8',
    pulse: 'transparent',
    glowClass: ''
  };
};

/**
 * Returns SVG path tailored for vessel type (Patrol Boat, Fishing Boat, Cargo Ship, Ferry, Speedboat)
 */
const getVesselSvgPath = (type: IVessel['type']) => {
  switch (type) {
    case 'Patrol Boat':
    case 'Rescue Boat':
      // Sleek angular naval cutter hull
      return `
        <path d="M12 2 L18 14 L15 22 L9 22 L6 14 Z" fill="currentColor" opacity="0.9" />
        <circle cx="12" cy="11" r="2" fill="#ffffff" />
        <path d="M12 2 L12 22" stroke="#ffffff" stroke-width="1.2" />
      `;
    case 'Cargo Ship':
      // Broad container/cargo vessel hull
      return `
        <path d="M12 2 L19 9 L19 20 L16 22 L8 22 L5 20 L5 9 Z" fill="currentColor" opacity="0.9" />
        <rect x="8" y="9" width="8" height="9" fill="#ffffff" opacity="0.8" />
        <path d="M12 2 L12 22" stroke="#ffffff" stroke-width="1.2" />
      `;
    case 'Speed Boat':
      // Sharp wedge speed craft
      return `
        <path d="M12 1 L20 18 L16 22 L12 18 L8 22 L4 18 Z" fill="currentColor" opacity="0.9" />
        <polygon points="12,5 15,15 9,15" fill="#ffffff" />
      `;
    case 'Passenger Ferry':
      // Multi-deck catamaran hull
      return `
        <path d="M12 3 L18 10 L18 21 L14 21 L12 18 L10 21 L6 21 L6 10 Z" fill="currentColor" opacity="0.9" />
        <rect x="8" y="8" width="8" height="7" rx="1" fill="#ffffff" />
      `;
    case 'Fishing Boat':
    default:
      // Traditional coastal trawler hull
      return `
        <path d="M12 2 L18 11 L16 21 L8 21 L6 11 Z" fill="currentColor" opacity="0.9" />
        <circle cx="12" cy="12" r="2.5" fill="#ffffff" />
        <path d="M12 4 L12 19" stroke="#ffffff" stroke-width="1" />
      `;
  }
};

/**
 * Creates custom Leaflet DivIcon for a vessel with heading rotation and pulsating beacon
 */
export const createVesselLeafletIcon = (vessel: IVessel): L.DivIcon => {
  const colors = getVesselStatusColors(vessel.status, vessel.authorizationStatus);
  const svgPath = getVesselSvgPath(vessel.type);
  const heading = vessel.heading || 0;

  const isCritical = vessel.status === 'intrusion';
  const isApproaching = vessel.status === 'approaching';

  const html = `
    <div class="vessel-marker-container" style="width: 36px; height: 36px;">
      ${
        isCritical || isApproaching
          ? `<div class="vessel-beacon" style="background-color: ${colors.pulse};"></div>`
          : ''
      }
      <div 
        class="vessel-icon-wrapper" 
        style="
          width: 32px; 
          height: 32px; 
          background-color: ${colors.bg}; 
          border: 2px solid ${colors.border};
          transform: rotate(${heading}deg);
          color: #ffffff;
          box-shadow: 0 0 10px ${colors.border};
        "
      >
        <svg viewBox="0 0 24 24" width="20" height="20" style="color: #ffffff; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));">
          ${svgPath}
        </svg>
      </div>
      <div 
        style="
          position: absolute; 
          bottom: -14px; 
          white-space: nowrap; 
          font-family: 'JetBrains Mono', monospace; 
          font-size: 9px; 
          font-weight: 700; 
          padding: 1px 4px; 
          border-radius: 3px; 
          background: rgba(6, 11, 19, 0.85); 
          border: 1px solid ${colors.border}; 
          color: ${colors.border};
          pointer-events: none;
        "
      >
        ${vessel.id}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-vessel-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
};
