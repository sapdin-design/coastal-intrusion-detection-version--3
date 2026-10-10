import { Server as SocketIOServer } from 'socket.io';
import { dbStore } from '../config/database';
import { IAlert } from '../models/types';

export class AlertService {
  private static ioInstance: SocketIOServer | null = null;

  public static setSocketIO(io: SocketIOServer) {
    this.ioInstance = io;
  }

  public static async getAllAlerts(filters?: { severity?: string; status?: string }): Promise<IAlert[]> {
    let alerts = await dbStore.getAllAlerts();
    if (filters?.severity) {
      alerts = alerts.filter((a) => a.severity.toLowerCase() === filters.severity?.toLowerCase());
    }
    if (filters?.status) {
      alerts = alerts.filter((a) => a.status.toLowerCase() === filters.status?.toLowerCase());
    }
    return alerts;
  }

  public static async getAlertById(id: string): Promise<IAlert | null> {
    return await dbStore.getAlertById(id);
  }

  public static async acknowledgeAlert(id: string, operatorName: string): Promise<IAlert | null> {
    const updated = await dbStore.updateAlert(id, {
      status: 'acknowledged',
      acknowledgedBy: operatorName,
      acknowledgedAt: new Date().toISOString()
    });

    if (updated && this.ioInstance) {
      this.ioInstance.emit('alert:acknowledged', updated);
    }
    return updated;
  }

  public static async resolveAlert(id: string, operatorName: string): Promise<IAlert | null> {
    const updated = await dbStore.updateAlert(id, {
      status: 'resolved',
      resolvedBy: operatorName,
      resolvedAt: new Date().toISOString()
    });

    if (updated && this.ioInstance) {
      this.ioInstance.emit('alert:resolved', updated);
    }
    return updated;
  }
}
