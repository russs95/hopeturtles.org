import { Router } from 'express';
import { getBoats, createBoat, updateBoat, deleteBoat } from '../../controllers/boatsController.js';
import { ensureAdmin, ensureAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/', getBoats);
router.post('/', ensureAuth, ensureAdmin, createBoat);
router.put('/:id', ensureAuth, ensureAdmin, updateBoat);
router.delete('/:id', ensureAuth, ensureAdmin, deleteBoat);

export default router;
