import { Router } from 'express';
import { login, callback, logout } from '../../controllers/authController.js';

const router = Router();

router.get('/login', login);
router.get('/callback', callback);
router.get('/logout', logout);

export default router;
