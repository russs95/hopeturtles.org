import { Router } from 'express';
import { getBottles, createBottle, updateBottle, deleteBottle } from '../../controllers/bottlesController.js';
import { ensureAdmin, ensureAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/', getBottles);
router.post('/', ensureAuth, ensureAdmin, createBottle);
router.put('/:id', ensureAuth, ensureAdmin, updateBottle);
router.delete('/:id', ensureAuth, ensureAdmin, deleteBottle);

export default router;
