import { Server as SocketIOServer } from 'socket.io';
import { dbStore } from '../config/database';
import { IIncident, IncidentStatus } from '../models/types';

export class IncidentService {
  private static ioInstance: SocketIOServer | null = null;

  public static setSocketIO(io: SocketIOServer) {
    this.ioInstance = io;
  }

  public static async getAllIncidents(filters?: { status?: string; vesselId?: string }): Promise<IIncident[]> {
    let incidents = await dbStore.getAllIncidents();
    if (filters?.status) {
      incidents = incidents.filter((i) => i.status.toLowerCase() === filters.status?.toLowerCase());
    }
    if (filters?.vesselId) {
      incidents = incidents.filter((i) => i.vesselId === filters.vesselId);
    }
    return incidents;
  }

  public static async getIncidentById(id: string): Promise<IIncident | null> {
    return await dbStore.getIncidentById(id);
  }

  public static async updateIncidentStatus(
    id: string,
    status: IncidentStatus,
    operatorName?: string,
    notes?: string
  ): Promise<IIncident | null> {
    const existing = await dbStore.getIncidentById(id);
    if (!existing) return null;

    const updates: Partial<IIncident> = { status };
    if (status === 'resolved') {
      updates.resolvedAt = new Date().toISOString();
    } else if (status === 'closed') {
      updates.closedAt = new Date().toISOString();
    }

    if (operatorName && !existing.assignedOperator) {
      updates.assignedOperator = operatorName;
    }

    const updated = await dbStore.updateIncident(id, updates);

    // Append timeline entry
    if (updated) {
      await dbStore.appendIncidentTimeline(id, {
        event: `Status changed to ${status.toUpperCase()}`,
        details: notes || `Incident updated to ${status} by operator ${operatorName || 'System'}`,
        operator: operatorName
      });

      const finalInc = await dbStore.getIncidentById(id);
      if (this.ioInstance && finalInc) {
        this.ioInstance.emit('incident:updated', finalInc);
      }
      return finalInc;
    }

    return updated;
  }

  public static async addTimelineNote(
    id: string,
    event: string,
    details: string,
    operatorName?: string
  ): Promise<IIncident | null> {
    const updated = await dbStore.appendIncidentTimeline(id, {
      event,
      details,
      operator: operatorName
    });

    if (this.ioInstance && updated) {
      this.ioInstance.emit('incident:updated', updated);
    }
    return updated;
  }
}
