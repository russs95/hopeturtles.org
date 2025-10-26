import { Router } from 'express';
import {
  login,
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
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;

  console.group('🔐 OAuth Callback Debug');
  console.log('Incoming code:', code);
  console.log('Incoming state:', state);
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  console.log('Session stored state:', req.session?.oauthState);
  console.log('Cookies:', req.headers.cookie);
  console.groupEnd();

  if (!code || !state) {
    console.error('❌ Missing code or state parameter.');
    return res.status(400).send('Missing code or state parameter.');
  }

  // Validate OAuth state token
  if (!req.session || req.session.oauthState !== state) {
    console.error('❌ Invalid or mismatched state parameter.', {
      expected: req.session?.oauthState,
      got: state
    });
    return res.status(400).send('Invalid or mismatched state parameter.');
  }

  try {
    console.log('✅ State matched. Exchanging code for token...');

    const tokenResponse = await fetch(`${process.env.BUWANA_AUTH_URL}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.REDIRECT_URI,
        client_id: process.env.BUWANA_CLIENT_ID,
        client_secret: process.env.BUWANA_CLIENT_SECRET
      })
    });

    const tokenData = await tokenResponse.json();
    console.log('🔑 Token response:', tokenData);

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenData.error || 'unknown_error'}`);
    }

    // Save user info in session
    req.session.user = tokenData.user || {};
    await new Promise((resolve, reject) => req.session.save(err => (err ? reject(err) : resolve())));

    console.log('✅ User session saved successfully.');
    res.redirect('/');
  } catch (error) {
    console.error('💥 OAuth callback error:', error.message);
    res.status(500).send('OAuth callback error: ' + error.message);
  }
});

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
