import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import usersModel from '../models/usersModel.js';

export const login = (req, res) => {
  return res.redirect(config.auth.buwanaLoginUrl);
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
