const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');

const reflectThemeToggle = (theme) => {
  if (!themeToggle) return;
  const isDark = theme === 'dark';
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.classList.toggle('is-dark', isDark);
};

const applyTheme = (theme) => {
  root.dataset.theme = theme;
  localStorage.setItem('ht-theme', theme);
  reflectThemeToggle(theme);
};

const detectInitialTheme = () => {
  const stored = localStorage.getItem('ht-theme');
  if (stored) {
    applyTheme(stored);
    return;
  }
  applyTheme(prefersDark.matches ? 'dark' : root.dataset.theme || 'light');
};

detectInitialTheme();

prefersDark.addEventListener('change', (event) => {
  const stored = localStorage.getItem('ht-theme');
  if (!stored) {
    applyTheme(event.matches ? 'dark' : 'light');
  }
});

if (themeToggle) {
  reflectThemeToggle(root.dataset.theme || 'light');
  themeToggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    fetch('/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: next })
    }).catch(() => {});
  });
}

const languageButton = document.getElementById('languageButton');
const languageMenu = document.getElementById('languageMenu');
const languageOptions = languageMenu?.querySelectorAll('.lang-option');

const closeLanguageMenu = () => {
  if (!languageButton || !languageMenu) return;
  languageButton.setAttribute('aria-expanded', 'false');
  languageMenu.hidden = true;
};

if (languageButton && languageMenu && languageOptions) {
  languageButton.addEventListener('click', () => {
    const expanded = languageButton.getAttribute('aria-expanded') === 'true';
    languageButton.setAttribute('aria-expanded', String(!expanded));
    languageMenu.hidden = expanded;
    if (!expanded) {
      const selected = languageMenu.querySelector('.lang-option[aria-selected="true"]');
      (selected || languageOptions[0]).focus();
    }
  });

  languageOptions.forEach((option) => {
    option.addEventListener('click', () => {
      const lang = option.dataset.lang;
      if (!lang) return;
      localStorage.setItem('ht-lang', lang);
      languageOptions.forEach((opt) => {
        opt.setAttribute('aria-selected', String(opt === option));
      });
      const codeEl = languageButton.querySelector('.lang-button-code');
      if (codeEl) {
        codeEl.textContent = lang.toUpperCase();
      }
      closeLanguageMenu();
      fetch('/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang })
      })
        .then(() => window.location.reload())
        .catch(() => window.location.reload());
    });
  });

  document.addEventListener('click', (event) => {
    if (!languageMenu.hidden) {
      const target = event.target;
      if (!languageMenu.contains(target) && !languageButton.contains(target)) {
        closeLanguageMenu();
      }
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeLanguageMenu();
      languageButton?.focus();
    }
  });
}

document.addEventListener('click', (event) => {
  const anchor = event.target.closest('a[href^="#"]');
  if (anchor) {
    const targetId = anchor.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (target) {
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
});

// Page fade-in effect
requestAnimationFrame(() => {
  root.classList.add('page-ready');
  if (document.body) {
    document.body.classList.add('page-ready');
  }
});
