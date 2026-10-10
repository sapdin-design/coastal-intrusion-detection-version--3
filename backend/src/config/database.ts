import mongoose from 'mongoose';
import { ENV } from './env';
import { IUser, IVessel, IZone, IAlert, IIncident, ILocationLog } from '../models/types';
import { SEED_USERS, SEED_VESSELS, SEED_ZONES } from '../data/seedData';
import { v4 as uuidv4 } from 'uuid';

class InMemoryStore {
  public users: Map<string, IUser> = new Map();
  public vessels: Map<string, IVessel> = new Map();
  public zones: Map<string, IZone> = new Map();
  public locationLogs: ILocationLog[] = [];
  public alerts: Map<string, IAlert> = new Map();
  public incidents: Map<string, IIncident> = new Map();
  public isConnectedToMongo: boolean = false;

  constructor() {
    this.seed();
  }

  public seed() {
    this.users.clear();
    this.vessels.clear();
    this.zones.clear();
    this.locationLogs = [];
    this.alerts.clear();
    this.incidents.clear();

    SEED_USERS.forEach((u) => this.users.set(u.id, { ...u }));
    SEED_VESSELS.forEach((v) => this.vessels.set(v.id, { ...v }));
    SEED_ZONES.forEach((z) => this.zones.set(z.id, { ...z }));

    // Generate some initial historical logs for demonstration
    SEED_VESSELS.forEach((v) => {
      this.locationLogs.push({
        id: uuidv4(),
        vesselId: v.id,
        vesselName: v.name,
        latitude: v.latitude,
        longitude: v.longitude,
        speed: v.speed,
        heading: v.heading,
        status: v.status,
        timestamp: new Date(Date.now() - 3600000).toISOString()
      });
      this.locationLogs.push({
        id: uuidv4(),
        vesselId: v.id,
        vesselName: v.name,
        latitude: v.latitude,
        longitude: v.longitude,
        speed: v.speed,
        heading: v.heading,
        status: v.status,
        timestamp: new Date().toISOString()
      });
    });

    console.log(`[CIDRTM DataStore] Seeded ${this.users.size} users, ${this.vessels.size} vessels, ${this.zones.size} restricted zones.`);
  }

  // User methods
  public async findUserByEmail(email: string): Promise<IUser | null> {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return { ...user };
      }
    }
    return null;
  }

  public async findUserById(id: string): Promise<IUser | null> {
    const user = this.users.get(id);
    return user ? { ...user } : null;
  }

  public async createUser(userData: Omit<IUser, 'id' | 'createdAt'>): Promise<IUser> {
    const id = `USR-${Date.now().toString().slice(-4)}`;
    const newUser: IUser = {
      ...userData,
      id,
      createdAt: new Date().toISOString()
    };
    this.users.set(id, newUser);
    return { ...newUser };
  }

  // Vessel methods
  public async getAllVessels(): Promise<IVessel[]> {
    return Array.from(this.vessels.values()).map((v) => ({ ...v }));
  }

  public async getVesselById(id: string): Promise<IVessel | null> {
    const vessel = this.vessels.get(id);
    return vessel ? { ...vessel } : null;
  }

  public async updateVessel(id: string, updates: Partial<IVessel>): Promise<IVessel | null> {
    const existing = this.vessels.get(id);
    if (!existing) return null;
    const updated: IVessel = {
      ...existing,
      ...updates,
      lastSeen: new Date().toISOString()
    };
    this.vessels.set(id, updated);
    return { ...updated };
  }

  public async createVessel(vesselData: Omit<IVessel, 'lastSeen' | 'status'> & { status?: IVessel['status'] }): Promise<IVessel> {
    const newVessel: IVessel = {
      ...vesselData,
      status: vesselData.status || 'normal',
      lastSeen: new Date().toISOString(),
      isActive: vesselData.isActive !== undefined ? vesselData.isActive : true
    };
    this.vessels.set(newVessel.id, newVessel);
    return { ...newVessel };
  }

  public async deleteVessel(id: string): Promise<boolean> {
    return this.vessels.delete(id);
  }

  // Zone methods
  public async getAllZones(): Promise<IZone[]> {
    return Array.from(this.zones.values()).map((z) => ({ ...z }));
  }

  public async getZoneById(id: string): Promise<IZone | null> {
    const zone = this.zones.get(id);
    return zone ? { ...zone } : null;
  }

  public async createZone(zoneData: Omit<IZone, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<IZone> {
    const id = zoneData.id || `Z00${this.zones.size + 1}`;
    const newZone: IZone = {
      ...zoneData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.zones.set(id, newZone);
    return { ...newZone };
  }

  public async updateZone(id: string, updates: Partial<IZone>): Promise<IZone | null> {
    const existing = this.zones.get(id);
    if (!existing) return null;
    const updated: IZone = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.zones.set(id, updated);
    return { ...updated };
  }

  public async deleteZone(id: string): Promise<boolean> {
    return this.zones.delete(id);
  }

  // Location log methods
  public async addLocationLog(log: Omit<ILocationLog, 'id' | 'timestamp'>): Promise<ILocationLog> {
    const newLog: ILocationLog = {
      ...log,
      id: uuidv4(),
      timestamp: new Date().toISOString()
    };
    this.locationLogs.push(newLog);
    // Keep max 5000 logs in memory for high speed
    if (this.locationLogs.length > 5000) {
      this.locationLogs.shift();
    }
    return { ...newLog };
  }

  public async getLocationLogsByVessel(vesselId: string, limit: number = 200): Promise<ILocationLog[]> {
    return this.locationLogs
      .filter((log) => log.vesselId === vesselId)
      .slice(-limit)
      .map((log) => ({ ...log }));
  }

  // Alert methods
  public async getAllAlerts(): Promise<IAlert[]> {
    return Array.from(this.alerts.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((a) => ({ ...a }));
  }

  public async getAlertById(id: string): Promise<IAlert | null> {
    const alert = this.alerts.get(id);
    return alert ? { ...alert } : null;
  }

  public async createAlert(alertData: Omit<IAlert, 'id' | 'createdAt'> & { id?: string }): Promise<IAlert> {
    const id = alertData.id || `ALT-${Date.now().toString().slice(-6)}`;
    const newAlert: IAlert = {
      ...alertData,
      id,
      createdAt: new Date().toISOString()
    };
    this.alerts.set(id, newAlert);
    return { ...newAlert };
  }

  public async updateAlert(id: string, updates: Partial<IAlert>): Promise<IAlert | null> {
    const existing = this.alerts.get(id);
    if (!existing) return null;
    const updated: IAlert = {
      ...existing,
      ...updates
    };
    this.alerts.set(id, updated);
    return { ...updated };
  }

  // Incident methods
  public async getAllIncidents(): Promise<IIncident[]> {
    return Array.from(this.incidents.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((inc) => ({ ...inc }));
  }

  public async getIncidentById(id: string): Promise<IIncident | null> {
    const inc = this.incidents.get(id);
    return inc ? { ...inc } : null;
  }

  public async createIncident(incData: Omit<IIncident, 'id' | 'createdAt'> & { id?: string }): Promise<IIncident> {
    const id = incData.id || `INC-${Date.now().toString().slice(-6)}`;
    const newInc: IIncident = {
      ...incData,
      id,
      createdAt: new Date().toISOString()
    };
    this.incidents.set(id, newInc);
    return { ...newInc };
  }

  public async updateIncident(id: string, updates: Partial<IIncident>): Promise<IIncident | null> {
    const existing = this.incidents.get(id);
    if (!existing) return null;
    const updated: IIncident = {
      ...existing,
      ...updates
    };
    this.incidents.set(id, updated);
    return { ...updated };
  }

  public async appendIncidentTimeline(
    id: string,
    event: { event: string; details: string; operator?: string }
  ): Promise<IIncident | null> {
    const inc = this.incidents.get(id);
    if (!inc) return null;
    inc.timeline.push({
      timestamp: new Date().toISOString(),
      ...event
    });
    return { ...inc };
  }
}

export const dbStore = new InMemoryStore();

export const connectDatabase = async (): Promise<void> => {
  try {
    if (ENV.MONGODB_URI && !ENV.MONGODB_URI.includes('mock')) {
      mongoose.set('strictQuery', false);
      const conn = await mongoose.connect(ENV.MONGODB_URI, {
        serverSelectionTimeoutMS: 2000
      });
      dbStore.isConnectedToMongo = true;
      console.log(`[Database] Connected successfully to MongoDB: ${conn.connection.host}`);
    } else {
      console.log(`[Database] Running in In-Memory High-Speed Embedded Store (SIMULATION READY)`);
    }
  } catch (error) {
    console.warn(`[Database] MongoDB connection bypassed (running In-Memory DataStore): ${(error as Error).message}`);
    dbStore.isConnectedToMongo = false;
  }
};
