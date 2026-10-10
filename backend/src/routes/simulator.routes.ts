import { Router } from 'express';
import { SimulatorController } from '../controllers/simulator.controller';

const router = Router();

router.get('/status', SimulatorController.getStatus);
router.post('/start', SimulatorController.start);
router.post('/pause', SimulatorController.pause);
router.post('/resume', SimulatorController.resume);
router.post('/stop', SimulatorController.stop);
router.post('/reset', SimulatorController.reset);
router.post('/speed', SimulatorController.setSpeed);
router.post('/inject', SimulatorController.inject);

export default router;
