import { Request, Response } from 'express';
import { ZoneService } from '../services/zone.service';

export class ZoneController {
  public static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const zones = await ZoneService.getAllZones();
      res.status(200).json({ success: true, count: zones.length, data: zones });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch zones', error: (error as Error).message });
    }
  }

  public static async getById(req: Request, res: Response): Promise<void> {
    try {
      const zone = await ZoneService.getZoneById(req.params.id);
      if (!zone) {
        res.status(404).json({ success: false, message: 'Restricted Zone not found' });
        return;
      }
      res.status(200).json({ success: true, data: zone });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch zone', error: (error as Error).message });
    }
  }

  public static async create(req: Request, res: Response): Promise<void> {
    try {
      const { id, name, description, zoneType, geometry, severity, warningDistance, status } = req.body;

      if (!name || !geometry || !geometry.coordinates) {
        res.status(400).json({ success: false, message: 'Zone name and GeoJSON polygon geometry are required' });
        return;
      }

      const newZone = await ZoneService.createZone({
        id,
        name,
        description: description || '',
        zoneType: zoneType || 'restricted',
        geometry,
        severity: severity || 'high',
        warningDistance: warningDistance !== undefined ? Number(warningDistance) : 1000,
        status: status || 'active'
      });

      res.status(201).json({ success: true, message: 'Restricted Zone created successfully', data: newZone });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to create zone', error: (error as Error).message });
    }
  }

  public static async update(req: Request, res: Response): Promise<void> {
    try {
      const updated = await ZoneService.updateZone(req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Restricted Zone not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Restricted Zone updated successfully', data: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update zone', error: (error as Error).message });
    }
  }

  public static async delete(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await ZoneService.deleteZone(req.params.id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Restricted Zone not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Restricted Zone deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete zone', error: (error as Error).message });
    }
  }
}
