# Charte Graphique
> Light Mode · Style Notion · Next.js

---

## Couleurs

```css
:root {
  /* ── Arrière-plans ── */
  --bg-page:      #FFFFFF;   /* fond principal */
  --bg-sidebar:   #F7F7F5;   /* sidebar, panneaux */
  --bg-hover:     #EFEEEB;   /* hover d'un élément */
  --bg-active:    #E9E9E7;   /* item sélectionné / actif */

  /* ── Texte ── */
  --text-primary:   #37352F;  /* texte principal */
  --text-secondary: #6B6860;  /* sous-titres, labels, placeholders */
  --text-disabled:  #9B9A97;  /* désactivé, métadonnées */
  --text-inverse:   #FFFFFF;  /* texte sur fond sombre */

  /* ── Bordures ── */
  --border-default: #E8E8E5;  /* contour de composants */
  --border-strong:  #D0CFC9;  /* séparateurs, diviseurs */

  /* ── Accent ── */
  --accent:         #2383E2;  /* liens, bouton primaire, focus ring */
  --accent-hover:   #1A6FC4;  /* hover accent */
  --accent-subtle:  #E8F1FB;  /* fond badge info, highlight */

  /* ── Statuts ── */
  --success:        #0F7B6C;
  --success-bg:     #DCFAF5;
  --warning:        #AD5700;
  --warning-bg:     #FFF3DC;
  --danger:         #D44C47;
  --danger-bg:      #FDECEA;
}
```

---

## Typographie

### Polices

```css
/* next/font/google dans layout.tsx */
import { Inter, JetBrains_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})
```

```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### Échelle

| Token | Taille | Usage |
|---|---|---|
| `--text-xs` | 11px | Métadonnées, badges |
| `--text-sm` | 13px | Labels, sidebar, captions |
| `--text-base` | 15px | Corps de texte |
| `--text-md` | 16px | Texte mis en avant |
| `--text-lg` | 18px | Titres de section (h3) |
| `--text-xl` | 20px | Titres de page (h2) |
| `--text-2xl` | 24px | Grands titres (h1 secondaire) |
| `--text-3xl` | 30px | Titre principal (h1) |

```css
:root {
  --text-xs:   11px;
  --text-sm:   13px;
  --text-base: 15px;
  --text-md:   16px;
  --text-lg:   18px;
  --text-xl:   20px;
  --text-2xl:  24px;
  --text-3xl:  30px;

  --leading-tight:   1.25;
  --leading-normal:  1.5;
  --leading-relaxed: 1.6;
}
```

### Graisses

| Valeur | Usage |
|---|---|
| `400` | Corps de texte, texte courant |
| `500` | Labels, items sidebar actifs, boutons |
| `600` | Titres de section |
| `700` | Titre principal de page |

> Jamais au-delà de `700`. Jamais d'`uppercase` sur les titres de page (seulement sur les labels de catégorie).

---

## Espacements

Toujours en multiples de **4 px**.

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

---

## Rayons & Ombres

```css
:root {
  --radius-sm:   3px;
  --radius-md:   6px;
  --radius-lg:   8px;
  --radius-xl:   12px;
  --radius-full: 9999px;

  --shadow-xs: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.04);
}
```

---

## Transitions

```css
:root {
  --duration-fast:   80ms;
  --duration-base:   150ms;
  --duration-slow:   250ms;
  --ease:            cubic-bezier(0.25, 0.1, 0.25, 1);
  --ease-out:        cubic-bezier(0.16, 1, 0.3, 1);
}
```

- Hover : `80ms`
- Menus, dropdowns : `150ms`
- Modals : `200–250ms`

---

## Icônes

**[Lucide React](https://lucide.dev/)** — stroke uniquement, stroke-width `1.5`.

| Contexte | Taille |
|---|---|
| Sidebar, boutons | 16 px |
| En-têtes de section | 20 px |
| Illustrations vides (empty states) | 32 px |

---

## Reset de base

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--text-primary);
  background: var(--bg-page);
}
```

---

## À éviter

- Ombres prononcées — rester dans la gamme `xs` à `sm` pour les composants courants
- Rayons > `12px`
- Couleurs hors palette (pas de rose, violet, orange…)
- `font-weight` > `700`
- Transitions > `300ms` sur des interactions fréquentes
- Fond non-blanc en light mode (`#FFFFFF` est la seule base de page)

---

*Charte v1.0 — Light Mode · Inter + JetBrains Mono*
