"use client"

import Link from "next/link"
import { ArrowRight, Star, MessageSquare, Plus, X } from "lucide-react"
import { useState } from "react"

export function Features() {
  const steps = [
    {
      title: "Interaction Vocale",
      desc: "Discutez naturellement avec l'IA. Notre technologie de voix assure une immersion totale et une réponse fluide.",
    },
    {
      title: "Analyse Objective",
      desc: "Nos modèles analysent vos réponses, votre structure et votre ton pour vous donner un feedback pédagogique immédiat.",
    },
    {
      title: "Suivi de Session",
      desc: "Consultez l'historique complet de vos entraînements, suivez l'évolution de vos scores et préparez-vous sereinement.",
    }
  ]

  return (
    <section id="features" className="py-24 bg-[var(--bg-sidebar)] px-6 border-b border-[var(--border-default)]">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-16 max-w-2xl mx-auto space-y-4">
           <span className="px-3 py-1 text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-page)] border border-[var(--border-default)] rounded-full">
              Audit & Feedback
           </span>
           <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] leading-tight">
             L'excellence pour votre préparation
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, idx) => (
             <div key={idx} className="p-8 rounded-xl bg-[var(--bg-page)] border border-[var(--border-default)] shadow-xs flex flex-col h-full hover:shadow-sm transition-shadow">
                <div className="mb-6 w-12 h-12 bg-[var(--bg-hover)] text-[var(--text-secondary)] rounded flex items-center justify-center text-sm font-bold border border-[var(--border-default)]">
                   0{idx + 1}
                </div>
                <h3 className="text-lg font-semibold mb-3 text-[var(--text-primary)]">{s.title}</h3>
                <p className="text-[var(--text-secondary)] font-medium leading-relaxed text-sm flex-1">{s.desc}</p>
             </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Testimonials() {
  const reviews = [
    { name: "Marc N.", role: "Software Engineer", text: "L'IA m'a aidé à corriger mon élocution. J'ai décroché le job." },
    { name: "Sandra F.", role: "Project Manager", text: "Le fait de parler naturellement et d'avoir un feedback instantané change tout." },
    { name: "Vanessa E.", role: "UX Designer", text: "Grâce aux simulations répétées, j'ai gagné une confiance énorme." },
    { name: "Jean-Paul K.", role: "Data Analyst", text: "L'outil est d'une précision chirurgicale sur les questions techniques." },
    { name: "Rostand M.", role: "Back-End Dev", text: "Une expérience immersive qui prépare réellement à la pression du direct." }
  ]

  const duplicatedReviews = [...reviews, ...reviews]

  return (
    <section className="py-24 bg-[var(--bg-page)] border-b border-[var(--border-default)] overflow-hidden relative">
       <div className="container mx-auto max-w-5xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
             <div className="max-w-xl space-y-4">
                <div className="w-10 h-10 bg-[var(--accent-subtle)] text-[var(--accent)] rounded flex items-center justify-center">
                   <MessageSquare size={20} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] leading-tight">Ils ont réussi leurs entretiens</h2>
             </div>
          </div>
       </div>

       <div className="relative flex overflow-hidden group">
          <div className="flex animate-[marquee_40s_linear_infinite] group-hover:[animation-play-state:paused] gap-6 px-4">
             {duplicatedReviews.map((r, i) => (
                <div key={i} className="flex-none w-[300px] md:w-[400px]">
                   <div className="p-8 rounded-xl bg-[var(--bg-sidebar)] border border-[var(--border-default)] flex flex-col items-start gap-6 h-full hover:bg-[var(--bg-hover)] transition-colors">
                      <div className="flex gap-1">
                         {[1,2,3,4,5].map(s => <Star key={s} size={14} className="text-[var(--accent)] fill-[var(--accent)]" />)}
                      </div>
                      <p className="text-[var(--text-primary)] font-medium text-base leading-relaxed grow">"{r.text}"</p>
                      <div className="pt-6 border-t border-[var(--border-default)] w-full mt-auto">
                         <h4 className="font-semibold text-[var(--text-primary)] text-sm">{r.name}</h4>
                         <p className="text-xs font-medium text-[var(--text-secondary)] mt-0.5">{r.role}</p>
                      </div>
                   </div>
                </div>
             ))}
          </div>
       </div>

       <style jsx>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
       `}</style>
    </section>
  )
}

export function FAQ() {
  const faqs = [
    { q: "Comment fonctionne l'IA ?", a: "Nous utilisons un modèle avancé pour générer une voix fluide et analyser vos réponses en temps réel de manière objective." },
    { q: "Les entretiens sont-ils personnalisés ?", a: "Oui, vous pouvez choisir votre rôle, votre niveau et obtenir des questions adaptées au poste visé." },
    { q: "Puis-je revoir mes feedbacks ?", a: "Absolument. Chaque session est enregistrée dans votre historique avec un compte-rendu détaillé." }
  ]

  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24 bg-[var(--bg-sidebar)] px-6 border-b border-[var(--border-default)]">
       <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16 space-y-4">
             <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">Questions fréquentes</h2>
          </div>

          <div className="space-y-3">
             {faqs.map((f, i) => (
                <div key={i} className={`rounded-xl bg-[var(--bg-page)] transition-all border ${open === i ? 'border-[var(--border-strong)]' : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'}`}>
                   <button 
                    onClick={() => setOpen(open === i ? null : i)}
                    className="w-full px-6 py-5 flex justify-between items-center text-left"
                   >
                      <h3 className="text-sm font-semibold text-[var(--text-primary)]">{f.q}</h3>
                      <div className="text-[var(--text-secondary)]">
                         {open === i ? <X size={18} /> : <Plus size={18} />}
                      </div>
                   </button>
                   
                   <div className={`grid transition-all ${open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden">
                         <div className="px-6 pb-6 pt-2">
                            <p className="text-[var(--text-secondary)] font-medium leading-relaxed text-sm">{f.a}</p>
                         </div>
                      </div>
                   </div>
                </div>
             ))}
          </div>
       </div>
    </section>
  )
}

export function FinalConversion() {
  return (
    <section className="py-32 bg-[var(--bg-page)] px-6 text-center">
       <div className="container mx-auto max-w-4xl space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
             Prêt à exceller lors de votre prochain entretien ?
          </h2>
          <p className="text-[var(--text-secondary)] font-medium text-lg max-w-2xl mx-auto">
             Inscrivez-vous gratuitement et lancez votre première simulation en quelques clics.
          </p>
          <div className="pt-4 flex justify-center">
             <Link href="/signup" className="px-8 py-3 bg-[var(--accent)] text-white font-medium rounded-md hover:bg-[var(--accent-hover)] transition-colors shadow-sm text-sm">
                Commencer maintenant
             </Link>
          </div>
       </div>
    </section>
  )
}
