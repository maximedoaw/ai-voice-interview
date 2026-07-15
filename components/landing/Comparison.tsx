"use client"

import { Check, X, Zap, Target, BookOpen, Clock, Users } from "lucide-react"

export function Comparison() {
  const traditional = [
    { text: "Attente de 3 à 7 jours pour un feedback", icon: <Clock className="w-5 h-5" /> },
    { text: "Biais cognitifs et subjectivité humaine", icon: <Users className="w-5 h-5" /> },
    { text: "Disponibilité limitée sur rendez-vous", icon: <Target className="w-5 h-5" /> },
    { text: "Expertise limitée au domaine du coach", icon: <BookOpen className="w-5 h-5" /> }
  ]

  const ai = [
    { text: "Analyse instantanée en moins de 2s", icon: <Zap className="w-5 h-5" /> },
    { text: "Évaluation objective sans aucun biais", icon: <Target className="w-5 h-5" /> },
    { text: "Entraînement illimité 24h/24 & 7j/7", icon: <Check className="w-5 h-5" /> },
    { text: "Connaissances techniques multisectorielles", icon: <BookOpen className="w-5 h-5" /> }
  ]

  return (
    <section className="py-24 bg-[var(--bg-page)] px-6 border-b border-[var(--border-default)]">
      <div className="container mx-auto max-w-5xl">
        
        <div className="text-center mb-16 space-y-4">
           <h3 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] leading-tight">
              L'ancienne méthode vs <span className="text-[var(--accent)]">notre approche</span>
           </h3>
           <p className="text-[var(--text-secondary)] max-w-2xl mx-auto font-medium">Découvrez comment l'intelligence artificielle transforme la préparation aux entretiens.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
          
          {/* Traditional Side */}
          <div className="space-y-6">
             <div className="mb-6 space-y-1">
                <h4 className="text-lg font-semibold text-[var(--text-primary)]">Méthode traditionnelle</h4>
                <p className="text-sm text-[var(--text-disabled)] font-medium">Lent et subjectif</p>
             </div>
             
             <div className="flex flex-col gap-3">
                {traditional.map((item, i) => (
                   <div 
                    key={i} 
                    className="p-5 rounded-lg bg-[var(--bg-sidebar)] border border-[var(--border-default)]"
                   >
                      <div className="flex items-center gap-4">
                         <div className="w-8 h-8 rounded-md bg-[var(--danger-bg)] flex items-center justify-center text-[var(--danger)] shrink-0">
                            <X className="w-4 h-4" />
                         </div>
                         <p className="text-[var(--text-secondary)] font-medium text-sm">
                            {item.text}
                         </p>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* AI Side */}
          <div className="space-y-6">
             <div className="mb-6 space-y-1">
                <h4 className="text-lg font-semibold text-[var(--text-primary)]">Notre solution IA</h4>
                <p className="text-sm text-[var(--accent)] font-medium">Rapide et objectif</p>
             </div>
             
             <div className="flex flex-col gap-3">
                {ai.map((item, i) => (
                   <div 
                    key={i} 
                    className="p-5 rounded-lg bg-[var(--bg-page)] shadow-xs border border-[var(--border-default)]"
                   >
                      <div className="flex items-center gap-4">
                         <div className="w-8 h-8 rounded-md bg-[var(--success-bg)] text-[var(--success)] flex items-center justify-center shrink-0 border border-transparent">
                            <Check className="w-4 h-4" />
                         </div>
                         <p className="text-[var(--text-primary)] font-medium text-sm">
                            {item.text}
                         </p>
                      </div>
                   </div>
                ))}
             </div>
          </div>

        </div>
      </div>
    </section>
  )
}
