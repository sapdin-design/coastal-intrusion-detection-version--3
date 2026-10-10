import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { dbStore } from '../config/database';

export class DashboardController {
  public static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await AnalyticsService.getDashboardStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats', error: (error as Error).message });
    }
  }

  public static async getActivity(req: Request, res: Response): Promise<void> {
    try {
      const alerts = await dbStore.getAllAlerts();
      const incidents = await dbStore.getAllIncidents();
      const recentLogs = dbStore.locationLogs.slice(-20).reverse();

      res.status(200).json({
        success: true,
        data: {
          recentAlerts: alerts.slice(0, 10),
          recentIncidents: incidents.slice(0, 10),
          recentLogs
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch recent activity', error: (error as Error).message });
    }
  }
}
