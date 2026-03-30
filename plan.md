# AI Interview Simulator — Architecture & Implementation Guide (Green UI Edition)

## 🧠 Stack

* Next.js (App Router)
* TypeScript
* TailwindCSS + shadcnUI
* Firebase (Auth, Firestore, Storage)
* Gemini 3 Pro (AI)
* ElevenLabs (Voice)

---

# 🎨 Design System (Green Theme — Non Néon)

## 🎯 Objectif

Un design :

* professionnel
* moderne
* apaisant
* **aucune couleur néon**

---

## 🎨 Palette recommandée

```css
:root {
  --primary: #14532d;        /* vert profond */
  --primary-light: #166534;  /* vert légèrement plus clair */
  --accent: #22c55e;         /* vert naturel */
  --background: #f0fdf4;     /* vert très clair */
  --foreground: #052e16;     /* texte sombre */

  --muted: #dcfce7;
  --border: #bbf7d0;
}
```

👉 Idée :

* fond clair (reposant)
* éléments principaux verts
* accent discret

---

## 🧩 Composants UI (shadcn)

* Buttons → vert profond
* Cards → fond blanc + border soft green
* Inputs → focus green
* Progress bars → green gradient soft

---

## ⚠️ À éviter

❌ vert fluo
❌ gradients agressifs
❌ contrastes violents

👉 On veut un rendu type :

* Notion + calme
* Duolingo mais en version pro

---

# 📁 Project Structure

```bash
/app
  /(auth)
    /login/page.tsx
    /signup/page.tsx

  /(app)
    /layout.tsx
    /page.tsx

    /interview
      /new/page.tsx
      /[id]/page.tsx

    /review
      /[id]/page.tsx

    /history/page.tsx
    /profile/page.tsx

/api
  /gemini/route.ts


/components
  /ui
  /interview
  /layout

/lib
  firebase.ts
  gemini.ts
  elevenlabs.ts

/services
  interview.service.ts
  feedback.service.ts

/hooks
  useInterview.ts
  useAuth.ts

/types
  interview.ts
  user.ts
```

---

# 📂 Folder Responsibilities

## `/app`

### `(auth)`

* UI authentication uniquement

### `(app)/layout.tsx`

* Navbar (fond blanc / bordure verte soft)
* Protection auth

---

### `/page.tsx` ("/")

* Carte principale (background blanc)
* CTA bouton vert
* stats avec badges verts

---

### `/interview/new`

* Form propre avec accents verts
* boutons hover soft

---

### `/interview/[id]`

* UI focus :

  * carte centrale
  * question mise en avant
  * progress bar verte

---

### `/review/[id]`

* Scores affichés avec :

  * vert = bon
  * jaune doux = moyen
  * rouge doux = à améliorer

---

# 🔥 UI Pattern recommandés

## Cards

```css
bg-white
border border-green-100
rounded-xl
shadow-sm
```

---

## Buttons

```css
bg-green-800 hover:bg-green-700
text-white
rounded-lg
```

---

## Inputs

```css
border-green-200
focus:ring-green-500
```

---

## Background

```css
bg-green-50
```

---

# ⚙️ Backend & Architecture

(Aucun changement — voir version précédente)

---

# 🧠 UX Improvements spécifiques au design

## 1. Feedback visuel

* progression → barre verte animée
* succès → badge vert
* erreur → rouge doux (jamais agressif)

---

## 2. Focus utilisateur

* une seule action par écran
* espacement large (respiration visuelle)

---

## 3. Micro-interactions

* hover doux
* transitions 150–250ms
* aucun effet flashy

---

# 🚀 Résultat attendu

Un produit avec :

* design propre
* ambiance “premium”
* cohérence visuelle
* UX fluide

👉 Le genre d’interface où tu te dis :

> “ça, ça ressemble à un vrai produit SaaS”

---

# ⚡ Conclusion

Ton app doit donner cette impression :

* sérieuse
* moderne
* maîtrisée

Pas :

* flashy
* amateur
* “template gratuit”

---

👉 Si tu veux aller encore plus loin :

* design Figma complet
* system design tokens Tailwind
* UI kit shadcn custom

Et là… ton produit devient vraiment **niveau startup premium** 😏
