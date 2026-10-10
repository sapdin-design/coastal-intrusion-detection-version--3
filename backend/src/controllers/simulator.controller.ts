import { Request, Response } from 'express';
import { SimulatorService } from '../services/simulator.service';
import { SimulationScenario } from '../models/types';

export class SimulatorController {
  public static async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = SimulatorService.getStatus();
      res.status(200).json({ success: true, data: status });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch simulator status', error: (error as Error).message });
    }
  }

  public static async start(req: Request, res: Response): Promise<void> {
    try {
      const { scenario, speedMultiplier } = req.body;
      const status = await SimulatorService.start(
        (scenario as SimulationScenario) || 'intrusion_demo',
        speedMultiplier ? Number(speedMultiplier) : 1
      );
      res.status(200).json({ success: true, message: `Simulator started scenario '${status.scenario}'`, data: status });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to start simulator', error: (error as Error).message });
    }
  }

  public static async pause(req: Request, res: Response): Promise<void> {
    try {
      const status = SimulatorService.pause();
      res.status(200).json({ success: true, message: 'Simulator paused', data: status });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to pause simulator', error: (error as Error).message });
    }
  }

  public static async resume(req: Request, res: Response): Promise<void> {
    try {
      const status = SimulatorService.resume();
      res.status(200).json({ success: true, message: 'Simulator resumed', data: status });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to resume simulator', error: (error as Error).message });
    }
  }

  public static async stop(req: Request, res: Response): Promise<void> {
    try {
      const status = SimulatorService.stop();
      res.status(200).json({ success: true, message: 'Simulator stopped', data: status });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to stop simulator', error: (error as Error).message });
    }
  }

  public static async reset(req: Request, res: Response): Promise<void> {
    try {
      const status = SimulatorService.reset();
      res.status(200).json({ success: true, message: 'Simulator state reset to initial', data: status });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to reset simulator', error: (error as Error).message });
    }
  }

  public static async setSpeed(req: Request, res: Response): Promise<void> {
    try {
      const { speedMultiplier } = req.body;
      if (!speedMultiplier) {
        res.status(400).json({ success: false, message: 'speedMultiplier is required' });
        return;
      }
      const status = SimulatorService.setSpeed(Number(speedMultiplier));
      res.status(200).json({ success: true, message: `Speed set to ${status.speedMultiplier}x`, data: status });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to set speed', error: (error as Error).message });
    }
  }

  public static async inject(req: Request, res: Response): Promise<void> {
    try {
      const { vesselId, latitude, longitude, speed, heading } = req.body;
      if (!vesselId || latitude === undefined || longitude === undefined) {
        res.status(400).json({ success: false, message: 'vesselId, latitude, and longitude are required' });
        return;
      }
      const result = await SimulatorService.injectVesselPosition(
        vesselId,
        Number(latitude),
        Number(longitude),
        speed !== undefined ? Number(speed) : 15,
        heading !== undefined ? Number(heading) : 0
      );
      res.status(200).json({ success: true, message: 'Position injected successfully', data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to inject position', error: (error as Error).message });
    }
  }
}
