import { Router } from 'express';
import {
  getMissions,
  getMissionById,
  createMission,
  updateMission,
  deleteMission
} from '../../controllers/missionsController.js';
import { ensureAdmin, ensureAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/', getMissions);
router.get('/:id', getMissionById);
router.post('/', ensureAuth, ensureAdmin, createMission);
router.put('/:id', ensureAuth, ensureAdmin, updateMission);
router.delete('/:id', ensureAuth, ensureAdmin, deleteMission);

export default router;
