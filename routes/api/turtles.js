import { Router } from 'express';
import {
  getTurtles,
  getTurtleById,
  createTurtle,
  updateTurtle,
  deleteTurtle
} from '../../controllers/turtlesController.js';
import { ensureAdmin, ensureAuth } from '../../middleware/auth.js';

const router = Router();

router.get('/', getTurtles);
router.get('/:id', getTurtleById);
router.post('/', ensureAuth, ensureAdmin, createTurtle);
router.put('/:id', ensureAuth, ensureAdmin, updateTurtle);
router.delete('/:id', ensureAuth, ensureAdmin, deleteTurtle);

export default router;
