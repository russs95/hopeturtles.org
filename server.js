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

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: config.auth.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: config.env === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  })
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session?.user || null;
  res.locals.theme = res.locals.theme || config.appearance.defaultTheme;
  res.locals.mapboxToken = config.integrations.mapboxToken;
  res.locals.includeWebsiteCarbon = config.integrations.includeWebsiteCarbon;
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

app.use(languageMiddleware);
app.use(themeMiddleware);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', authRouter);
app.use('/api', apiRouter);
app.use('/', webRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const start = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    app.listen(config.port, config.host, () => {
      console.log(`HopeTurtles.org landing page ready at http://127.0.0.1:${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

start();
