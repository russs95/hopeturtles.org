import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import usersModel from '../models/usersModel.js';

const resolveRedirectUri = (req) => {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers['x-forwarded-host'] || req.get('host');
  return `${protocol}://${host}/auth/callback`;
};

export const login = (req, res) => {
  const redirectUri = encodeURIComponent(resolveRedirectUri(req));
  const loginUrl = `${config.auth.buwanaApiUrl}/authorize?client_id=${encodeURIComponent(
    config.auth.buwanaClientId
  )}&redirect_uri=${redirectUri}&response_type=token`;
  return res.redirect(loginUrl);
};

export const callback = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).render('error', {
        pageTitle: 'Authentication error',
        message: 'No token returned from Buwana.'
      });
    }
    const publicKey = config.auth.buwanaPublicKey?.replace(/\\n/g, '\n');
    const payload = jwt.verify(token, publicKey, {
      algorithms: ['RS256']
    });

    const user = await usersModel.upsertFromBuwana({
      buwana_id: payload.sub,
      email: payload.email,
      full_name: payload.name || payload.full_name,
      role: payload.role || 'user',
      last_login: new Date()
    });
    req.session.user = {
      id: user.buwana_id,
      email: user.email,
      name: user.full_name,
      role: user.role
    };
    return res.redirect('/dashboard');
  } catch (error) {
    return next(error);
  }
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
  logout
};
