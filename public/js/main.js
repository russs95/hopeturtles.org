const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const root = document.documentElement;

const applyTheme = (theme) => {
  root.dataset.theme = theme;
  localStorage.setItem('ht-theme', theme);
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

const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
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

const languageSwitcher = document.getElementById('languageSwitcher');
if (languageSwitcher) {
  languageSwitcher.addEventListener('change', (event) => {
    const lang = event.target.value;
    localStorage.setItem('ht-lang', lang);
    fetch('/language', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang })
    })
      .then(() => window.location.reload())
      .catch(() => window.location.reload());
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
  document.body.classList.add('page-ready');
});
