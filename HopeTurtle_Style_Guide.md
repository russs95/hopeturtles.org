# 🎨 Hope Turtle Style Guide

## 🐢 Brand Overview
The Hope Turtle visual language reflects regenerative, open-source, and human-to-human collaboration.  
Design elements echo the project's ASCII turtle identity — humble, friendly, and quietly technological.

---

## 🪶 Typography

| Role | Font | Weight | Path |
|------|------|---------|------|
| **Headings & Titles** | Alan Sans | Variable | `/public/fonts/AlanSans-VariableFont_wght.ttf` |
| **Body Text** | Mulish Medium | 500 | `/public/fonts/Mulish-Medium.ttf` |
| **Captions** | Mulish Extra Light | 300 | `/public/fonts/Mulish-ExtraLight.ttf` |
| **ASCII Accents (optional)** | Inconsolata | 400 | Google Fonts |

### CSS Font Setup
```css
@font-face {
  font-family: 'Alan Sans';
  src: url('/fonts/AlanSans-VariableFont_wght.ttf') format('truetype');
  font-display: swap;
}

@font-face {
  font-family: 'Mulish';
  src: url('/fonts/Mulish-Medium.ttf') format('truetype');
  font-weight: 500;
  font-display: swap;
}

@font-face {
  font-family: 'Mulish ExtraLight';
  src: url('/fonts/Mulish-ExtraLight.ttf') format('truetype');
  font-weight: 300;
  font-display: swap;
}

@import url('https://fonts.googleapis.com/css2?family=Inconsolata:wght@400&display=swap');
```

---

## 🎨 Color Palette

| Role | Color | Hex | Description |
|------|--------|-----|-------------|
| **Ocean Blue (Accent)** | `#6EC4E8` | Hope Turtle logo blue |
| **Dark Grey (Text)** | `#5C5C5C` | For text and titles |
| **Light Grey (Lines / ASCII)** | `#A0A0A0` | For borders, subtle accents |
| **Background Sand** | `#F8F9FA` | For general page background |
| **White** | `#FFFFFF` | For cards and contrast |

---

## 💻 CSS Variables and Structure

```css
:root {
  --color-blue: #6EC4E8;
  --color-dark-grey: #5C5C5C;
  --color-light-grey: #A0A0A0;
  --color-sand: #F8F9FA;
  --color-white: #FFFFFF;

  --font-heading: 'Alan Sans', sans-serif;
  --font-body: 'Mulish', sans-serif;
  --font-caption: 'Mulish ExtraLight', sans-serif;
  --font-ascii: 'Inconsolata', monospace;
}

body {
  background-color: var(--color-sand);
  color: var(--color-dark-grey);
  font-family: var(--font-body);
  line-height: 1.6;
  margin: 0;
  padding: 0;
}

h1, h2, h3 {
  font-family: var(--font-heading);
  color: var(--color-dark-grey);
  letter-spacing: -0.02em;
}

h1 {
  font-size: 2.75rem;
  color: var(--color-blue);
  font-weight: 700;
}
h2 { font-size: 2rem; font-weight: 600; }
h3 { font-size: 1.5rem; font-weight: 500; }

p {
  font-size: 1rem;
  margin-bottom: 1.2rem;
}

.caption {
  font-family: var(--font-caption);
  font-size: 0.875rem;
  color: var(--color-light-grey);
  text-align: center;
  font-style: italic;
}

/* ASCII Divider Example */
.ascii-divider {
  font-family: var(--font-ascii);
  color: var(--color-light-grey);
  text-align: center;
  white-space: pre;
  margin: 2rem auto;
}



button, .btn {
  font-family: var(--font-heading);
  background-color: var(--color-blue);
  color: var(--color-white);
  border: none;
  padding: 0.7rem 1.4rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}
button:hover, .btn:hover {
  background-color: #4EA9D5;
}
```

---

## 🌊 Design Notes
- **ASCII Art as Theme:** integrate subtle ASCII turtles or dividers (`───🐢───`) in pages and headers.
- **Soft Edges:** Rounded corners, minimal shadows, light grey dividers.
- **Ocean & Humanity:** Blue for vitality and connection; grey for stability and calm.
- **Responsive Typography:** All headings and body sizes scale smoothly for mobile and desktop.

---

## 🧭 Example Use
```html
<div class="ascii-divider">
──────🐢──────
</div>

<h1>Hope Turtle Missions</h1>
<p class="caption">A human-to-human project across oceans.</p>
```
