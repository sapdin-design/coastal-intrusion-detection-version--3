import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';

export class AnalyticsController {
  public static async getIntrusions(req: Request, res: Response): Promise<void> {
    try {
      const security = await AnalyticsService.getSecurityAnalytics();
      res.status(200).json({ success: true, data: security });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch intrusion analytics', error: (error as Error).message });
    }
  }

  public static async getAlerts(req: Request, res: Response): Promise<void> {
    try {
      const responseAnalytics = await AnalyticsService.getResponseAnalytics();
      res.status(200).json({ success: true, data: responseAnalytics });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch alert analytics', error: (error as Error).message });
    }
  }

  public static async getVessels(req: Request, res: Response): Promise<void> {
    try {
      const vesselAnalytics = await AnalyticsService.getVesselAnalytics();
      res.status(200).json({ success: true, data: vesselAnalytics });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch vessel analytics', error: (error as Error).message });
    }
  }
}
