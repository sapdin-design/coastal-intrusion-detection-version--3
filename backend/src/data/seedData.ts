import bcrypt from 'bcryptjs';
import { IUser, IVessel, IZone } from '../models/types';

export const getHashedPassword = (password: string): string => {
  return bcrypt.hashSync(password, 10);
};

export const SEED_USERS: IUser[] = [
  {
    id: 'USR-001',
    email: 'admin@cidrtm.gov.in',
    password: getHashedPassword('Admin@1234'),
    name: 'Commander Sapdin',
    role: 'admin',
    department: 'Maritime Security Command',
    createdAt: new Date().toISOString()
  },
  {
    id: 'USR-002',
    email: 'operator@cidrtm.gov.in',
    password: getHashedPassword('Operator@1234'),
    name: 'Operator Sasi',
    role: 'operator',
    department: 'Coastal Surveillance Operations',
    createdAt: new Date().toISOString()
  }
];

export const SEED_ZONES: IZone[] = [
  {
    id: 'Z001',
    name: 'Kanyakumari Offshore Defense Corridor',
    description: 'Critical maritime defense and surveillance perimeter south-east of Kanyakumari. Strictly no unauthorized transit.',
    zoneType: 'security',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [77.5300, 7.9700],
          [77.6200, 7.9700],
          [77.6200, 8.0300],
          [77.5300, 8.0300],
          [77.5300, 7.9700]
        ]
      ]
    },
    severity: 'critical',
    warningDistance: 1500, // 1.5 km warning threshold
    status: 'active',
    createdBy: 'System Initialization',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'Z002',
    name: 'Wadge Bank Marine Protected Sanctuary',
    description: 'Ecologically sensitive biodiversity zone and restricted deep-sea nursery southwest of Cape Comorin.',
    zoneType: 'protected',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [77.3600, 7.8800],
          [77.4600, 7.8800],
          [77.4600, 7.9500],
          [77.3600, 7.9500],
          [77.3600, 7.8800]
        ]
      ]
    },
    severity: 'medium',
    warningDistance: 1200,
    status: 'active',
    createdBy: 'System Initialization',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'Z003',
    name: 'Cape Comorin Port & Harbor Approach Limit',
    description: 'Tactical security perimeter guarding coastal approaches within 3 nautical miles.',
    zoneType: 'restricted',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [77.5200, 8.0350],
          [77.5800, 8.0350],
          [77.5800, 8.0720],
          [77.5200, 8.0720],
          [77.5200, 8.0350]
        ]
      ]
    },
    severity: 'high',
    warningDistance: 1000,
    status: 'active',
    createdBy: 'System Initialization',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const SEED_VESSELS: IVessel[] = [
  {
    id: 'V001',
    name: 'Sea Guardian Patrol Boat',
    type: 'Patrol Boat',
    registrationNumber: 'ICG-PB-8821',
    owner: 'Indian Coast Guard - Regional Station Kanyakumari',
    authorizationStatus: 'authorized',
    latitude: 8.0120,
    longitude: 77.4800,
    speed: 16.5,
    heading: 85,
    status: 'normal',
    lastSeen: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'V002',
    name: 'Kanyakumari Fishing Boat',
    type: 'Fishing Boat',
    registrationNumber: 'TN-07-MM-4412',
    owner: 'Muthu Fishermen Cooperative Society',
    authorizationStatus: 'authorized',
    latitude: 8.0400,
    longitude: 77.6400,
    speed: 7.8,
    heading: 215,
    status: 'normal',
    lastSeen: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'V003',
    name: 'Coastal Cargo Ship',
    type: 'Cargo Ship',
    registrationNumber: 'IND-CS-9902',
    owner: 'Southern Seaways Logistics Ltd.',
    authorizationStatus: 'authorized',
    latitude: 7.8900,
    longitude: 77.6600,
    speed: 13.5,
    heading: 270,
    status: 'normal',
    lastSeen: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'V004',
    name: 'Passenger Ferry Boat',
    type: 'Passenger Ferry',
    registrationNumber: 'TN-TDC-03',
    owner: 'Poompuhar Shipping Corporation',
    authorizationStatus: 'authorized',
    latitude: 8.0690,
    longitude: 77.5620,
    speed: 6.2,
    heading: 140,
    status: 'normal',
    lastSeen: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'V005',
    name: 'Unauthorized Fishing Boat',
    type: 'Fishing Boat',
    registrationNumber: 'UNKNOWN-ROGUE-05',
    owner: 'Unregistered / Blacklisted Entity',
    authorizationStatus: 'unauthorized',
    latitude: 7.9100,
    longitude: 77.5750,
    speed: 12.8,
    heading: 5,
    status: 'normal',
    lastSeen: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'V006',
    name: 'Unknown Speed Boat',
    type: 'Speed Boat',
    registrationNumber: 'SUSPECT-SB-09',
    owner: 'Unidentified Smuggling Suspect',
    authorizationStatus: 'unauthorized',
    latitude: 7.9450,
    longitude: 77.6800,
    speed: 23.4,
    heading: 295,
    status: 'normal',
    lastSeen: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'V007',
    name: 'Coastal Patrol Boat',
    type: 'Patrol Boat',
    registrationNumber: 'TN-MP-104',
    owner: 'Tamil Nadu Marine Police Division',
    authorizationStatus: 'authorized',
    latitude: 8.0550,
    longitude: 77.4400,
    speed: 14.8,
    heading: 105,
    status: 'normal',
    lastSeen: new Date().toISOString(),
    isActive: true
  },
  {
    id: 'V008',
    name: 'Rescue Patrol Boat',
    type: 'Rescue Boat',
    registrationNumber: 'SAR-KK-02',
    owner: 'Maritime Search & Rescue Squadron',
    authorizationStatus: 'authorized',
    latitude: 8.0250,
    longitude: 77.5150,
    speed: 18.2,
    heading: 95,
    status: 'normal',
    lastSeen: new Date().toISOString(),
    isActive: true
  }
];
