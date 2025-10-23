import { Router } from 'express';
import { fetchSummary, fetchStats } from '../../controllers/summaryController.js';

const router = Router();

router.get('/summary', fetchSummary);
router.get('/stats', fetchStats);

export default router;
