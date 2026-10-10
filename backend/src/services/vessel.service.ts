import { dbStore } from '../config/database';
import { IVessel } from '../models/types';

export class VesselService {
  public static async getAllVessels(): Promise<IVessel[]> {
    return await dbStore.getAllVessels();
  }

  public static async getVesselById(id: string): Promise<IVessel | null> {
    return await dbStore.getVesselById(id);
  }

  public static async createVessel(vesselData: Omit<IVessel, 'lastSeen' | 'status'> & { status?: IVessel['status'] }): Promise<IVessel> {
    return await dbStore.createVessel(vesselData);
  }

  public static async updateVessel(id: string, updates: Partial<IVessel>): Promise<IVessel | null> {
    return await dbStore.updateVessel(id, updates);
  }

  public static async deleteVessel(id: string): Promise<boolean> {
    return await dbStore.deleteVessel(id);
  }

  public static async setAuthorizationStatus(id: string, authorizationStatus: IVessel['authorizationStatus']): Promise<IVessel | null> {
    return await dbStore.updateVessel(id, { authorizationStatus });
  }
}
