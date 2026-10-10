import { Router } from 'express';
import { LocationController } from '../controllers/location.controller';

const router = Router();

router.post('/', LocationController.recordLocation);

export default router;
