# 🎨 Hope Turtle Style Guide

## 🐢 Brand Overview
The Hope Turtle visual language reflects regenerative, open-source, and human-to-human collaboration.  
Design elements echo the project's ASCII turtle identity — humble, friendly, and quietly technological.

---

## 🪶 Typography

| Role | Font | Weight | Path |
|------|------|---------|------|
| **Headings & Highlights** | Mulish SemiBold | 600 | `/public/fonts/Mulish-Medium.ttf` |
| **Body Text** | Mulish Regular | 400 | Google Fonts (`Mulish 400`) / fallback `/public/fonts/Mulish-Medium.ttf` |
| **Secondary Text** | Mulish Light | 300 | `/public/fonts/Mulish-Light.ttf` |
| **ASCII Accents (optional)** | Fira Code | 400 | System / Google Fonts |

### CSS Font Setup
```css
@font-face {
  font-family: 'Mulish';
  src: url('/fonts/Mulish-Light.ttf') format('truetype');
  font-weight: 300;
  font-display: swap;
}

@font-face {
  font-family: 'Mulish';
  src: url('/fonts/Mulish-Medium.ttf') format('truetype');
  font-weight: 400;
  font-display: swap;
}

@font-face {
  font-family: 'Mulish';
  src: url('/fonts/Mulish-Medium.ttf') format('truetype');
  font-weight: 600;
  font-display: swap;
}

@import url('https://fonts.googleapis.com/css2?family=Mulish:wght@300;400;600&display=swap');
```

---

## 🎨 Color Palette

| Role | Color | Hex | Description |
|------|--------|-----|-------------|
| **Turtle Green (Primary)** | `#017919` | Primary brand tone |
| **Leaf Accent** | `#23B053` | Supporting highlight and hover states |
| **Deep Forest (Text)** | `#1F3B22` | High contrast text color |
| **Seafoam Mist (Background)** | `#F2F9F3` | Default page background |
| **Light Mint (Surface)** | `#C0E3CB` | Soft cards and outlines |
| **White** | `#FFFFFF` | For cards and contrast |

---

## 💻 CSS Variables and Structure

```css
:root {
  --color-primary: #017919;
  --color-accent: #23B053;
  --color-forest: #1F3B22;
  --color-mist: #F2F9F3;
  --color-mint: #C0E3CB;
  --color-white: #FFFFFF;

  --font-heading: 'Mulish', sans-serif;
  --font-body: 'Mulish', sans-serif;
  --font-secondary: 'Mulish', sans-serif;
  --font-ascii: 'Fira Code', monospace;
}

body {
  background-color: var(--color-mist);
  color: var(--color-forest);
  font-family: var(--font-body);
  line-height: 1.6;
  margin: 0;
  padding: 0;
}

h1, h2, h3 {
  font-family: var(--font-heading);
  color: var(--color-forest);
  letter-spacing: -0.02em;
}

h1 {
  font-size: 2.75rem;
  color: var(--color-primary);
  font-weight: 700;
}
h2 { font-size: 2rem; font-weight: 600; color: var(--color-primary); }
h3 { font-size: 1.5rem; font-weight: 500; color: var(--color-forest); }

p {
  font-size: 1rem;
  margin-bottom: 1.2rem;
}

.caption {
  font-family: var(--font-secondary);
  font-size: 0.875rem;
  color: var(--color-mint);
  text-align: center;
  font-style: italic;
}

/* ASCII Divider Example */
.ascii-divider {
  font-family: var(--font-ascii);
  color: var(--color-mint);
  text-align: center;
  white-space: pre;
  margin: 2rem auto;
}



button, .btn {
  font-family: var(--font-heading);
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  padding: 0.7rem 1.4rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}
button:hover, .btn:hover {
  background-color: var(--color-accent);
}
```

---

## 🌊 Design Notes
- **ASCII Art as Theme:** integrate subtle ASCII turtles or dividers (`───🐢───`) in pages and headers.
- **Soft Edges:** Rounded corners, minimal shadows, light grey dividers.
- **Ocean & Humanity:** Turtle greens for vitality and regeneration; forest neutrals for stability and calm.
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
