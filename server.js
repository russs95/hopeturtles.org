import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MySQLSession from 'express-mysql-session';

import { config } from './config/env.js';
import pool from './config/db.js';
import languageMiddleware from './middleware/localization.js';
import themeMiddleware from './middleware/theme.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandlers.js';
import webRouter from './routes/web.js';
import apiRouter from './routes/api/index.js';
import authRouter from './routes/api/auth.js';
import { loadLocales } from './utils/localization.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const MySQLStore = MySQLSession(session);

// ------------------------------------------------------------
// MySQL Session Store
// ------------------------------------------------------------
const sessionStore = new MySQLStore({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
});

loadLocales();

// ------------------------------------------------------------
// Express Setup
// ------------------------------------------------------------
app.set('trust proxy', 1); // Required for secure cookies behind nginx
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);
app.use(compression());
app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// ------------------------------------------------------------
// Session Configuration (fixes OAuth state loss from Buwana)
// ------------------------------------------------------------
const isProduction = config.env === 'production';

const sessionCookieOptions = {
  httpOnly: true,
  secure: true,                 // Always true (HTTPS enforced by nginx)
  sameSite: 'none',             // Needed for cross-site redirect back from buwana.ecobricks.org
  maxAge: 1000 * 60 * 15        // Session lasts 15 minutes (short-lived OAuth session)
};

// ✅ Use consistent cookie domain (.hopeturtles.org if subdomains)
sessionCookieOptions.domain = config.auth.sessionCookieDomain || 'hopeturtles.org';

// Warn if dev env not HTTPS
if (!isProduction) {
  console.warn('⚠️ Dev mode: secure cookies require HTTPS; login may fail locally.');
}

const sessionMiddleware = session({
  name: config.auth.sessionCookieName || 'ht.sid',
  secret: config.auth.sessionSecret || 'changeme',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: sessionCookieOptions
});

app.use(sessionMiddleware);

// ------------------------------------------------------------
// Global Template Variables
// ------------------------------------------------------------
app.use((req, res, next) => {
  res.locals.currentUser = req.session?.user || null;
  res.locals.theme = res.locals.theme || config.appearance.defaultTheme;
  res.locals.mapboxToken = config.integrations.mapboxToken;
  res.locals.includeWebsiteCarbon = config.integrations.includeWebsiteCarbon;
  res.locals.loginUrl = '/auth/login';
  res.locals.brand = {
    name: 'HopeTurtles.org',
    colors: {
      primary: '#0077b6',
      light: '#cfd3d6',
      dark: '#42484d'
    }
  };
  next();
});

// ------------------------------------------------------------
// Routes and Middleware
// ------------------------------------------------------------
app.use(languageMiddleware);
app.use(themeMiddleware);
app.use('/fonts', express.static(path.join(__dirname, 'fonts')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRouter);
app.use('/api', apiRouter);
app.use('/', webRouter);

// ------------------------------------------------------------
// Error Handling
// ------------------------------------------------------------
app.use(notFoundHandler);
app.use(errorHandler);

// ------------------------------------------------------------
// Start Server
// ------------------------------------------------------------
const start = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    app.listen(config.port, config.host, () => {
      console.log(`🌊 HopeTurtles.org landing page ready at http://127.0.0.1:${config.port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

start();
