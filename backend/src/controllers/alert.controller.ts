import { Request, Response } from 'express';
import { AlertService } from '../services/alert.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class AlertController {
  public static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const severity = req.query.severity as string | undefined;
      const status = req.query.status as string | undefined;
      const alerts = await AlertService.getAllAlerts({ severity, status });

      res.status(200).json({ success: true, count: alerts.length, data: alerts });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch alerts', error: (error as Error).message });
    }
  }

  public static async getById(req: Request, res: Response): Promise<void> {
    try {
      const alert = await AlertService.getAlertById(req.params.id);
      if (!alert) {
        res.status(404).json({ success: false, message: 'Alert not found' });
        return;
      }
      res.status(200).json({ success: true, data: alert });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch alert', error: (error as Error).message });
    }
  }

  public static async acknowledge(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const operatorName = req.user?.name || req.body.operatorName || 'Duty Coastal Operator';
      const updated = await AlertService.acknowledgeAlert(req.params.id, operatorName);

      if (!updated) {
        res.status(404).json({ success: false, message: 'Alert not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Alert acknowledged', data: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to acknowledge alert', error: (error as Error).message });
    }
  }

  public static async resolve(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const operatorName = req.user?.name || req.body.operatorName || 'Duty Coastal Operator';
      const updated = await AlertService.resolveAlert(req.params.id, operatorName);

      if (!updated) {
        res.status(404).json({ success: false, message: 'Alert not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Alert resolved', data: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to resolve alert', error: (error as Error).message });
    }
  }
}
