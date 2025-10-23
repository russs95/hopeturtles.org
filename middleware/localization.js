import { config } from '../config/env.js';
import {
  getAvailableLanguages,
  getLanguageLabel,
  getTranslations,
  isRtl
} from '../utils/localization.js';

export const languageMiddleware = (req, res, next) => {
  const cookieLang = req.cookies?.lang;
  const queryLang = req.query?.lang;
  const langCandidate = queryLang || cookieLang;

  let lang = config.appearance.defaultLang;
  if (langCandidate && getAvailableLanguages().includes(langCandidate)) {
    lang = langCandidate;
    if (lang !== cookieLang) {
      res.cookie('lang', lang, { httpOnly: false, maxAge: 31536000000, sameSite: 'lax' });
    }
  } else if (cookieLang && !getAvailableLanguages().includes(cookieLang)) {
    res.clearCookie('lang');
  }

  res.locals.lang = lang;
  res.locals.t = getTranslations(lang);
  res.locals.direction = isRtl(lang) ? 'rtl' : 'ltr';
  res.locals.languages = getAvailableLanguages().map((code) => ({
    code,
    label: getLanguageLabel(code)
  }));
  next();
};

export default languageMiddleware;
