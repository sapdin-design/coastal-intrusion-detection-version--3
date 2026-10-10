import { Request, Response } from 'express';
import { IntrusionService } from '../services/intrusion.service';
import { dbStore } from '../config/database';

export class LocationController {
  public static async recordLocation(req: Request, res: Response): Promise<void> {
    try {
      const { vesselId, latitude, longitude, speed, heading } = req.body;

      if (!vesselId || latitude === undefined || longitude === undefined) {
        res.status(400).json({ success: false, message: 'vesselId, latitude, and longitude are required' });
        return;
      }

      const result = await IntrusionService.processVesselLocation(
        vesselId,
        Number(latitude),
        Number(longitude),
        speed !== undefined ? Number(speed) : 0,
        heading !== undefined ? Number(heading) : 0
      );

      res.status(200).json({
        success: true,
        message: 'Location processed and geofences evaluated',
        data: result
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to record location', error: (error as Error).message });
    }
  }

  public static async getVesselHistory(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 200;
      const history = await dbStore.getLocationLogsByVessel(req.params.id, limit);

      res.status(200).json({
        success: true,
        vesselId: req.params.id,
        count: history.length,
        data: history
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch vessel history', error: (error as Error).message });
    }
  }
}
