import { Router } from 'express';
import {
  getAlerts,
  getActiveAlerts,
  createAlert,
  updateAlert,
  deleteAlert
} from '../../controllers/alertsController.js';
import { ensureAdmin, ensureAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/', getAlerts);
router.get('/active', getActiveAlerts);
router.post('/', ensureAuth, ensureAdmin, createAlert);
router.put('/:id', ensureAuth, ensureAdmin, updateAlert);
router.delete('/:id', ensureAuth, ensureAdmin, deleteAlert);

export default router;
