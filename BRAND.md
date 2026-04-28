# clear the signal — complete brand design library
*Design system reference for Claude Code. Apply these rules universally and without exception.*

---

## 01 · brand identity

**name:** clear the signal  
**tagline:** clear the signal. find your frequency.  
**url:** clearthesignal.com  
**voice:** grounded, credible, warm — not mystical, not clinical  
**rule:** no fear, no fringe, no upsell — ever  

**naming convention:** all brand name references, headings, nav items, taglines, and UI labels are **always lower case**. No exceptions. No title case. No ALL CAPS.

```
✓  clear the signal
✓  find your frequency
✓  clear the signal. find your frequency.
✗  Clear The Signal
✗  CLEAR THE SIGNAL
✗  Clear the Signal
```

---

## 02 · color system

All colors are hardcoded. Use CSS custom properties defined below. Never approximate.

```css
:root {
  /* backgrounds */
  --color-deep-mesa:        #1e1e35;   /* primary background */
  --color-mesa-light:       #26263f;   /* cards, surfaces, elevated elements */

  /* brand primaries */
  --color-periwinkle:       #6b6fad;   /* primary — buttons, links, active states */
  --color-periwinkle-light: #8f93c9;   /* headings, hover states */

  /* accent */
  --color-red-rock:         #c4673a;   /* accent — CTAs, scores, key wordmarks */
  --color-red-rock-light:   #d4845a;   /* accent hover state */

  /* text & highlights */
  --color-desert-sky:       #a8c4e0;   /* highlight text, secondary labels */
  --color-adobe-sand:       #d4c4a8;   /* warm neutral, supporting text */
  --color-white:            #ffffff;   /* PRIMARY body text — always white on dark bg */

  /* utility */
  --color-star-dim:         rgba(212, 196, 168, 0.16); /* noise/background stars */
  --color-star-bright:      #a8c4e0;   /* revealed/active stars — Desert Sky */
}
```

### color usage rules

| element | color | hex |
|---|---|---|
| page background | Deep Mesa | `#1e1e35` |
| card / surface background | Mesa Light | `#26263f` |
| primary body text | White | `#ffffff` |
| headings (h1, h2) | Periwinkle Light | `#8f93c9` |
| subheadings / labels | Desert Sky | `#a8c4e0` |
| supporting / meta text | Adobe Sand | `#d4c4a8` |
| primary buttons | Periwinkle | `#6b6fad` |
| button hover | Periwinkle Light | `#8f93c9` |
| links | Desert Sky | `#a8c4e0` |
| CTAs / key accent | Red Rock | `#c4673a` |
| CTA hover | Red Rock Light | `#d4845a` |
| score badges | Red Rock | `#c4673a` |
| brand wordmark "signal" | Red Rock | `#c4673a` |
| brand wordmark "clear the" | Desert Sky | `#a8c4e0` |
| nav / footer text | Adobe Sand | `#d4c4a8` |
| borders / dividers | `rgba(107, 111, 173, 0.25)` | periwinkle at low opacity |
| icon — spiral body | Periwinkle | `#6b6fad` |
| icon — arm tip / unwind | Red Rock | `#c4673a` |
| icon — orb center | Periwinkle Light | `#8f93c9` |
| icon — revealed stars | Desert Sky | `#a8c4e0` |

### what white is for

Body copy, paragraphs, descriptions, card content, list items — anything the user is actively reading. White ensures maximum legibility and contrast on both Deep Mesa and Mesa Light backgrounds. Never use Adobe Sand or Desert Sky for body text.

```css
/* correct */
p, li, td, .body-text { color: var(--color-white); }

/* incorrect — too dim for body text */
p { color: var(--color-adobe-sand); }
```

---

## 03 · typography

### font stack

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');

:root {
  --font-primary: 'DM Sans', system-ui, sans-serif;
}

* {
  font-family: var(--font-primary);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
```

**Why DM Sans:** Geometric, warm, modern — not clinical. Sits perfectly between technical credibility and human warmth. Pairs with the Sedona-adobe brand palette without feeling tech-bro or new-age.

### type scale

```css
:root {
  --text-xs:   0.75rem;   /* 12px — meta, timestamps, footnotes */
  --text-sm:   0.875rem;  /* 14px — labels, captions, helper text */
  --text-base: 1rem;      /* 16px — body copy */
  --text-lg:   1.125rem;  /* 18px — lead text, card descriptions */
  --text-xl:   1.25rem;   /* 20px — subheadings */
  --text-2xl:  1.5rem;    /* 24px — section headings */
  --text-3xl:  1.875rem;  /* 30px — page headings */
  --text-4xl:  2.25rem;   /* 36px — hero headings */
  --text-5xl:  3rem;      /* 48px — display / hero only */
}
```

### weight rules

```css
:root {
  --weight-light:   300;   /* taglines, supporting text */
  --weight-regular: 400;   /* body copy, UI labels */
  --weight-medium:  500;   /* headings, wordmark, CTAs */
}
/* never use 600, 700, or bold — too heavy for the matte palette */
```

### case rules — non-negotiable

```css
/* ALL brand elements, nav, headings, buttons, labels */
.brand, nav a, h1, h2, h3, h4, .btn, .tag, .label {
  text-transform: lowercase;
}

/* body copy is normal case (sentence case for readability) */
p, li, td { text-transform: none; }
```

### heading styles

```css
h1 {
  font-size: var(--text-4xl);
  font-weight: var(--weight-medium);
  color: var(--color-periwinkle-light);
  letter-spacing: -0.01em;
  text-transform: lowercase;
}

h2 {
  font-size: var(--text-2xl);
  font-weight: var(--weight-medium);
  color: var(--color-periwinkle-light);
  letter-spacing: 0;
  text-transform: lowercase;
}

h3 {
  font-size: var(--text-xl);
  font-weight: var(--weight-regular);
  color: var(--color-desert-sky);
  text-transform: lowercase;
}

p {
  font-size: var(--text-base);
  font-weight: var(--weight-regular);
  color: var(--color-white);
  line-height: 1.7;
}

.label, .meta {
  font-size: var(--text-sm);
  font-weight: var(--weight-regular);
  color: var(--color-adobe-sand);
  letter-spacing: 0.08em;
  text-transform: lowercase;
}
```

### tagline treatment

```css
.tagline {
  font-size: var(--text-lg);
  font-weight: var(--weight-light);
  color: var(--color-desert-sky);
  letter-spacing: 0.12em;
  text-transform: lowercase;
}

/* split treatment — two colors */
.tagline-primary   { color: var(--color-desert-sky); }   /* "clear the signal." */
.tagline-secondary { color: var(--color-red-rock); }     /* "find your frequency." */
```

**Usage:**
```html
<p class="tagline">
  <span class="tagline-primary">clear the signal.</span>
  <span class="tagline-secondary"> find your frequency.</span>
</p>
```

---

## 04 · logo mark — the spiral glyph

The logo is a Puebloan-style spiral petroglyph drawn as star nodes revealed within a starfield. The pattern already exists in the sky — we are clearing enough signal to see it.

### philosophy

- Stars are always present in the background (noise, dim)
- The spiral connects specific stars (signal, bright)
- The unwind arm points outward — the signal being released
- The orb center is the source — soft, layered, not geometric

### canonical mark rule

The icon-only SVG below is the **single source of truth** for the spiral glyph. Do not redraw, re-approximate, or modify the path. Use this exact path data for all lockups, tiles, and scaled versions. The unwind arm exits at **2 o'clock (upper right)** — this is non-negotiable.

### SVG logo — primary (icon only)

```svg
<!-- clear the signal — spiral glyph icon -->
<!-- viewBox: 0 0 120 120, center: 60 60 -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">

  <!-- background noise stars — dim -->
  <circle cx="18" cy="22" r="1"   fill="#d4c4a8" opacity="0.18"/>
  <circle cx="95" cy="18" r="0.8" fill="#d4c4a8" opacity="0.14"/>
  <circle cx="104" cy="88" r="1"  fill="#d4c4a8" opacity="0.16"/>
  <circle cx="14" cy="96" r="0.8" fill="#d4c4a8" opacity="0.14"/>
  <circle cx="108" cy="48" r="0.7" fill="#d4c4a8" opacity="0.12"/>
  <circle cx="22" cy="58" r="0.7" fill="#d4c4a8" opacity="0.12"/>

  <!-- spiral body — Adobe Periwinkle #6b6fad -->
  <path d="
    M 71 60
    C 71 53 60 46 52 50
    C 41 55 38 67 43 77
    C 48 88 61 91 71 86
    C 85 79 88 63 82 50
    C 75 35 59 30 44 36
    C 26 43 20 62 27 80
    C 35 100 57 107 78 100
    C 102 91 110 66 101 44
  "
  stroke="#6b6fad" stroke-width="2.2" stroke-linecap="round" opacity="0.88"/>

  <!-- unwind arm — Red Rock #c4673a -->
  <path d="M 101 44 C 108 34 113 24 116 14"
    stroke="#c4673a" stroke-width="2" stroke-linecap="round" opacity="0.95"/>

  <!-- arm tip dot -->
  <circle cx="116" cy="14" r="3" fill="#c4673a" opacity="0.95"/>

  <!-- revealed star nodes — Desert Sky #a8c4e0, on the spiral path -->
  <circle cx="71"  cy="60"  r="2.8" fill="#a8c4e0" opacity="0.95"/>
  <circle cx="60"  cy="50"  r="2.5" fill="#a8c4e0" opacity="0.88"/>
  <circle cx="43"  cy="77"  r="2.8" fill="#a8c4e0" opacity="0.95"/>
  <circle cx="60"  cy="87"  r="2.5" fill="#a8c4e0" opacity="0.88"/>
  <circle cx="80"  cy="60"  r="2.8" fill="#a8c4e0" opacity="0.95"/>
  <circle cx="60"  cy="34"  r="2.5" fill="#a8c4e0" opacity="0.85"/>
  <circle cx="30"  cy="60"  r="2.8" fill="#a8c4e0" opacity="0.92"/>
  <circle cx="60"  cy="100" r="2.5" fill="#a8c4e0" opacity="0.82"/>
  <circle cx="100" cy="60"  r="2.5" fill="#a8c4e0" opacity="0.88"/>
  <circle cx="101" cy="44"  r="2.5" fill="#a8c4e0" opacity="0.85"/>

  <!-- orb center — layered soft glow -->
  <circle cx="60" cy="60" r="12"  fill="#1e1e35"/>
  <circle cx="60" cy="60" r="9"   fill="#6b6fad" opacity="0.18"/>
  <circle cx="60" cy="60" r="5.5" fill="#8f93c9" opacity="0.55"/>
  <circle cx="60" cy="60" r="2.5" fill="#a8c4e0" opacity="0.98"/>

</svg>
```

### SVG logo — horizontal lockup

```svg
<!-- clear the signal — horizontal lockup -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 80" fill="none">

  <!-- icon — scaled, centered at 40 40 -->
  <g transform="translate(0,0) scale(0.667)">
    <!-- spiral -->
    <path d="M 71 60 C 71 53 60 46 52 50 C 41 55 38 67 43 77 C 48 88 61 91 71 86 C 85 79 88 63 82 50 C 75 35 59 30 44 36 C 26 43 20 62 27 80 C 35 100 57 107 78 100 C 102 91 110 66 101 44"
      stroke="#6b6fad" stroke-width="2.6" stroke-linecap="round" opacity="0.88"/>
    <path d="M 101 44 C 108 34 113 24 116 14"
      stroke="#c4673a" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="116" cy="14" r="3.5" fill="#c4673a"/>
    <!-- revealed stars -->
    <circle cx="71"  cy="60"  r="3" fill="#a8c4e0" opacity="0.95"/>
    <circle cx="60"  cy="50"  r="2.6" fill="#a8c4e0" opacity="0.88"/>
    <circle cx="43"  cy="77"  r="3" fill="#a8c4e0" opacity="0.95"/>
    <circle cx="60"  cy="87"  r="2.6" fill="#a8c4e0" opacity="0.88"/>
    <circle cx="80"  cy="60"  r="3" fill="#a8c4e0" opacity="0.95"/>
    <circle cx="60"  cy="34"  r="2.6" fill="#a8c4e0" opacity="0.85"/>
    <circle cx="30"  cy="60"  r="3" fill="#a8c4e0" opacity="0.92"/>
    <circle cx="101" cy="44"  r="2.6" fill="#a8c4e0" opacity="0.85"/>
    <!-- orb -->
    <circle cx="60" cy="60" r="13" fill="#1e1e35"/>
    <circle cx="60" cy="60" r="10" fill="#6b6fad" opacity="0.18"/>
    <circle cx="60" cy="60" r="6"  fill="#8f93c9" opacity="0.55"/>
    <circle cx="60" cy="60" r="2.8" fill="#a8c4e0" opacity="0.98"/>
    <!-- noise stars -->
    <circle cx="18" cy="22" r="1.2" fill="#d4c4a8" opacity="0.16"/>
    <circle cx="95" cy="18" r="1"   fill="#d4c4a8" opacity="0.13"/>
    <circle cx="104" cy="88" r="1.2" fill="#d4c4a8" opacity="0.14"/>
    <circle cx="14" cy="96" r="1"   fill="#d4c4a8" opacity="0.13"/>
  </g>

  <!-- vertical rule -->
  <line x1="92" y1="16" x2="92" y2="64" stroke="#6b6fad" stroke-width="0.5" opacity="0.35"/>

  <!-- wordmark -->
  <text x="108" y="36"
    font-family="'DM Sans', system-ui, sans-serif"
    font-size="13" font-weight="400"
    fill="#a8c4e0" letter-spacing="5">clear the</text>
  <text x="105" y="62"
    font-family="'DM Sans', system-ui, sans-serif"
    font-size="30" font-weight="500"
    fill="#c4673a" letter-spacing="2">signal</text>

</svg>
```

### SVG logo — stacked lockup

```svg
<!-- clear the signal — stacked lockup -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 180" fill="none">

  <!-- icon centered at 80 70 -->
  <g transform="translate(20, 8) scale(0.667)">
    <path d="M 71 60 C 71 53 60 46 52 50 C 41 55 38 67 43 77 C 48 88 61 91 71 86 C 85 79 88 63 82 50 C 75 35 59 30 44 36 C 26 43 20 62 27 80 C 35 100 57 107 78 100 C 102 91 110 66 101 44"
      stroke="#6b6fad" stroke-width="2.6" stroke-linecap="round" opacity="0.88"/>
    <path d="M 101 44 C 108 34 113 24 116 14"
      stroke="#c4673a" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="116" cy="14" r="3.5" fill="#c4673a"/>
    <circle cx="71"  cy="60"  r="3"   fill="#a8c4e0" opacity="0.95"/>
    <circle cx="60"  cy="50"  r="2.6" fill="#a8c4e0" opacity="0.88"/>
    <circle cx="43"  cy="77"  r="3"   fill="#a8c4e0" opacity="0.95"/>
    <circle cx="60"  cy="87"  r="2.6" fill="#a8c4e0" opacity="0.88"/>
    <circle cx="80"  cy="60"  r="3"   fill="#a8c4e0" opacity="0.95"/>
    <circle cx="60"  cy="34"  r="2.6" fill="#a8c4e0" opacity="0.85"/>
    <circle cx="30"  cy="60"  r="3"   fill="#a8c4e0" opacity="0.92"/>
    <circle cx="101" cy="44"  r="2.6" fill="#a8c4e0" opacity="0.85"/>
    <circle cx="60"  cy="60"  r="13"  fill="#1e1e35"/>
    <circle cx="60"  cy="60"  r="10"  fill="#6b6fad" opacity="0.18"/>
    <circle cx="60"  cy="60"  r="6"   fill="#8f93c9" opacity="0.55"/>
    <circle cx="60"  cy="60"  r="2.8" fill="#a8c4e0" opacity="0.98"/>
    <circle cx="18"  cy="22"  r="1.2" fill="#d4c4a8" opacity="0.16"/>
    <circle cx="95"  cy="18"  r="1"   fill="#d4c4a8" opacity="0.13"/>
  </g>

  <!-- wordmark stacked, centered -->
  <text x="80" y="112"
    font-family="'DM Sans', system-ui, sans-serif"
    font-size="11" font-weight="400"
    fill="#a8c4e0" letter-spacing="5"
    text-anchor="middle">clear the</text>
  <text x="80" y="142"
    font-family="'DM Sans', system-ui, sans-serif"
    font-size="26" font-weight="500"
    fill="#c4673a" letter-spacing="2"
    text-anchor="middle">signal</text>

  <!-- tagline -->
  <text x="80" y="166"
    font-family="'DM Sans', system-ui, sans-serif"
    font-size="8" font-weight="300"
    fill="#6b6fad" letter-spacing="2"
    text-anchor="middle" opacity="0.8">find your frequency.</text>

</svg>
```

---

## 05 · tagline system

**primary tagline (full):**
```
clear the signal. find your frequency.
```

**split usage:**
- `clear the signal.` → Desert Sky `#a8c4e0`
- `find your frequency.` → Red Rock `#c4673a`

**short form:**
```
find your frequency.
```

**meta / subtext form:**
```
signal through the noise.
```

**hero HTML block:**
```html
<div class="hero-tagline">
  <span class="hero-brand">
    <span class="brand-pre">clear the </span>
    <span class="brand-signal">signal.</span>
  </span>
  <p class="hero-sub">find your frequency.</p>
</div>
```

```css
.hero-tagline { text-align: center; }

.hero-brand {
  display: block;
  font-size: var(--text-5xl);
  font-weight: var(--weight-medium);
  letter-spacing: -0.02em;
  text-transform: lowercase;
}

.brand-pre    { color: var(--color-desert-sky); }
.brand-signal { color: var(--color-red-rock); }

.hero-sub {
  font-size: var(--text-xl);
  font-weight: var(--weight-light);
  color: var(--color-adobe-sand);
  letter-spacing: 0.15em;
  text-transform: lowercase;
  margin-top: 0.5rem;
}
```

---

## 06 · spacing & layout

```css
:root {
  --space-1:  0.25rem;   /*  4px */
  --space-2:  0.5rem;    /*  8px */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-6:  1.5rem;    /* 24px */
  --space-8:  2rem;      /* 32px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-24: 6rem;      /* 96px */

  --radius-sm:  6px;
  --radius-md:  10px;
  --radius-lg:  16px;
  --radius-xl:  24px;
  --radius-full: 9999px;

  --max-width: 1200px;
  --content-width: 780px;
}
```

---

## 07 · component rules

### cards

```css
.card {
  background: var(--color-mesa-light);    /* #26263f */
  border: 0.5px solid rgba(107, 111, 173, 0.25);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  color: var(--color-white);
}

.card-title {
  font-size: var(--text-lg);
  font-weight: var(--weight-medium);
  color: var(--color-periwinkle-light);
  text-transform: lowercase;
}

.card-meta {
  font-size: var(--text-sm);
  color: var(--color-adobe-sand);
  letter-spacing: 0.06em;
}
```

### buttons

```css
.btn-primary {
  background: var(--color-periwinkle);
  color: var(--color-white);
  font-family: var(--font-primary);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  letter-spacing: 0.08em;
  text-transform: lowercase;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-6);
  cursor: pointer;
  transition: background 0.2s ease;
}
.btn-primary:hover { background: var(--color-periwinkle-light); }

.btn-accent {
  background: var(--color-red-rock);
  color: var(--color-white);
  font-family: var(--font-primary);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  letter-spacing: 0.08em;
  text-transform: lowercase;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-6);
  cursor: pointer;
  transition: background 0.2s ease;
}
.btn-accent:hover { background: var(--color-red-rock-light); }

.btn-ghost {
  background: transparent;
  color: var(--color-desert-sky);
  border: 0.5px solid rgba(168, 196, 224, 0.4);
  font-family: var(--font-primary);
  font-size: var(--text-sm);
  font-weight: var(--weight-regular);
  letter-spacing: 0.08em;
  text-transform: lowercase;
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-6);
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-ghost:hover {
  background: rgba(168, 196, 224, 0.08);
  border-color: var(--color-desert-sky);
}
```

### score / signal badge

```css
.signal-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  background: rgba(196, 103, 58, 0.15);
  border: 0.5px solid rgba(196, 103, 58, 0.4);
  color: var(--color-red-rock-light);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  letter-spacing: 0.1em;
  text-transform: lowercase;
  border-radius: var(--radius-full);
  padding: 2px var(--space-3);
}
```

### tags

```css
.tag {
  display: inline-block;
  background: rgba(107, 111, 173, 0.15);
  color: var(--color-periwinkle-light);
  border: 0.5px solid rgba(107, 111, 173, 0.3);
  font-size: var(--text-xs);
  font-weight: var(--weight-regular);
  letter-spacing: 0.08em;
  text-transform: lowercase;
  border-radius: var(--radius-full);
  padding: 3px 10px;
}
```

### nav

```css
nav {
  background: rgba(30, 30, 53, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 0.5px solid rgba(107, 111, 173, 0.2);
  padding: var(--space-4) var(--space-8);
  display: flex;
  align-items: center;
  gap: var(--space-8);
}

nav a {
  color: var(--color-adobe-sand);
  font-size: var(--text-sm);
  font-weight: var(--weight-regular);
  letter-spacing: 0.08em;
  text-decoration: none;
  text-transform: lowercase;
  transition: color 0.2s ease;
}

nav a:hover        { color: var(--color-desert-sky); }
nav a.active       { color: var(--color-periwinkle-light); }
```

### dividers

```css
hr, .divider {
  border: none;
  border-top: 0.5px solid rgba(107, 111, 173, 0.2);
  margin: var(--space-8) 0;
}
```

---

## 08 · background star field (CSS)

The starfield is a brand element. Use it on hero sections and dark full-bleed backgrounds.

```css
.starfield {
  position: relative;
  overflow: hidden;
}

.starfield::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1px 1px at 15% 20%, rgba(212,196,168,0.18) 0%, transparent 100%),
    radial-gradient(1px 1px at 32% 8%,  rgba(212,196,168,0.14) 0%, transparent 100%),
    radial-gradient(1px 1px at 55% 18%, rgba(212,196,168,0.2)  0%, transparent 100%),
    radial-gradient(1px 1px at 72% 5%,  rgba(212,196,168,0.14) 0%, transparent 100%),
    radial-gradient(1px 1px at 88% 22%, rgba(212,196,168,0.18) 0%, transparent 100%),
    radial-gradient(1px 1px at 8%  65%, rgba(212,196,168,0.12) 0%, transparent 100%),
    radial-gradient(1px 1px at 95% 60%, rgba(212,196,168,0.13) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 40% 35%, rgba(168,196,224,0.35) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 68% 42%, rgba(168,196,224,0.28) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 22% 55%, rgba(168,196,224,0.32) 0%, transparent 100%);
  pointer-events: none;
  z-index: 0;
}
/* brighter dots = revealed stars on the spiral pattern */
/* dimmer dots = noise / background */
```

---

## 09 · do / don't

### do
- all brand text and labels in lower case always
- white body text on deep mesa and mesa light backgrounds
- spiral icon with periwinkle body, red rock arm, desert sky star nodes
- matte, grounded visual feel — no harsh gradients
- red rock as the single heat/accent color — use sparingly
- desert sky for secondary labels, links, supporting hierarchy
- letter-spacing on small labels (0.06–0.12em) for legibility

### don't
- Title Case or ALL CAPS anywhere in brand elements
- Gradients, glows, or neon effects
- System fonts, Arial, Roboto, or Inter
- Serif fonts anywhere, ever
- Adobe Sand or Desert Sky as body text color — too dim
- Using red rock as a background color (accent only)
- Rounded pill buttons with heavy weight text
- Multiple accent colors competing — red rock is the only hot color
- Shadows heavier than `box-shadow: 0 2px 12px rgba(0,0,0,0.3)`

---

## 10 · favicon / app icon

Use the 120×120 SVG icon mark on these backgrounds:

| context | bg color | spiral | stars |
|---|---|---|---|
| default (dark) | `#1e1e35` | `#6b6fad` | `#a8c4e0` |
| card surface | `#26263f` | `#6b6fad` | `#a8c4e0` |
| accent tile | `#6b6fad` | `#1e1e35` | `#a8c4e0` |
| red rock tile | `#c4673a` | `#1e1e35` | `#d4c4a8` |

For favicon.ico: use the icon-only SVG at 32×32, no wordmark.

---

## 11 · CSS custom properties — full root block

Copy this into your global CSS file:

```css
:root {
  /* colors */
  --color-deep-mesa:        #1e1e35;
  --color-mesa-light:       #26263f;
  --color-periwinkle:       #6b6fad;
  --color-periwinkle-light: #8f93c9;
  --color-red-rock:         #c4673a;
  --color-red-rock-light:   #d4845a;
  --color-desert-sky:       #a8c4e0;
  --color-adobe-sand:       #d4c4a8;
  --color-white:            #ffffff;

  /* typography */
  --font-primary: 'DM Sans', system-ui, sans-serif;
  --weight-light:   300;
  --weight-regular: 400;
  --weight-medium:  500;
  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.125rem;
  --text-xl:   1.25rem;
  --text-2xl:  1.5rem;
  --text-3xl:  1.875rem;
  --text-4xl:  2.25rem;
  --text-5xl:  3rem;

  /* spacing */
  --space-1:  0.25rem;
  --space-2:  0.5rem;
  --space-3:  0.75rem;
  --space-4:  1rem;
  --space-6:  1.5rem;
  --space-8:  2rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-24: 6rem;

  /* layout */
  --radius-sm:    6px;
  --radius-md:    10px;
  --radius-lg:    16px;
  --radius-xl:    24px;
  --radius-full:  9999px;
  --max-width:    1200px;
  --content-width: 780px;
}

/* base reset */
*, *::before, *::after { box-sizing: border-box; }

body {
  background: var(--color-deep-mesa);
  color: var(--color-white);
  font-family: var(--font-primary);
  font-size: var(--text-base);
  font-weight: var(--weight-regular);
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}
```

---

*end of brand design library — clear the signal v1.0*
*deliver this file as `BRAND.md` in the repo root*
