import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { config } from '../config/env.js';
import usersModel from '../models/usersModel.js';
import { generatePkcePair, generateRandomState } from '../utils/auth/pkce.js';

const buildAuthorizeUrl = ({ codeChallenge, state, nonce }) => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.auth.buwanaClientId,
    redirect_uri: config.auth.buwanaRedirectUri,
    scope: config.auth.buwanaScope,
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });

  return `${config.auth.buwanaAuthorizeUrl}?${params.toString()}`;
};

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
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to exchange authorization code: ${response.status} ${response.statusText} ${errorBody}`
    );
  }

  return response.json();
};

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

const validateIdToken = async ({ idToken, accessToken, nonce }) => {
  const decoded = jwt.decode(idToken, { complete: true });

  if (!decoded?.header?.kid) {
    throw new Error('Unable to decode ID token header.');
  }

  const client = getJwksClient();
  const previousHeaders = client.options.requestHeaders;

  client.options.requestHeaders = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : undefined;

  const key = await client.getSigningKey(decoded.header.kid);
  client.options.requestHeaders = previousHeaders;

  const signingKey = key.getPublicKey();

  return jwt.verify(idToken, signingKey, {
    algorithms: ['RS256'],
    audience: config.auth.buwanaClientId,
    nonce
  });
};

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

const handleTokenExchange = async (req, code) => {
  const pkce = req.session.pkce;

  if (!pkce?.verifier) {
    throw new Error('No PKCE verifier present in session. Start a new login.');
  }

  const tokenResponse = await exchangeAuthorizationCode({
    code,
    codeVerifier: pkce.verifier
  });

  const claims = await validateIdToken({
    idToken: tokenResponse.id_token,
    accessToken: tokenResponse.access_token,
    nonce: pkce.nonce
  });

  await storeSessionFromTokens(req, tokenResponse, claims);

  delete req.session.pkce;

  return {
    tokens: tokenResponse,
    claims,
    user: req.session.user
  };
};

export const login = (req, res) => {
  const { verifier, challenge } = generatePkcePair();
  const state = generateRandomState();
  const nonce = generateRandomState();

  req.session.pkce = {
    verifier,
    challenge,
    state,
    nonce,
    createdAt: Date.now()
  };

  const authorizeUrl = buildAuthorizeUrl({
    codeChallenge: challenge,
    state,
    nonce
  });

  return res.redirect(authorizeUrl);
};

const maskValue = (value, visible = 4) => {
  if (!value || typeof value !== 'string') {
    return value;
  }

  if (value.length <= visible * 2) {
    return `${value.slice(0, 1)}…${value.slice(-1)}`;
  }

  return `${value.slice(0, visible)}…${value.slice(-visible)}`;
};

const buildSessionDebug = (req, state) => {
  const pkce = req.session?.pkce;

  return {
    sessionId: req.sessionID,
    hasSession: Boolean(req.session),
    hasPkce: Boolean(pkce),
    pkceCreatedAt: pkce?.createdAt ? new Date(pkce.createdAt).toISOString() : null,
    pkceState: maskValue(pkce?.state),
    receivedState: maskValue(state),
    pkceNonce: maskValue(pkce?.nonce),
    cookies: Object.keys(req.cookies || {})
  };
};

export const callback = async (req, res, next) => {
  try {
    const { code, state, error, error_description: description } = req.query;

    if (error) {
      console.warn('Auth callback received error response from Buwana.', {
        error,
        description,
        session: buildSessionDebug(req, state)
      });
      return res.status(400).render('error', {
        pageTitle: 'Authentication error',
        message: description || error
      });
    }

    if (!code) {
      return res.status(400).render('error', {
        pageTitle: 'Authentication error',
        message: 'No authorization code returned from Buwana.'
      });
    }

    const pkce = req.session.pkce;

    if (!pkce || state !== pkce.state) {
      console.warn('Auth callback state validation failed.', buildSessionDebug(req, state));
      return res.status(400).render('error', {
        pageTitle: 'Authentication error',
        message: 'Invalid or mismatched state parameter.'
      });
    }

    await handleTokenExchange(req, code);

    return res.redirect('/dashboard');
  } catch (error) {
    return next(error);
  }
};

export const exchangeToken = async (req, res, next) => {
  try {
    const code = req.body?.code || req.query?.code;

    if (!code) {
      if (req.session?.tokens?.accessToken) {
        return res.json({
          access_token: req.session.tokens.accessToken,
          id_token: req.session.tokens.idToken,
          token_type: req.session.tokens.tokenType,
          expires_in: req.session.tokens.expiresAt
            ? Math.max(0, Math.round((req.session.tokens.expiresAt - Date.now()) / 1000))
            : null,
          refresh_token: req.session.tokens.refreshToken,
          user: req.session.user,
          claims: req.session.idTokenClaims
        });
      }

      return res.status(400).json({
        error: 'invalid_request',
        error_description: 'Authorization code is required.'
      });
    }

    const result = await handleTokenExchange(req, code);

    return res.json({
      access_token: result.tokens.access_token,
      id_token: result.tokens.id_token,
      token_type: result.tokens.token_type,
      expires_in: result.tokens.expires_in,
      refresh_token: result.tokens.refresh_token,
      user: result.user,
      claims: result.claims
    });
  } catch (error) {
    return next(error);
  }
};

export const userinfo = (req, res) => {
  if (!req.session?.user || !req.session?.idTokenClaims) {
    return res.status(401).json({
      error: 'unauthorized',
      error_description: 'User is not authenticated.'
    });
  }

  return res.json({
    user: req.session.user,
    claims: req.session.idTokenClaims,
    tokens: req.session.tokens
  });
};

export const logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
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
