import { Request, Response } from 'express';
import { IncidentService } from '../services/incident.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { IncidentStatus } from '../models/types';

export class IncidentController {
  public static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const status = req.query.status as string | undefined;
      const vesselId = req.query.vesselId as string | undefined;
      const incidents = await IncidentService.getAllIncidents({ status, vesselId });

      res.status(200).json({ success: true, count: incidents.length, data: incidents });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch incidents', error: (error as Error).message });
    }
  }

  public static async getById(req: Request, res: Response): Promise<void> {
    try {
      const incident = await IncidentService.getIncidentById(req.params.id);
      if (!incident) {
        res.status(404).json({ success: false, message: 'Incident not found' });
        return;
      }
      res.status(200).json({ success: true, data: incident });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch incident', error: (error as Error).message });
    }
  }

  public static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { status, notes, assignedOperator } = req.body;
      const operatorName = assignedOperator || req.user?.name || 'Duty Operator';

      if (!status) {
        res.status(400).json({ success: false, message: 'Status is required' });
        return;
      }

      const updated = await IncidentService.updateIncidentStatus(
        req.params.id,
        status as IncidentStatus,
        operatorName,
        notes
      );

      if (!updated) {
        res.status(404).json({ success: false, message: 'Incident not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Incident updated successfully', data: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update incident', error: (error as Error).message });
    }
  }

  public static async addNote(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { event, details } = req.body;
      const operatorName = req.user?.name || 'Duty Operator';

      if (!details) {
        res.status(400).json({ success: false, message: 'Details are required' });
        return;
      }

      const updated = await IncidentService.addTimelineNote(
        req.params.id,
        event || 'Operator Note Added',
        details,
        operatorName
      );

      if (!updated) {
        res.status(404).json({ success: false, message: 'Incident not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Timeline note added successfully', data: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to add timeline note', error: (error as Error).message });
    }
  }
}
