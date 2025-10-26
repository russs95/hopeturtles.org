import { Router } from 'express';
import {
  login,
  callback,
  exchangeToken,
  userinfo,
  logout
} from '../../controllers/authController.js';

const router = Router();

/**
 * GET /auth/login
 * Starts the OAuth2 flow with Buwana
 */
router.get('/login', login);

/**
 * GET /auth/callback
 * Handles the redirect from Buwana after login
 * Includes detailed console logging for debugging
 */
router.get('/callback', callback);

/**
 * POST /auth/token
 * Exchanges authorization code for access token
 */
router.post('/token', exchangeToken);

/**
 * GET /auth/userinfo
 * Retrieves logged-in user information
 */
router.get('/userinfo', userinfo);

/**
 * GET /auth/logout
 * Logs the user out and clears the session
 */
router.get('/logout', logout);

export default router;
