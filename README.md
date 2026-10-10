# CIDRTM — Coastal Intrusion Detection & Real-Time Monitoring System

> **SIMULATION MODE** • Advanced Software-Based Mini-Project  
> **Demonstration Region:** Kanyakumari Coast, Tamil Nadu, India (8.078°N, 77.555°E)  
> **Target Mini-Project Budget:** ₹0–₹1,000 (Software-Only Model)  
> **Future Extension:** AI + IoT + Edge Hardware Fusion (~₹15,000–₹20,000)  

---

## 1. System Overview

**CIDRTM** is a full-stack tactical coastal surveillance and intrusion monitoring prototype designed to monitor simulated vessels, track real-time movements on an offshore nautical map, enforce geofenced maritime defense zones, detect unauthorized incursion using Point-in-Polygon (PIP) and Haversine algorithms, trigger humanized real-time alerts via WebSockets, manage the complete incident response lifecycle, and provide historical track reconstruction and operational analytics.

```text
       +-------------------------------------------------------------+
       |            GPS SIMULATOR (Offshore Marine Routes)          |
       +-------------------------------------------------------------+
                                      │
                                      ▼
                      +───────────────────────────────+
                      | Real-Time Vessel Telemetry   |
                      | ($GPGGA, $GPRMC, Lat/Lon/Spd) |
                      +───────────────────────────────+
                                      │
                                      ▼
                      +───────────────────────────────+
                      | Maritime Geofencing Engine    |
                      | • Haversine Distance          |
                      | • Point-in-Polygon Raycasting |
                      +───────────────────────────────+
                                      │
                                      ▼
                      +───────────────────────────────+
                      | Authorization & Status Logic  |
                      | INTRUSION > APPROACH > NORMAL |
                      +───────────────────────────────+
                                      │
                                      ▼
                      +───────────────────────────────+
                      | Real-Time Socket.IO Dispatch  |
                      +───────────────────────────────+
                                      │
                 ┌────────────────────┴────────────────────┐
                 ▼                                         ▼
+─────────────────────────────────+       +─────────────────────────────────+
| Critical Alerts & Incident Mgmt |       | Tactical Leaflet Map Console    |
| • Humanized Alerts              |       | • Boat Icon Heading Orientation |
| • Chronological Event Timeline  |       | • Restricted Zone Polygons      |
+─────────────────────────────────+       +─────────────────────────────────+
```

---

## 2. Key Features

- 🛰️ **Offshore GNSS Simulator Engine**: Predefined sea routes south/southeast/southwest of Kanyakumari (Gulf of Mannar, Laccadive Sea, and Indian Ocean). Vessels strictly stay at sea.
- ⚓ **Custom Vessel Marker SVGs**: Distinct boat hull markers for Patrol Boats, Fishing Boats, Cargo Vessels, Passenger Ferries, and Speedboats, rotated smoothly according to real-time heading (`transform: rotate(deg)`).
- 🛡️ **Offshore Geofencing & Warning Buffers**:
  - `Z001`: Kanyakumari Offshore Defense Corridor (Critical Security Zone, 1500m warning buffer)
  - `Z002`: Wadge Bank Marine Sanctuary (Protected Bio-Reserve, 1200m buffer)
  - `Z003`: Cape Comorin Approach Perimeter (Restricted Harbor Zone, 1000m buffer)
- 🚨 **Intrusion Detection State Machine**:
  - **Rule**: `Vessel inside restricted zone + Vessel unauthorized = INTRUSION`
  - Automatically dispatches humanized critical alerts (e.g. *"CRITICAL — Unauthorized Fishing Boat V005 has entered Offshore Security Zone Z001"*).
  - Automatically instantiates new security Incident dossiers (`INC-xxxx`) with timestamped chronological audit trails.
- ⚡ **Real-Time WebSocket Sync**: Instant zero-refresh UI updates across fleet movements, alert triggers, incident acknowledgments, and simulation state changes.
- 🔊 **Web Audio API Tactical Sound System**: Synthesized radar sweeps, warning tones, and critical intrusion alarms with 1-click mute control.
- 📊 **Operational Analytics & Intelligence**: Mean Time to Acknowledge (MTTA), Mean Time to Resolve (MTTR), 7-day threat trend charts, severity breakdowns, and JSON report exporter.
- 🔒 **Role-Based Access Control (RBAC)**: JWT authentication with bcrypt password hashing for **Administrator** and **Operator** roles.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Leaflet, React-Leaflet, Socket.IO Client, Recharts, Lucide React, Axios |
| **Backend** | Node.js, Express.js, TypeScript, Socket.IO, Mongoose, In-Memory High-Speed Embedded DB Fallback, bcryptjs, jsonwebtoken, Helmet, CORS |
| **Simulation** | NMEA 0183 ($GPRMC, $GPGGA) Formatter, Offshore Waypoint Interpolator (1x–10x speed multipliers) |
| **Deployment** | Docker, Docker Compose, Nginx |

---

## 4. Quick Start Guide

### Prerequisites
- Node.js v18+ & npm
- (Optional) Docker & Docker Compose

### Step 1: Install & Launch Concurrently
From the project root:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Start Backend (Port 5000)
cd ../backend
npm run dev

# Start Frontend (Port 5173 in another terminal)
cd ../frontend
npm run dev
```

Alternatively, run with Docker Compose:
```bash
docker-compose up --build
```

### Access URLs:
- **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
- **Backend Health Check:** [http://localhost:5000/health](http://localhost:5000/health)

---

## 5. Pre-Configured Demo Credentials

For quick 1-click evaluation, use the demo credentials on the login screen:

| Role | Email | Password | Name |
|---|---|---|---|
| **Operator** | `operator@cidrtm.gov.in` | `Operator@1234` | Operator K. Murugan |
| **Administrator** | `admin@cidrtm.gov.in` | `Admin@1234` | Commander Sapdin |

---

## 6. Academic Defense Demonstration Walkthrough

Follow this step-by-step presentation script for project defense and viva:

1. **Login & Overview**:
   - Navigate to `/login` and click **Operator (1-Click Login)**.
   - Observe the **SIMULATION MODE** banner, Kanyakumari sector coordinates (`8.078°N, 77.555°E`), live UTC/IST clocks, and system health status.
2. **Tactical Live Monitoring**:
   - Navigate to **Live Monitoring** (`/monitoring`).
   - Showcase the Kanyakumari coastline and offshore restricted zones (`Z001`, `Z002`, `Z003`).
   - Note the boat hull icons rotated in their exact heading direction.
3. **Execute Primary Intrusion Demo (Scenario 2)**:
   - Navigate to **GPS Simulator** (`/simulator`).
   - Select **Scenario 2 — Intrusion Demo**, Target Vessel **V005 (Unauthorized Fishing Boat)**, and click **START SIMULATION (2x Speed)**.
   - **Step 1 (Open Sea)**: Vessel V005 begins at `7.900°N, 77.575°E` in normal status.
   - **Step 2 (Zone Approach)**: V005 enters the 1500m buffer zone of `Z001` → Status transitions to `APPROACHING` → Amber Warning alert sounds and pops up.
   - **Step 3 (Boundary Crossing & Intrusion)**: V005 crosses the `7.970°N` boundary into `Z001` → Status transitions to `INTRUSION` → Critical siren triggers → Glowing red radar ring appears on map → Critical Alert created → Incident `INC-xxxx` automatically opened with timeline events!
4. **Incident Response Lifecycle**:
   - Navigate to **Incidents** (`/incidents`).
   - Inspect the automatically created incident dossier and its chronological timeline.
   - Advance status from `OPEN` → `ACKNOWLEDGED` → `INVESTIGATING` → `RESOLVED` → `CLOSED`.
   - Add operator notes to the timeline audit trail.
5. **Vessel History & Route Replay**:
   - Navigate to **Vessel History** (`/history`).
   - Select `V005` and use the timeline scrubber to replay the exact path taken across the boundary, with speed and heading graphs.
6. **Analytics & Reports**:
   - Navigate to **Analytics** (`/analytics`).
   - View MTTA (&lt;60s) and MTTR (&lt;15m) response KPIs, 7-day threat trend charts, and click **Export Security Report**.

---

## 7. Final-Year Hardware & AI Extension Roadmap

The CIDRTM architecture was designed to transition into a physical IoT & Edge AI system:

```text
ESP32-C3 + GNSS (NEO-M8N) + 4G LTE (SIM7600)
                     │ (Real GNSS Location Fixes)
                     ▼
           CIDRTM Node.js Backend ◄────────┐
                     │                     │
                     ▼                     │ (Visual Detection Events)
            Geofencing Engine              │
                     │                     ▼
                     │       Raspberry Pi 4 + Night Vision IR Camera
                     │       (YOLOv8 Edge Vessel Detection)
                     ▼                     │
             GPS + AI Visual Fusion ───────┘
                     │
                     ▼
           Threat Risk Analysis
                     │
                     ▼
       CIDRTM Unified Command Console
```

### Estimated Hardware Bill of Materials (BOM):
- **ESP32-C3 + 4G LTE + GNSS**: ₹5,000–₹5,900
- **Raspberry Pi 4 (4GB)**: ₹4,000–₹6,000
- **Night-Vision Maritime IR Camera**: ₹1,000–₹2,000
- **Waterproof IP67 Enclosure & High-Gain Antennas**: ₹3,000–₹4,000
- **Total Hardware Target:** **~₹15,000–₹20,000**
