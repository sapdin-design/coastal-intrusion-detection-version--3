import { Router } from 'express';
import { VesselController } from '../controllers/vessel.controller';
import { LocationController } from '../controllers/location.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';

const router = Router();

router.get('/', VesselController.getAll);
router.get('/:id', VesselController.getById);
router.get('/:id/locations', LocationController.getVesselHistory);
router.post('/', authenticateJWT, requireRoles(['admin']), VesselController.create);
router.put('/:id', authenticateJWT, VesselController.update);
router.put('/:id/authorization', authenticateJWT, requireRoles(['admin']), VesselController.setAuthorization);
router.delete('/:id', authenticateJWT, requireRoles(['admin']), VesselController.delete);

export default router;
