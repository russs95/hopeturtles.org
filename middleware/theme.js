import { config } from '../config/env.js';

export const themeMiddleware = (req, res, next) => {
  const cookieTheme = req.cookies?.theme;
  let theme = config.appearance.defaultTheme;
  if (
    cookieTheme &&
    config.appearance.supportedThemes.map((t) => t.trim()).includes(cookieTheme)
  ) {
    theme = cookieTheme;
  }
  res.locals.theme = theme;
  res.locals.supportedThemes = config.appearance.supportedThemes;
  next();
};

export default themeMiddleware;
