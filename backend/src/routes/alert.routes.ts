import { Router } from 'express';
import { AlertController } from '../controllers/alert.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.get('/', AlertController.getAll);
router.get('/:id', AlertController.getById);
router.put('/:id/acknowledge', authenticateJWT, AlertController.acknowledge);
router.put('/:id/resolve', authenticateJWT, AlertController.resolve);

export default router;
