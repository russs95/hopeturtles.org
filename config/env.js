import dotenv from 'dotenv';

dotenv.config();

const requiredVariables = [
  'DB_HOST',
  'DB_USER',
  'DB_PASS',
  'DB_NAME',
  'SESSION_SECRET',
  'BUWANA_CLIENT_ID',
  'BUWANA_PUBLIC_KEY',
  'BUWANA_API_URL',
  'BUWANA_AUTHORIZE_URL',
  'BUWANA_TOKEN_URL',
  'BUWANA_REDIRECT_URI',
  'BUWANA_SCOPE',
  'BUWANA_JWKS_URI'
];

for (const variable of requiredVariables) {
  if (!process.env[variable]) {
    console.warn(`⚠️  Missing recommended environment variable: ${variable}`);
  }
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  host: process.env.HOST || '0.0.0.0',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    name: process.env.DB_NAME
  },
  auth: {
    sessionSecret: process.env.SESSION_SECRET || 'hopeturtles-secret',
    jwtSecret: process.env.JWT_SECRET || 'hopeturtles-jwt',
    buwanaApiUrl: process.env.BUWANA_API_URL || 'https://sso.buwana.io',
    buwanaClientId: process.env.BUWANA_CLIENT_ID || '',
    buwanaPublicKey: process.env.BUWANA_PUBLIC_KEY || '',
    buwanaAuthorizeUrl:
      process.env.BUWANA_AUTHORIZE_URL ||
      'https://buwana.ecobricks.org/authorize',
    buwanaTokenUrl:
      process.env.BUWANA_TOKEN_URL ||
      'https://buwana.ecobricks.org/token',
    buwanaRedirectUri:
      process.env.BUWANA_REDIRECT_URI ||
      'https://hopeturtles.org/auth/callback',
    buwanaScope:
      process.env.BUWANA_SCOPE ||
      'openid profile email buwana:earthlingEmoji',
    buwanaJwksUri:
      process.env.BUWANA_JWKS_URI ||
      'https://buwana.ecobricks.org/api/userinfo.php'
  },
  appearance: {
    defaultTheme: process.env.DEFAULT_THEME || 'light',
    supportedThemes: (process.env.SUPPORTED_THEMES || 'light,dark').split(','),
    defaultLang: process.env.DEFAULT_LANG || 'en',
    supportedLangs: (
      process.env.SUPPORTED_LANGS || 'en,ms,id,he,ar,de,zh'
    )
      .split(',')
      .map((code) => code.trim())
  },
  integrations: {
    mapboxToken: process.env.MAPBOX_TOKEN || '',
    includeWebsiteCarbon:
      String(process.env.INCLUDE_WEBSITE_CARBON || 'false').toLowerCase() === 'true'
  }
};

export default config;
