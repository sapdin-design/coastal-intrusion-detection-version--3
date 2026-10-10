import { Request, Response } from 'express';
import { VesselService } from '../services/vessel.service';

export class VesselController {
  public static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const vessels = await VesselService.getAllVessels();
      res.status(200).json({ success: true, count: vessels.length, data: vessels });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch vessels', error: (error as Error).message });
    }
  }

  public static async getById(req: Request, res: Response): Promise<void> {
    try {
      const vessel = await VesselService.getVesselById(req.params.id);
      if (!vessel) {
        res.status(404).json({ success: false, message: 'Vessel not found' });
        return;
      }
      res.status(200).json({ success: true, data: vessel });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch vessel', error: (error as Error).message });
    }
  }

  public static async create(req: Request, res: Response): Promise<void> {
    try {
      const { id, name, type, registrationNumber, owner, authorizationStatus, latitude, longitude, speed, heading } = req.body;

      if (!id || !name || !type) {
        res.status(400).json({ success: false, message: 'Vessel ID, name, and type are required' });
        return;
      }

      const existing = await VesselService.getVesselById(id);
      if (existing) {
        res.status(409).json({ success: false, message: `Vessel with ID ${id} already exists` });
        return;
      }

      const newVessel = await VesselService.createVessel({
        id,
        name,
        type,
        registrationNumber: registrationNumber || `REG-${id}`,
        owner: owner || 'Independent Operator',
        authorizationStatus: authorizationStatus || 'pending',
        latitude: latitude !== undefined ? latitude : 8.01,
        longitude: longitude !== undefined ? longitude : 77.55,
        speed: speed !== undefined ? speed : 0,
        heading: heading !== undefined ? heading : 0,
        isActive: true
      });

      res.status(201).json({ success: true, message: 'Vessel created successfully', data: newVessel });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to create vessel', error: (error as Error).message });
    }
  }

  public static async update(req: Request, res: Response): Promise<void> {
    try {
      const updated = await VesselService.updateVessel(req.params.id, req.body);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Vessel not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Vessel updated successfully', data: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to update vessel', error: (error as Error).message });
    }
  }

  public static async delete(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await VesselService.deleteVessel(req.params.id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Vessel not found' });
        return;
      }
      res.status(200).json({ success: true, message: 'Vessel deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to delete vessel', error: (error as Error).message });
    }
  }

  public static async setAuthorization(req: Request, res: Response): Promise<void> {
    try {
      const { authorizationStatus } = req.body;
      if (!authorizationStatus) {
        res.status(400).json({ success: false, message: 'authorizationStatus is required' });
        return;
      }
      const updated = await VesselService.setAuthorizationStatus(req.params.id, authorizationStatus);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Vessel not found' });
        return;
      }
      res.status(200).json({ success: true, message: `Vessel status set to ${authorizationStatus}`, data: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to set authorization status', error: (error as Error).message });
    }
  }
}
