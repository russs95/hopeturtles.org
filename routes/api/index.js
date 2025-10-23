import { Router } from 'express';
import missionsRouter from './missions.js';
import turtlesRouter from './turtles.js';
import telemetryRouter from './telemetry.js';
import successRouter from './success.js';
import alertsRouter from './alerts.js';
import hubsRouter from './hubs.js';
import boatsRouter from './boats.js';
import summaryRouter from './summary.js';

const router = Router();

router.use('/missions', missionsRouter);
router.use('/turtles', turtlesRouter);
router.use('/telemetry', telemetryRouter);
router.use('/success', successRouter);
router.use('/alerts', alertsRouter);
router.use('/hubs', hubsRouter);
router.use('/boats', boatsRouter);
router.use('/', summaryRouter);

export default router;
