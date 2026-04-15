"use client"

import { Check, X, Zap, Target, BookOpen, Clock, Users, ShieldAlert } from "lucide-react"

export function Comparison() {
  const traditional = [
    { text: "Attente de 3 à 7 jours pour un feedback", icon: <Clock className="w-5 h-5" /> },
    { text: "Biais cognitifs et subjectivité humaine", icon: <Users className="w-5 h-5" /> },
    { text: "Disponibilité limitée sur rendez-vous", icon: <Target className="w-5 h-5" /> },
    { text: "Expertise limitée au domaine du coach", icon: <BookOpen className="w-5 h-5" /> }
  ]

  const ai = [
    { text: "Analyse instantanée en moins de 2s", icon: <Zap className="w-5 h-5" /> },
    { text: "Évaluation objective sans aucun biais", icon: <Target className="w-4 h-4" /> },
    { text: "Entraînement illimité 24h/24 & 7j/7", icon: <Check className="w-4 h-4" /> },
    { text: "Connaissances techniques multisectorielles", icon: <BookOpen className="w-5 h-5" /> }
  ]

  return (
    <section className="py-24 bg-white px-6 overflow-hidden relative font-outfit">
      <div className="container mx-auto max-w-5xl relative">
        
        <div className="text-center mb-20 space-y-2">
           <h2 className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.6em]">System Protocol Analysis</h2>
           <h3 className="text-3xl md:text-5xl font-black text-[#1C1C1C] uppercase tracking-tighter leading-none italic">
              L'ANCIEN VS <span className="text-emerald-400">LE NOUVEAU.</span>
           </h3>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between relative gap-16 lg:gap-24">
          
          {/* Traditional Side (LEFT - RED VIVID & READABLE) */}
          <div className="flex-1 space-y-12 relative group w-full lg:w-auto">
             <div className="mb-10 space-y-2 lg:px-0">
                <div className="text-[10px] font-bold uppercase text-red-500 tracking-[0.2em] mb-1">Old Architecture</div>
                <h4 className="text-2xl font-black text-zinc-200 font-outfit uppercase tracking-tighter opacity-70 italic leading-none">Fragile & Lent.</h4>
             </div>
             
             <div className="flex flex-col gap-4">
                {traditional.map((item, i) => (
                   <div 
                    key={i} 
                    className={`relative p-8 rounded-2xl bg-white shadow-xl shadow-red-950/5 border-2 border-red-50 transition-all duration-700 hover:scale-[1.02] ${i % 2 === 0 ? '-rotate-1 -translate-x-1' : 'rotate-1 translate-x-1'}`}
                   >
                      {/* Vivid Red Sidebar */}
                      <div className="absolute left-0 inset-y-6 w-1 bg-red-500 rounded-full"></div>
                      <div className="flex items-center gap-6">
                         <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                            <X className="w-3.5 h-3.5" />
                         </div>
                         <p className="text-zinc-600 font-bold text-base leading-snug tracking-tight">
                            {item.text}
                         </p>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* AI Side (RIGHT - GREEN) */}
          <div className="flex-1 space-y-12 relative group w-full lg:w-auto mt-12 lg:mt-0">
             <div className="mb-10 space-y-2 lg:text-right">
                <div className="text-[10px] font-bold uppercase text-emerald-400 tracking-[0.2em] mb-1">Neural Solution</div>
                <h4 className="text-2xl font-black text-[#1C1C1C] font-outfit uppercase tracking-tighter leading-none">Immédiate et Précise.</h4>
             </div>
             
             <div className="flex flex-col gap-4 ">
                {ai.map((item, i) => (
                   <div 
                    key={i} 
                    className={`p-8 rounded-2xl bg-white shadow-2xl shadow-emerald-500/5 border-2 border-emerald-50 transition-all duration-700 hover:scale-[1.02] ${i % 2 === 0 ? 'rotate-1 translate-x-1' : '-rotate-1 -translate-x-1'}`}
                   >
                      <div className="flex items-center lg:flex-row-reverse gap-6">
                         <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Check className="w-4 h-4" />
                         </div>
                         <p className="text-[#1C1C1C] font-black text-base leading-snug tracking-tight lg:text-right">
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
