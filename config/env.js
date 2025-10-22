/**
 * config/env.js
 * Hope Turtle Environment Validator
 * ---------------------------------
 * Loads and validates essential environment variables for safe startup.
 */

import dotenv from 'dotenv';

// Load .env variables
dotenv.config();

// Validate critical environment variables
const required = ['DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME', 'PORT'];
for (const variable of required) {
  if (!process.env[variable]) {
    console.error(`❌ Missing required environment variable: ${variable}`);
    process.exit(1);
  }
}

export const config = {
  // 🌍 Environment
  node_env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  host: process.env.HOST || '0.0.0.0',

  // 🗄️ Database
  db_host: process.env.DB_HOST,
  db_user: process.env.DB_USER,
  db_pass: process.env.DB_PASS,
  db_name: process.env.DB_NAME,

  // 🔐 Security
  jwt_secret: process.env.JWT_SECRET || 'changeme',
  session_secret: process.env.SESSION_SECRET || 'changeme',

  // 🧭 Integrations
  buwana_api: process.env.BUWANA_API_URL || 'https://buwana.io/api',
  mapbox_token: process.env.MAPBOX_TOKEN || null,

  // 🌓 Appearance
  default_theme: process.env.DEFAULT_THEME || 'light',
  supported_themes: (process.env.SUPPORTED_THEMES || 'light,dark').split(','),

  // 🌐 Localization
  default_lang: process.env.DEFAULT_LANG || 'en',
  supported_langs: (process.env.SUPPORTED_LANGS || 'en,ms,id,he,ar,de,zh,fr,es').split(','),

  // 🌱 Sustainability Widgets
  include_website_carbon: process.env.INCLUDE_WEBSITE_CARBON === 'true'
};

console.log(`🌍 Environment loaded: ${config.node_env}`);
console.log(`🌓 Theme: ${config.default_theme} | 🌐 Languages: ${config.supported_langs.join(', ')}`);
if (config.include_website_carbon) console.log('🌱 WebsiteCarbon widget is enabled.');
