import { Router } from 'express';
import {
  login,
  callback,
  exchangeToken,
  userinfo,
  logout
} from '../../controllers/authController.js';

const router = Router();

router.get('/login', login);
router.get('/callback', callback);
router.post('/token', exchangeToken);
router.get('/userinfo', userinfo);
router.get('/logout', logout);

export default router;
