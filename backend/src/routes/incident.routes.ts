import { Router } from 'express';
import { IncidentController } from '../controllers/incident.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.get('/', IncidentController.getAll);
router.get('/:id', IncidentController.getById);
router.put('/:id', authenticateJWT, IncidentController.update);
router.post('/:id/notes', authenticateJWT, IncidentController.addNote);

export default router;
