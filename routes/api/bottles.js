import { Router } from 'express';
import {
  listBottles,
  getBottle,
  createBottle,
  updateBottle,
  deleteBottle
} from '../../controllers/bottlesController.js';
import { ensureAdmin, ensureAuth } from '../../middleware/auth.js';

const router = Router();

router.use(ensureAuth, ensureAdmin);

router.get('/', listBottles);
router.get('/:id', getBottle);
router.post('/', createBottle);
router.put('/:id', updateBottle);
router.delete('/:id', deleteBottle);

export default router;
