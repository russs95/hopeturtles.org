import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { config } from '../config/env.js';
import usersModel from '../models/usersModel.js';
import { generatePkcePair } from '../utils/auth/pkce.js';

// --------------------------------------------------------------------
// JWKS Client for verifying ID tokens
// --------------------------------------------------------------------
let sharedJwksClient;
const getJwksClient = () => {
  if (!sharedJwksClient) {
    sharedJwksClient = jwksClient({
      jwksUri: config.auth.buwanaJwksUri,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 10 * 60 * 1000,
      rateLimit: true,
      jwksRequestsPerMinute: 10
    });
  }
  return sharedJwksClient;
};

// --------------------------------------------------------------------
// ID Token validation
// --------------------------------------------------------------------
const validateIdToken = async ({ idToken, accessToken, nonce }) => {
  const decoded = jwt.decode(idToken, { complete: true });
  if (!decoded?.header?.kid) throw new Error('Unable to decode ID token header (missing kid).');

  const client = getJwksClient();
  const key = await client.getSigningKey(decoded.header.kid);
  const signingKey = key.getPublicKey();

  return jwt.verify(idToken, signingKey, {
    algorithms: ['RS256'],
    audience: config.auth.buwanaClientId,
    nonce
  });
};

// --------------------------------------------------------------------
// Exchange Authorization Code for Tokens (PKCE)
// --------------------------------------------------------------------
const exchangeAuthorizationCode = async ({ code, codeVerifier }) => {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: config.auth.buwanaClientId,
    redirect_uri: config.auth.buwanaRedirectUri,
    code_verifier: codeVerifier
  });

  const response = await fetch(config.auth.buwanaTokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  if (!response.ok) {
    throw new Error(
      `Failed to exchange authorization code: ${response.status} ${response.statusText} ${text}`
    );
  }

  return json;
};

// --------------------------------------------------------------------
// Store session info from token response
// --------------------------------------------------------------------
const storeSessionFromTokens = async (req, tokens, claims) => {
  const user = await usersModel.upsertFromBuwana({
    buwana_id: claims.sub,
    email: claims.email || claims.preferred_username,
    full_name: claims.name || claims.full_name || claims.nickname,
    role: claims.role || 'user',
    last_login: new Date()
  });

  req.session.user = {
    id: user.buwana_id,
    email: user.email,
    name: user.full_name,
    role: user.role
  };

  req.session.tokens = {
    accessToken: tokens.access_token,
    idToken: tokens.id_token,
    refreshToken: tokens.refresh_token,
    tokenType: tokens.token_type,
    expiresAt: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : null
  };

  req.session.idTokenClaims = claims;
};

// --------------------------------------------------------------------
// LOGIN — Generate PKCE + State + Nonce and redirect to Buwana
// --------------------------------------------------------------------
export const login = async (req, res) => {
  console.group('🌐 OAuth Login Debug');
  console.log('Session before generating PKCE:', req.session);

  const pkce = await generatePkcePair();
  const state = crypto.randomBytes(32).toString('base64url');
  const nonce = crypto.randomBytes(32).toString('base64url');

  req.session.pkce = {
    ...pkce,
    state,
    nonce,
    createdAt: Date.now()
  };

  req.session.save(err => {
    if (err) {
      console.error('❌ Failed to save PKCE to session:', err);
      console.groupEnd();
      return res.status(500).send('Session save failed.');
    }

    console.log('✅ Saved PKCE and state to session:', req.session.pkce);

    const authUrl = new URL(config.auth.buwanaAuthorizeUrl);
    authUrl.searchParams.set('client_id', config.auth.buwanaClientId);
    authUrl.searchParams.set('redirect_uri', config.auth.buwanaRedirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', config.auth.buwanaScope || 'openid email profile');
    authUrl.searchParams.set('code_challenge', pkce.challenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('nonce', nonce);

    console.log('🔗 Redirecting to:', authUrl.toString());
    console.groupEnd();
    res.redirect(authUrl.toString());
  });
};

// --------------------------------------------------------------------
// CALLBACK — Handle redirect from Buwana
// --------------------------------------------------------------------
export const callback = async (req, res, next) => {
  try {
    const { code, state, error, error_description: description } = req.query;

    if (error) {
      console.warn('⚠️ OAuth callback received error:', error, description);
      return res.status(400).render('error', {
        pageTitle: 'Auth Error',
        message: description || error
      });
    }

    // Reload session to ensure latest PKCE is present
    await new Promise(resolve =>
      req.session.reload(err => {
        if (err) console.warn('⚠️ Failed to reload session before state check:', err);
        resolve();
      })
    );

    const pkce = req.session.pkce;

    console.group('🔐 OAuth Callback Debug');
    console.log('Incoming code:', code);
    console.log('Incoming state:', state);
    console.log('Session ID:', req.sessionID);
    console.log('Session PKCE:', pkce);
    console.log('Cookies:', req.headers.cookie);
    console.groupEnd();

    console.log('🔍 Debug: Expected state:', pkce?.state, 'Received:', state);

    if (!pkce || state !== pkce.state) {
      console.error('❌ State mismatch or missing PKCE.', {
        expected: pkce?.state,
        got: state
      });
      return res.status(400).render('error', {
        pageTitle: 'Authentication error',
        message: 'Invalid or mismatched state parameter.'
      });
    }

    await handleTokenExchange(req, code);

    console.log('✅ Authentication successful, redirecting to /dashboard.');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('💥 OAuth callback error:', err.message);
    return next(err);
  }
};

// --------------------------------------------------------------------
// TOKEN / USERINFO / LOGOUT
// --------------------------------------------------------------------
export const exchangeToken = async (req, res, next) => {
  try {
    const code = req.body?.code || req.query?.code;
    if (!code) {
      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Authorization code is required.'
      });
    }
    const result = await handleTokenExchange(req, code);
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const userinfo = (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({
      error: 'unauthorized',
      error_description: 'Not logged in.'
    });
  }
  res.json({
    user: req.session.user,
    claims: req.session.idTokenClaims,
    tokens: req.session.tokens
  });
};

export const logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie(config.auth.sessionCookieName || 'ht.sid');
    res.redirect('/');
  });
};

export default {
  login,
  callback,
  exchangeToken,
  userinfo,
  logout
};
