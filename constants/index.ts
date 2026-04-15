import { Interview } from "@/types/interview"
import { Timestamp } from "firebase/firestore"

export const DUMMY_INTERVIEWS: Omit<Interview, "id" | "createdAt">[] = [
  {
    userId: "demo", // Sera remplacé au moment de l'insertion
    role: "Développeur Frontend React",
    level: "mid",
    status: "completed",
    questions: [
      { id: "q1", text: "Pouvez-vous expliquer le fonctionnement du Virtual DOM en React ?", category: "React Core" },
      { id: "q2", text: "Quelle est la différence entre useMemo et useCallback ?", category: "React Hooks" },
    ],
    answers: [
      { questionId: "q1", text: "Le Virtual DOM est une copie légère en mémoire du DOM réel." },
      { questionId: "q2", text: "useMemo mémorise une valeur calculée, tandis que useCallback mémorise la définition d'une fonction." },
    ]
  },
  {
    userId: "demo",
    role: "Développeur Backend Node.js",
    level: "senior",
    status: "completed",
    questions: [
      { id: "q1", text: "Comment gérez-vous les fuites de mémoire dans une application Node ?", category: "Performance" },
      { id: "q2", text: "Expliquez l'Event Loop de Node.js.", category: "Architecture" },
    ],
    answers: [
      { questionId: "q1", text: "J'utilise des outils comme heapdump et Chrome DevTools." },
      { questionId: "q2", text: "L'Event Loop permet à Node.js d'effectuer des opérations non-bloquantes." },
    ]
  },
  {
    userId: "demo",
    role: "Ingénieur DevOps",
    level: "mid",
    status: "active",
    questions: [
      { id: "q1", text: "Quelle est la différence entre un conteneur et une machine virtuelle ?", category: "Docker" },
    ],
    answers: []
  },
  {
    userId: "demo",
    role: "Data Scientist",
    level: "junior",
    status: "completed",
    questions: [
      { id: "q1", text: "Comment gérez-vous les valeurs manquantes dans un dataset ?", category: "Data Cleaning" },
      { id: "q2", text: "Qu'est-ce que l'overfitting et comment l'éviter ?", category: "Machine Learning" },
    ],
    answers: [
      { questionId: "q1", text: "On peut les supprimer ou les imputer avec la moyenne/médiane." },
      { questionId: "q2", text: "L'overfitting c'est quand le modèle apprend le bruit. On l'évite par régularisation (L1/L2) ou cross-validation." },
    ]
  },
  {
    userId: "demo",
    role: "Product Manager",
    level: "senior",
    status: "completed",
    questions: [
      { id: "q1", text: "Comment priorisez-vous les fonctionnalités d'une roadmap ?", category: "Stratégie" },
    ],
    answers: [
      { questionId: "q1", text: "J'utilise des frameworks comme RICE ou MoSCoW, en alignant les KPIs avec les objectifs métiers." },
    ]
  },
  {
    userId: "demo",
    role: "UX/UI Designer",
    level: "mid",
    status: "pending",
    questions: [],
    answers: []
  },
  {
    userId: "demo",
    role: "Chef de Projet IT",
    level: "senior",
    status: "completed",
    questions: [
      { id: "q1", text: "Comment gérez-vous un conflit de planning entre deux développeurs clés ?", category: "Management" },
    ],
    answers: [
      { questionId: "q1", text: "Je privilégie la communication transparente et l'ajustement du chemin critique du projet." },
    ]
  },
  {
    userId: "demo",
    role: "Ingénieur Cyber-Sécurité",
    level: "senior",
    status: "completed",
    questions: [
      { id: "q1", text: "Comment protéger une API publique contre le scraping ?", category: "Sécurité API" },
    ],
    answers: [
      { questionId: "q1", text: "Mise en place de Rate Limiting, WAF, et analyse comportementale." },
    ]
  },
  {
    userId: "demo",
    role: "Développeur Mobile iOS (Swift)",
    level: "junior",
    status: "active",
    questions: [
      { id: "q1", text: "Que sont les optionals en Swift ?", category: "Swift Core" },
    ],
    answers: [
      { questionId: "q1", text: "Les optionals permettent de gérer l'absence de valeur de manière sûre." },
    ]
  },
  {
    userId: "demo",
    role: "Architecte Cloud AWS",
    level: "senior",
    status: "completed",
    questions: [
      { id: "q1", text: "Comment concevoir une architecture hautement disponible ?", category: "Architecture" },
    ],
    answers: [
      { questionId: "q1", text: "En déployant sur plusieurs Availability Zones (AZs) avec de l'Auto Scaling et un Load Balancer." },
    ]
  }
]
