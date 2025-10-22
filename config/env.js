/**
 * config/env.js
 * Hope Turtle Environment Validator
 * ---------------------------------
 * Loads and validates essential environment variables for safe startup.
 */

import dotenv from 'dotenv';

// Load .env variables
dotenv.config();

const required = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME', 'PORT'];

for (const variable of required) {
  if (!process.env[variable]) {
    console.error(`❌ Missing required environment variable: ${variable}`);
    process.exit(1);
  }
}

export const config = {
  node_env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',
  db_host: process.env.DB_HOST,
  db_user: process.env.DB_USER,
  db_pass: process.env.DB_PASS,
  db_name: process.env.DB_NAME,
  buwana_api: process.env.BUWANA_API_URL,
  jwt_secret: process.env.JWT_SECRET || 'changeme',
  session_secret: process.env.SESSION_SECRET || 'changeme',
  mapbox_token: process.env.MAPBOX_TOKEN || null
};

console.log(`🌍 Environment loaded: ${config.node_env}`);

export const config = {
  // ...existing vars
  default_theme: process.env.DEFAULT_THEME || 'light',
  supported_themes: (process.env.SUPPORTED_THEMES || 'light,dark').split(','),
  default_lang: process.env.DEFAULT_LANG || 'en',
  supported_langs: (process.env.SUPPORTED_LANGS || 'en').split(',')
};

