import path from 'path';
import usersModel from '../models/usersModel.js';

const getCurrentUserId = (req) => req.session?.user?.buwanaId ?? req.session?.user?.id ?? null;

const getProfileFeedback = (req) => {
  const feedback = req.session?.profileFeedback || null;
  if (req.session) {
    req.session.profileFeedback = null;
  }
  return feedback;
};

const setProfileFeedback = (req, type, message) => {
  if (!req.session) {
    return;
  }
  req.session.profileFeedback = { type, message };
};

export const renderProfilePage = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.redirect('/login');
    }
    const profileUser = await usersModel.findByBuwanaId(userId);
    if (!profileUser) {
      return res.status(404).render('error', {
        pageTitle: 'Profile not found',
        message: 'We could not find your profile details.'
      });
    }
    const profileFeedback = getProfileFeedback(req);
    return res.render('profile', {
      pageTitle: 'Your Profile',
      profileUser,
      profileFeedback
    });
  } catch (error) {
    return next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.redirect('/login');
    }

    const updates = {};
    const hasTitleField = Object.prototype.hasOwnProperty.call(req.body || {}, 'team_title');
    const hasProfileField = Object.prototype.hasOwnProperty.call(req.body || {}, 'profile_txt');

    if (hasTitleField) {
      const rawTitle = typeof req.body.team_title === 'string' ? req.body.team_title.trim() : '';
      updates.team_title = rawTitle || null;
    }

    if (hasProfileField) {
      const rawProfile = typeof req.body.profile_txt === 'string' ? req.body.profile_txt.trim() : '';
      updates.profile_txt = rawProfile || null;
    }

    if (req.file) {
      updates.profile_pic = path.posix.join('/uploads', req.file.filename);
    }

    const hasUpdates = Object.keys(updates).length > 0;
    if (!hasUpdates) {
      setProfileFeedback(req, 'error', 'Please provide details to update.');
      return res.redirect('/profile');
    }

    await usersModel.update(userId, updates);
    setProfileFeedback(req, 'success', 'Profile updated successfully.');
    return res.redirect('/profile');
  } catch (error) {
    setProfileFeedback(req, 'error', error.message || 'Unable to update your profile.');
    return res.redirect('/profile');
  }
};

export default {
  renderProfilePage,
  updateProfile
};
