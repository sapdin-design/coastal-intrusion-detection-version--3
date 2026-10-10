import { Router } from 'express';
import { ZoneController } from '../controllers/zone.controller';
import { authenticateJWT, requireRoles } from '../middleware/auth.middleware';

const router = Router();

router.get('/', ZoneController.getAll);
router.get('/:id', ZoneController.getById);
router.post('/', authenticateJWT, requireRoles(['admin']), ZoneController.create);
router.put('/:id', authenticateJWT, requireRoles(['admin']), ZoneController.update);
router.delete('/:id', authenticateJWT, requireRoles(['admin']), ZoneController.delete);

export default router;
