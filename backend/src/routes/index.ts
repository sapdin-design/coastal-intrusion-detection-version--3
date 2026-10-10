import { Router } from 'express';
import authRoutes from './auth.routes';
import vesselRoutes from './vessel.routes';
import zoneRoutes from './zone.routes';
import locationRoutes from './location.routes';
import alertRoutes from './alert.routes';
import incidentRoutes from './incident.routes';
import dashboardRoutes from './dashboard.routes';
import analyticsRoutes from './analytics.routes';
import simulatorRoutes from './simulator.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/vessels', vesselRoutes);
router.use('/zones', zoneRoutes);
router.use('/locations', locationRoutes);
router.use('/alerts', alertRoutes);
router.use('/incidents', incidentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/simulator', simulatorRoutes);

export default router;
