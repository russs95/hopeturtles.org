(function () {
  const storageKey = 'hopeturtles-theme';
  const root = document.documentElement;

  function applyTheme(theme) {
    if (!theme) return;
    root.setAttribute('data-theme', theme);
  }

  function getStoredTheme() {
    try {
      return window.localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch (error) {
      // Ignore storage issues (private mode, etc.)
    }
  }

  function nextTheme(current) {
    return current === 'dark' ? 'light' : 'dark';
  }

  function updateToggle(toggle, theme) {
    if (!toggle) return;
    toggle.setAttribute('aria-pressed', theme === 'dark');
    const icon = toggle.querySelector('.theme-toggle__icon');
    if (icon) {
      icon.textContent = theme === 'dark' ? '🌙' : '🌞';
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.querySelector('[data-theme-toggle]');
    if (!toggle) {
      const stored = getStoredTheme();
      if (stored) {
        applyTheme(stored);
      }
      return;
    }

    const storedTheme = getStoredTheme();
    if (storedTheme) {
      applyTheme(storedTheme);
      updateToggle(toggle, storedTheme);
    } else {
      updateToggle(toggle, root.getAttribute('data-theme') || 'light');
    }

    toggle.addEventListener('click', function () {
      const current = root.getAttribute('data-theme') || 'light';
      const updated = nextTheme(current);
      applyTheme(updated);
      storeTheme(updated);
      updateToggle(toggle, updated);
    });
  });
})();
