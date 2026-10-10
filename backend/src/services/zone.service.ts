import { dbStore } from '../config/database';
import { IZone } from '../models/types';

export class ZoneService {
  public static async getAllZones(): Promise<IZone[]> {
    return await dbStore.getAllZones();
  }

  public static async getZoneById(id: string): Promise<IZone | null> {
    return await dbStore.getZoneById(id);
  }

  public static async createZone(zoneData: Omit<IZone, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<IZone> {
    return await dbStore.createZone(zoneData);
  }

  public static async updateZone(id: string, updates: Partial<IZone>): Promise<IZone | null> {
    return await dbStore.updateZone(id, updates);
  }

  public static async deleteZone(id: string): Promise<boolean> {
    return await dbStore.deleteZone(id);
  }
}
