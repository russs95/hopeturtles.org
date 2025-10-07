// --- Translations for "Hello world!" ---
const translations = {
  en: "Hello world!",
  ar: "مرحبا بالعالم!",
  fr: "Bonjour le monde!",
  de: "Hallo Welt!",
  he: "שלום עולם!",
  ms: "Halo dunia!",
  id: "Halo dunia!",
  zh: "你好，世界！"
};

const langSelector = document.getElementById("language-selector");
const helloText = document.getElementById("hello-text");
const modeToggle = document.getElementById("mode-toggle");

// Language selector logic
langSelector.addEventListener("change", (e) => {
  const lang = e.target.value;
  helloText.textContent = translations[lang] || translations.en;
  document.documentElement.setAttribute("lang", lang);
});

// Dark/light mode toggle
modeToggle.addEventListener("click", () => {
  const body = document.body;
  const darkMode = body.classList.toggle("dark-mode");
  body.classList.toggle("light-mode", !darkMode);
  modeToggle.textContent = darkMode ? "🌙" : "☀️";
});
