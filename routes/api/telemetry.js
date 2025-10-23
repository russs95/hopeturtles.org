import { Router } from 'express';
import {
  getTelemetryForTurtle,
  getLatestTelemetry
} from '../../controllers/telemetryController.js';

const router = Router();

router.get('/latest', getLatestTelemetry);
router.get('/:turtle_id', getTelemetryForTurtle);

export default router;
