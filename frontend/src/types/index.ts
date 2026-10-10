export type UserRole = 'admin' | 'operator';

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  createdAt: string;
  lastLogin?: string;
}

export type VesselType =
  | 'Patrol Boat'
  | 'Fishing Boat'
  | 'Cargo Ship'
  | 'Passenger Ferry'
  | 'Supply Vessel'
  | 'Speed Boat'
  | 'Rescue Boat';

export type AuthorizationStatus = 'authorized' | 'unauthorized' | 'pending' | 'suspended';

export type VesselStatus = 'normal' | 'approaching' | 'intrusion' | 'offline';

export interface IVessel {
  id: string;
  name: string;
  type: VesselType;
  registrationNumber: string;
  owner: string;
  authorizationStatus: AuthorizationStatus;
  image?: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  status: VesselStatus;
  nearestZoneId?: string;
  nearestZoneDistance?: number;
  lastSeen: string;
  isActive: boolean;
}

export type ZoneType = 'restricted' | 'security' | 'protected' | 'no-entry';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface IGeoPolygon {
  type: 'Polygon';
  coordinates: [number, number][][];
}

export interface IZone {
  id: string;
  name: string;
  description: string;
  zoneType: ZoneType;
  geometry: IGeoPolygon;
  severity: SeverityLevel;
  warningDistance: number;
  status: 'active' | 'inactive';
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ILocationLog {
  id: string;
  vesselId: string;
  vesselName: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  status: VesselStatus;
  nearestZoneId?: string;
  nearestZoneDistance?: number;
  rawNmea?: string;
  timestamp: string;
}

export type AlertType =
  | 'Zone Approach'
  | 'Unauthorized Entry'
  | 'Vessel Offline'
  | 'Suspicious Movement'
  | 'System Warning';

export type AlertStatus = 'new' | 'acknowledged' | 'resolved';

export interface IAlert {
  id: string;
  vesselId: string;
  vesselName: string;
  zoneId?: string;
  zoneName?: string;
  alertType: AlertType;
  severity: SeverityLevel;
  latitude: number;
  longitude: number;
  message: string;
  status: AlertStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export type IncidentStatus =
  | 'open'
  | 'acknowledged'
  | 'investigating'
  | 'resolved'
  | 'closed';

export interface IIncidentTimelineEvent {
  timestamp: string;
  event: string;
  details: string;
  operator?: string;
}

export interface IIncident {
  id: string;
  alertId: string;
  vesselId: string;
  vesselName: string;
  zoneId?: string;
  zoneName?: string;
  severity: SeverityLevel;
  title: string;
  description: string;
  status: IncidentStatus;
  assignedOperator?: string;
  timeline: IIncidentTimelineEvent[];
  createdAt: string;
  resolvedAt?: string;
  closedAt?: string;
}

export type SimulationScenario =
  | 'normal_patrol'
  | 'intrusion_demo'
  | 'multiple_vessels'
  | 'zone_approach'
  | 'full_demonstration';

export interface ISimulatorStatus {
  isRunning: boolean;
  isPaused: boolean;
  scenario: SimulationScenario;
  speedMultiplier: number;
  activeVesselsCount: number;
  currentTick: number;
  elapsedSeconds: number;
  lastUpdate: string;
}

export interface IDashboardStats {
  totalVessels: number;
  activeVessels: number;
  authorizedVessels: number;
  unauthorizedVessels: number;
  approachingVessels: number;
  activeIntrusions: number;
  activeAlerts: number;
  totalAlerts: number;
  openIncidents: number;
  totalIncidents: number;
  restrictedZones: number;
  offlineVessels: number;
  simulator: ISimulatorStatus;
  systemHealth: {
    api: string;
    database: string;
    socketIO: string;
    gpsSimulator: string;
    locationService: string;
    timestamp: string;
  };
}
