# AI Interview Simulator — Architecture & Guide d'implémentation

## 🧠 Stack

* **Next.js** (App Router)
* **TypeScript**
* **TailwindCSS** + **shadcn/ui**
* **Firebase** (Auth, Firestore, Storage)
* **Gemini 2.5 Pro** (IA)
* **ElevenLabs** (Voix)

---

## 🎨 Design System (Thème Vert — Non Néon)

### Palette

```css
:root {
  --primary: #14532d;       /* vert profond — boutons, titres */
  --primary-light: #166534; /* vert hover */
  --accent: #22c55e;        /* badges, succès, highlights */
  --background: #f0fdf4;    /* fond global */
  --foreground: #052e16;    /* texte principal */
  --muted: #dcfce7;         /* zones secondaires */
  --border: #bbf7d0;        /* bordures de cards */
}
```

### Règles visuelles

| Élément | Classe Tailwind |
|---|---|
| Fond global | `bg-green-50` |
| Cards | `bg-white border border-green-100 rounded-xl shadow-sm` |
| Boutons | `bg-green-800 hover:bg-green-700 text-white rounded-lg` |
| Inputs | `border-green-200 focus:ring-green-500` |
| Succès | badge vert `bg-green-100 text-green-800` |
| Avertissement | badge jaune doux |
| Erreur | rouge doux — jamais agressif |

### Ambiance cible
> Notion × Duolingo Pro — propre, respirant, premium. Zéro néon, zéro gradient agressif.

---

## 📁 Structure du projet

```
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
    /review/[id]/page.tsx
    /history/page.tsx
    /profile/page.tsx

/api
  /gemini/route.ts

/components
  /ui/           ← composants shadcn génériques
  /interview/    ← composants spécifiques à l'interview
  /layout/       ← Navbar, Shell, etc.

/lib
  firebase.ts
  gemini.ts
  elevenlabs.ts

/actions
  interview.actions.ts
  feedback.actions.ts

/hooks
  useInterview.ts
  useAuth.ts

/types
  interview.ts
  user.ts
```

---

## 📂 Responsabilités détaillées

### `/app/(auth)`
Pages d'authentification uniquement — login et signup. Pas de logique métier ici, juste l'UI et l'appel à `useAuth`.

### `/app/(app)/layout.tsx`
Navbar globale (fond blanc, bordure verte soft) + protection de route (redirige si non connecté).

### `/app/(app)/page.tsx` — Dashboard `/`
Page d'accueil après connexion. Affiche les stats de l'utilisateur et le CTA "Démarrer une interview". Lit les données via `useInterview`.

### `/app/interview/new/page.tsx`
Formulaire de configuration d'une nouvelle interview (poste, niveau, type). Appelle `interview.action.ts` pour créer la session en Firestore.

### `/app/interview/[id]/page.tsx`
Écran principal de l'interview en cours. Affiche la question, la barre de progression, gère l'enregistrement audio. Orchestré par `useInterview`.

### `/app/review/[id]/page.tsx`
Résultats et feedback post-interview. Lit les données de feedback depuis Firestore via `feedback.action.ts`.

### `/app/history/page.tsx`
Liste paginée des interviews passées. Lecture seule depuis Firestore.

### `/app/profile/page.tsx`
Profil utilisateur — infos, préférences, déconnexion.

---

## ⚙️ `/api`

### `/api/gemini/route.ts`
**Route API Next.js** — seul point d'entrée vers Gemini. Reçoit une question + contexte, retourne la réponse IA. Les composants n'appellent jamais Gemini directement.

---

## 📦 `/lib` — Clients & initialisations

> **Règle :** ces fichiers initialisent des clients SDK. Ils **n'exécutent aucune logique métier**.

| Fichier | Rôle |
|---|---|
| `firebase.ts` | Initialise l'app Firebase (Auth, Firestore, Storage). Exporte `db`, `auth`, `storage`. |
| `gemini.ts` | Configure le client Gemini (clé API, modèle). Exporte une fonction `askGemini(prompt)` bas niveau. |
| `elevenlabs.ts` | Configure le client ElevenLabs. Exporte `textToSpeech(text)`. |

---

## 🛠️ `/actions` — Server Actions Next.js

> **Règle :** chaque fichier commence par `"use server"`. Ces fonctions s'exécutent **exclusivement côté serveur** — elles ont accès à Firestore, aux variables d'environnement, et ne sont jamais exposées au client.

> ⚠️ **Différence avec les hooks :** les actions font le travail (écriture/lecture DB, logique) ; les hooks appellent les actions et gèrent l'état React qui en résulte.

### `interview.actions.ts`
```ts
"use server"
```
Tout ce qui concerne les sessions d'interview dans Firestore :
- `createInterview(config)` → crée un document interview
- `getInterview(id)` → lit une interview par ID
- `updateInterview(id, data)` → met à jour (ex : ajouter une réponse)
- `getUserInterviews(userId)` → liste les interviews d'un utilisateur

### `feedback.actions.ts`
```ts
"use server"
```
Tout ce qui concerne les feedbacks/scores :
- `saveFeedback(interviewId, feedback)` → écrit le feedback IA en Firestore
- `getFeedback(interviewId)` → lit le feedback d'une interview
- `computeScore(answers)` → calcule un score global

---

## 🪝 `/hooks` — État React & orchestration UI

> **Règle :** les hooks **n'écrivent pas en base directement** — ils délèguent aux Server Actions. Ils gèrent l'état local, le loading, les erreurs.

### `useInterview.ts`
État de la session d'interview active :
- `interview` — données courantes
- `isLoading`, `error`
- `startInterview()` → appelle `interview.actions.createInterview`
- `submitAnswer(answer)` → appelle `interview.actions.updateInterview` + `/api/gemini`
- `endInterview()` → finalise et déclenche le feedback

### `useAuth.ts`
État de l'authentification :
- `user` — utilisateur Firebase courant
- `isLoading`
- `signIn()`, `signUp()`, `signOut()` → wrappent les méthodes Firebase Auth
- Utilisé dans `layout.tsx` pour protéger les routes

---

## 🗂️ `/types`

### `interview.ts`
```ts
type InterviewStatus = 'pending' | 'active' | 'completed'

interface Interview {
  id: string
  userId: string
  role: string
  level: 'junior' | 'mid' | 'senior'
  questions: Question[]
  answers: Answer[]
  status: InterviewStatus
  createdAt: Timestamp
}

interface Question { id: string; text: string; category: string }
interface Answer   { questionId: string; text: string; audioUrl?: string }
```

### `user.ts`
```ts
interface UserProfile {
  uid: string
  email: string
  displayName: string
  totalInterviews: number
  averageScore: number
}
```

---

## 🔄 Flux de données (résumé)

```
Page/Component
  → appelle un Hook          (gestion état React)
    → appelle une Action     (Server Action — CRUD Firestore)
      → utilise /lib         (client Firebase/Gemini/ElevenLabs)

Page/Component
  → fetch vers /api/gemini/route.ts   (appel IA)
    → utilise lib/gemini.ts
```

**Chaque couche a une seule responsabilité. Aucun doublon.**

---

## ✅ Anti-confusion — Tableau récapitulatif

| Où | Fait quoi | Ne fait PAS |
|---|---|---|
| `/lib` | Initialise les clients SDK | Logique métier, état React |
| `/actions` | Server Actions — CRUD Firestore, logique serveur | État React, UI, s'exécute côté client |
| `/hooks` | État React, appel des Server Actions | Écriture Firestore directe, UI |
| `/components` | Affichage, interactions | Logique métier, accès DB |
| `/api` | Routes Next.js vers IA | Firestore, état |
| `/app` | Pages & routing | Logique métier directe |