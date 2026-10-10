import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';

const router = Router();

router.get('/intrusions', AnalyticsController.getIntrusions);
router.get('/alerts', AnalyticsController.getAlerts);
router.get('/vessels', AnalyticsController.getVessels);

export default router;
