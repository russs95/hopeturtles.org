const path = require('path');
const fs = require('fs');
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const DEFAULT_LANG = process.env.DEFAULT_LANG || 'en';
const INCLUDE_WEBSITE_CARBON =
  String(process.env.INCLUDE_WEBSITE_CARBON || '').toLowerCase() === 'true';

const localesDir = path.join(__dirname, 'locales');

function loadLocales() {
  const languages = {};
  if (!fs.existsSync(localesDir)) {
    return languages;
  }

  for (const file of fs.readdirSync(localesDir)) {
    if (!file.endsWith('.json')) continue;
    const langCode = path.basename(file, '.json');
    try {
      const raw = fs.readFileSync(path.join(localesDir, file), 'utf-8');
      languages[langCode] = JSON.parse(raw);
    } catch (error) {
      console.error(`Failed to load locale ${file}:`, error.message);
    }
  }
  return languages;
}

const locales = loadLocales();

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((acc, cookiePair) => {
    if (!cookiePair) return acc;
    const [key, value] = cookiePair.split('=').map((part) => part && part.trim());
    if (!key) return acc;
    acc[key] = decodeURIComponent(value || '');
    return acc;
  }, {});
}

const rtlLanguages = new Set(['ar', 'he']);

const languageLabels = {
  en: 'English',
  ms: 'Bahasa Melayu',
  id: 'Bahasa Indonesia',
  he: 'עברית',
  ar: 'العربية',
  de: 'Deutsch',
  zh: '中文',
};

const navLabels = {
  mission: {
    en: 'Mission',
    ms: 'Misi',
    id: 'Misi',
    he: 'המשימה',
    ar: 'المهمة',
    de: 'Mission',
    zh: '使命',
  },
  concept: {
    en: 'Tracking Concept',
    ms: 'Konsep Penjejakan',
    id: 'Konsep Pelacakan',
    he: 'רעיון המעקב',
    ar: 'مفهوم التتبع',
    de: 'Tracking-Konzept',
    zh: '追踪概念',
  },
};

function getLanguage(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  const requested = cookies.lang || DEFAULT_LANG;
  if (locales[requested]) {
    return requested;
  }
  return DEFAULT_LANG;
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  const lang = getLanguage(req);
  const translations = locales[lang] || locales[DEFAULT_LANG] || {};
  res.locals.lang = lang;
  res.locals.t = translations;
  res.locals.direction = rtlLanguages.has(lang) ? 'rtl' : 'ltr';
  res.locals.theme = 'light';
  res.locals.includeWebsiteCarbon = INCLUDE_WEBSITE_CARBON;
  res.locals.languageOptions = Object.entries(languageLabels)
    .filter(([code]) => locales[code])
    .map(([code, label]) => ({ code, label }));
  res.locals.nav = {
    mission: (navLabels.mission[lang] || navLabels.mission[DEFAULT_LANG]),
    concept: (navLabels.concept[lang] || navLabels.concept[DEFAULT_LANG]),
  };
  next();
});

function renderLanding(req, res, statusCode = 200) {
  const title = res.locals.t.title || 'HopeTurtles.org';
  res.status(statusCode).render('index', { pageTitle: title });
}

app.get(['/', '/index.html'], (req, res) => {
  renderLanding(req, res);
});

app.get('/api/lang', (req, res) => {
  const { set } = req.query;
  if (!set) {
    return res.json({ lang: res.locals.lang });
  }

  if (!locales[set]) {
    return res.status(400).json({ success: false, message: 'Language not supported.' });
  }

  res.setHeader(
    'Set-Cookie',
    `lang=${encodeURIComponent(set)}; Path=/; Max-Age=31536000; SameSite=Lax`
  );
  return res.json({ success: true, lang: set });
});

app.use((req, res) => {
  renderLanding(req, res, 404);
});

app.listen(PORT, () => {
  console.log(`HopeTurtles.org landing page ready at http://127.0.0.1:${PORT}`);
});
