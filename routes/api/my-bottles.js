import { Router } from 'express';
import { listMyBottles, registerMyBottle } from '../../controllers/bottlesController.js';
import { ensureAuth } from '../../middleware/auth.js';

const router = Router();

router.use(ensureAuth);

router.get('/', listMyBottles);
router.post('/', registerMyBottle);

export default router;
