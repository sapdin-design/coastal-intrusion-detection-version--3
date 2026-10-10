import { Server as SocketIOServer } from 'socket.io';
import { dbStore } from '../config/database';
import { IntrusionService } from './intrusion.service';
import { ISimulatorStatus, SimulationScenario, IVessel } from '../models/types';
import { generateNmeaSentences } from '../utils/nmea';

interface IWaypoint {
  lat: number;
  lon: number;
  speed: number;
}

interface IVesselRoutePlan {
  vesselId: string;
  waypoints: IWaypoint[];
  currentWaypointIndex: number;
  progress: number; // 0.0 to 1.0 between waypoints
}

export class SimulatorService {
  private static isRunning: boolean = false;
  private static isPaused: boolean = false;
  private static scenario: SimulationScenario = 'intrusion_demo';
  private static speedMultiplier: number = 1; // 1x, 2x, 5x, 10x
  private static tickIntervalMs: number = 1000;
  private static timerHandle: NodeJS.Timeout | null = null;
  private static currentTick: number = 0;
  private static elapsedSeconds: number = 0;
  private static activeRoutes: Map<string, IVesselRoutePlan> = new Map();
  private static ioInstance: SocketIOServer | null = null;

  public static setSocketIO(io: SocketIOServer) {
    this.ioInstance = io;
  }

  // Predefined strictly OFFSHORE Waypoints for Kanyakumari Marine Sector
  private static SCENARIO_ROUTES: Record<SimulationScenario, { vesselId: string; waypoints: IWaypoint[] }[]> = {
    intrusion_demo: [
      {
        vesselId: 'V005', // Unauthorized Fishing Boat
        waypoints: [
          { lat: 7.9000, lon: 77.5750, speed: 12.0 }, // 1. Deep open sea (Normal)
          { lat: 7.9250, lon: 77.5750, speed: 13.5 }, // 2. Approaching north (Normal)
          { lat: 7.9520, lon: 77.5750, speed: 14.0 }, // 3. Near boundary (Approaching zone warning buffer)
          { lat: 7.9640, lon: 77.5750, speed: 14.5 }, // 4. Crossing warning threshold (<1500m)
          { lat: 7.9780, lon: 77.5750, speed: 15.0 }, // 5. Crosses 7.9700 boundary into Z001 (INTRUSION!)
          { lat: 8.0000, lon: 77.5750, speed: 15.2 }, // 6. Deep inside Z001
          { lat: 8.0200, lon: 77.5600, speed: 14.0 }, // 7. Inside Z001 near northwest corner
          { lat: 8.0100, lon: 77.5400, speed: 12.0 }  // 8. Inside Z001
        ]
      }
    ],

    normal_patrol: [
      {
        vesselId: 'V001', // Sea Guardian Patrol Boat (Authorized Coast Guard)
        waypoints: [
          { lat: 8.0150, lon: 77.4600, speed: 16.0 },
          { lat: 8.0200, lon: 77.5000, speed: 16.5 },
          { lat: 8.0250, lon: 77.5400, speed: 17.0 },
          { lat: 8.0300, lon: 77.6000, speed: 16.5 },
          { lat: 8.0350, lon: 77.6600, speed: 16.0 },
          { lat: 8.0250, lon: 77.6000, speed: 16.5 },
          { lat: 8.0180, lon: 77.5200, speed: 17.0 },
          { lat: 8.0150, lon: 77.4600, speed: 16.0 }
        ]
      }
    ],

    zone_approach: [
      {
        vesselId: 'V006', // Unknown Speed Boat
        waypoints: [
          { lat: 7.9200, lon: 77.6700, speed: 24.0 },
          { lat: 7.9400, lon: 77.6500, speed: 25.0 },
          { lat: 7.9620, lon: 77.6300, speed: 26.0 }, // Approaching Z001 boundary (~800m away)
          { lat: 7.9660, lon: 77.6250, speed: 27.0 }, // Warning trigger, but veers off
          { lat: 7.9550, lon: 77.6450, speed: 28.0 }, // Turning away
          { lat: 7.9300, lon: 77.6800, speed: 26.0 }, // Escaping back to international waters
          { lat: 7.9100, lon: 77.7100, speed: 24.0 }
        ]
      }
    ],

    multiple_vessels: [
      {
        vesselId: 'V001',
        waypoints: [
          { lat: 8.0150, lon: 77.4600, speed: 16.0 },
          { lat: 8.0250, lon: 77.5200, speed: 16.5 },
          { lat: 8.0300, lon: 77.6000, speed: 17.0 },
          { lat: 8.0150, lon: 77.4600, speed: 16.0 }
        ]
      },
      {
        vesselId: 'V002', // Fishing boat
        waypoints: [
          { lat: 8.0400, lon: 77.6400, speed: 8.0 },
          { lat: 8.0450, lon: 77.6100, speed: 8.5 },
          { lat: 8.0500, lon: 77.5800, speed: 7.5 },
          { lat: 8.0400, lon: 77.6400, speed: 8.0 }
        ]
      },
      {
        vesselId: 'V003', // Cargo Ship
        waypoints: [
          { lat: 7.8900, lon: 77.6800, speed: 14.0 },
          { lat: 7.8900, lon: 77.6000, speed: 14.0 },
          { lat: 7.8900, lon: 77.5000, speed: 14.0 },
          { lat: 7.8900, lon: 77.4000, speed: 14.0 }
        ]
      },
      {
        vesselId: 'V005', // Unauthorized boat
        waypoints: [
          { lat: 7.9100, lon: 77.5750, speed: 12.0 },
          { lat: 7.9400, lon: 77.5750, speed: 13.0 },
          { lat: 7.9750, lon: 77.5750, speed: 14.0 },
          { lat: 8.0050, lon: 77.5750, speed: 14.0 }
        ]
      }
    ],

    full_demonstration: [
      {
        vesselId: 'V001', // Coast Guard Patrol
        waypoints: [
          { lat: 8.0120, lon: 77.4800, speed: 16.0 },
          { lat: 8.0150, lon: 77.5200, speed: 16.0 },
          { lat: 8.0050, lon: 77.5600, speed: 22.0 }, // Dispatched for interception
          { lat: 8.0000, lon: 77.5750, speed: 20.0 }
        ]
      },
      {
        vesselId: 'V005', // Intruder
        waypoints: [
          { lat: 7.9000, lon: 77.5750, speed: 12.0 },
          { lat: 7.9400, lon: 77.5750, speed: 13.5 },
          { lat: 7.9620, lon: 77.5750, speed: 14.0 }, // Approach
          { lat: 7.9800, lon: 77.5750, speed: 14.5 }, // Intrusion
          { lat: 8.0000, lon: 77.5750, speed: 15.0 }  // Intercepted
        ]
      },
      {
        vesselId: 'V004', // Passenger Ferry
        waypoints: [
          { lat: 8.0690, lon: 77.5620, speed: 6.0 },
          { lat: 8.0650, lon: 77.5700, speed: 6.5 },
          { lat: 8.0690, lon: 77.5620, speed: 6.0 }
        ]
      }
    ]
  };

  /**
   * Start or restart the simulation
   */
  public static async start(
    scenario: SimulationScenario = 'intrusion_demo',
    speedMultiplier: number = 1
  ): Promise<ISimulatorStatus> {
    this.stop();
    this.scenario = scenario;
    this.speedMultiplier = speedMultiplier;
    this.isRunning = true;
    this.isPaused = false;
    this.currentTick = 0;
    this.elapsedSeconds = 0;
    this.activeRoutes.clear();
    IntrusionService.resetCooldowns();

    // Initialize routes
    const routePlans = this.SCENARIO_ROUTES[scenario] || this.SCENARIO_ROUTES.intrusion_demo;
    for (const plan of routePlans) {
      this.activeRoutes.set(plan.vesselId, {
        vesselId: plan.vesselId,
        waypoints: plan.waypoints,
        currentWaypointIndex: 0,
        progress: 0
      });

      // Set vessel starting coordinates
      const startWp = plan.waypoints[0];
      const heading = this.calculateHeading(startWp.lat, startWp.lon, plan.waypoints[1]?.lat || startWp.lat, plan.waypoints[1]?.lon || startWp.lon);
      await IntrusionService.processVesselLocation(plan.vesselId, startWp.lat, startWp.lon, startWp.speed, heading);
    }

    this.scheduleTick();
    this.broadcastStatus();

    console.log(`[Simulator] Started scenario '${scenario}' at ${speedMultiplier}x speed.`);
    return this.getStatus();
  }

  public static pause(): ISimulatorStatus {
    this.isPaused = true;
    if (this.timerHandle) {
      clearTimeout(this.timerHandle);
      this.timerHandle = null;
    }
    this.broadcastStatus();
    console.log(`[Simulator] Paused.`);
    return this.getStatus();
  }

  public static resume(): ISimulatorStatus {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false;
      this.scheduleTick();
      this.broadcastStatus();
      console.log(`[Simulator] Resumed.`);
    }
    return this.getStatus();
  }

  public static stop(): ISimulatorStatus {
    this.isRunning = false;
    this.isPaused = false;
    if (this.timerHandle) {
      clearTimeout(this.timerHandle);
      this.timerHandle = null;
    }
    this.broadcastStatus();
    console.log(`[Simulator] Stopped.`);
    return this.getStatus();
  }

  public static reset(): ISimulatorStatus {
    this.stop();
    dbStore.seed();
    IntrusionService.resetCooldowns();
    this.currentTick = 0;
    this.elapsedSeconds = 0;
    this.broadcastStatus();
    if (this.ioInstance) {
      this.ioInstance.emit('simulator:reset');
    }
    console.log(`[Simulator] Reset state and re-seeded data.`);
    return this.getStatus();
  }

  public static setSpeed(speedMultiplier: number): ISimulatorStatus {
    this.speedMultiplier = Math.max(1, Math.min(10, speedMultiplier));
    this.broadcastStatus();
    return this.getStatus();
  }

  public static getStatus(): ISimulatorStatus {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      scenario: this.scenario,
      speedMultiplier: this.speedMultiplier,
      activeVesselsCount: this.activeRoutes.size,
      currentTick: this.currentTick,
      elapsedSeconds: this.elapsedSeconds,
      lastUpdate: new Date().toISOString()
    };
  }

  /**
   * Schedule the next simulation step
   */
  private static scheduleTick() {
    if (!this.isRunning || this.isPaused) return;

    const interval = Math.max(100, Math.floor(this.tickIntervalMs / this.speedMultiplier));
    this.timerHandle = setTimeout(() => {
      this.executeTick();
    }, interval);
  }

  /**
   * Perform one simulation tick
   */
  private static async executeTick() {
    if (!this.isRunning || this.isPaused) return;

    this.currentTick += 1;
    this.elapsedSeconds += 1;

    try {
      for (const [vesselId, routePlan] of this.activeRoutes.entries()) {
        const waypoints = routePlan.waypoints;
        const currIdx = routePlan.currentWaypointIndex;

        if (currIdx >= waypoints.length - 1) {
          // Route completed - loop or hold last position
          continue;
        }

        const wpA = waypoints[currIdx];
        const wpB = waypoints[currIdx + 1];

        // Step progress forward (adjusted for speed & distance)
        const stepSize = 0.08 * (wpA.speed / 12);
        routePlan.progress += stepSize;

        if (routePlan.progress >= 1.0) {
          routePlan.progress = 0;
          routePlan.currentWaypointIndex += 1;
        }

        const t = routePlan.progress;
        const currentLat = wpA.lat + (wpB.lat - wpA.lat) * t;
        const currentLon = wpA.lon + (wpB.lon - wpA.lon) * t;
        const currentSpeed = wpA.speed + (wpB.speed - wpA.speed) * t;
        const heading = this.calculateHeading(wpA.lat, wpA.lon, wpB.lat, wpB.lon);

        await IntrusionService.processVesselLocation(
          vesselId,
          Number(currentLat.toFixed(6)),
          Number(currentLon.toFixed(6)),
          Number(currentSpeed.toFixed(1)),
          Math.round(heading)
        );
      }
    } catch (err) {
      console.error(`[Simulator Error]`, err);
    }

    this.scheduleTick();
  }

  /**
   * Calculates true compass heading in degrees (0 - 360) between two coordinates
   */
  private static calculateHeading(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
    const x =
      Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
      Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));

    let brng = toDeg(Math.atan2(y, x));
    return (brng + 360) % 360;
  }

  private static broadcastStatus() {
    if (this.ioInstance) {
      this.ioInstance.emit('simulator:status', this.getStatus());
    }
  }

  /**
   * Manual coordinate injection for test/debugging
   */
  public static async injectVesselPosition(
    vesselId: string,
    lat: number,
    lon: number,
    speed: number = 15,
    heading: number = 0
  ) {
    return await IntrusionService.processVesselLocation(vesselId, lat, lon, speed, heading);
  }
}
