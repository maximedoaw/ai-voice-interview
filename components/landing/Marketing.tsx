"use client"

import Link from "next/link"
import { ArrowRight, Star, MessageSquare, Plus, X } from "lucide-react"
import { useState, useRef } from "react"

export function Features() {
  const steps = [
    {
      title: "Interaction Vocale",
      desc: "Discutez naturellement avec l'IA. Notre technologie de voix humaine assure une immersion totale et une réponse fluide.",
      accent: "text-emerald-500"
    },
    {
      title: "Analyse Objective",
      desc: "Nos modèles analysent vos réponses, votre structure et votre ton pour vous donner un feedback pédagogique immédiat.",
      accent: "text-emerald-500"
    },
    {
      title: "Suivi de Session",
      desc: "Consultez l'historique complet de vos entraînements, suivez l'évolution de vos scores et préparez-vous sereinement.",
      accent: "text-emerald-500"
    }
  ]

  return (
    <section id="features" className="py-32 bg-white px-6 relative overflow-hidden font-outfit">
      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="text-center mb-24 max-w-2xl mx-auto space-y-6 px-4">
           <h2 className="text-[9px] font-black uppercase text-emerald-500 tracking-[0.4em] opacity-30">Audit & Feedback</h2>
           <h1 className="text-4xl md:text-6xl font-black text-[#1C1C1C] leading-[1] tracking-tighter uppercase relative">
             L'EXCELLENCE <br /> 
             <span className="relative inline-block italic text-emerald-500">
                SANS COMPROMIS 
                <div className="absolute -bottom-1 left-0 w-full h-2 bg-emerald-50 -z-10 rotate-1"></div>
             </span>
          </h1>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((s, idx) => (
             <div key={idx} className="group relative">
                <div className="relative p-10 rounded-[2.5rem] bg-white border border-zinc-100 transition-all duration-700 hover:shadow-2xl hover:shadow-emerald-500/5 hover:-translate-y-2 flex flex-col h-full overflow-hidden">
                    <div className="mb-10 w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center text-2xl font-black shadow-sm transition-transform group-hover:rotate-6">
                       0{idx + 1}
                    </div>
                    <h3 className={`text-xl font-black mb-6 tracking-tight uppercase ${s.accent}`}>{s.title}</h3>
                    <p className="text-zinc-500 font-medium leading-relaxed mb-10 flex-1 text-sm opacity-80">{s.desc}</p>
                    
                    <div className="flex justify-between items-center pt-8 border-t border-zinc-50">
                       <span className="text-[9px] font-black uppercase tracking-[0.1em] text-emerald-500/20 italic">Module_0{idx+1}</span>
                       <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg shadow-emerald-500/20">
                          <ArrowRight className="w-4 h-4" />
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

export function Testimonials() {
  const reviews = [
    { name: "Marc Ngando", role: "Software Engineer", text: "L'IA m'a aidé à corriger mon élocution. J'ai décroché le job à Yaoundé." },
    { name: "Sandra Fotso", role: "Project Manager", text: "Le fait de parler naturellement et d'avoir un feedback instantané change tout." },
    { name: "Vanessa Ebolowa", role: "UX Designer", text: "Grâce aux simulations répétées, j'ai gagné une confiance énorme." },
    { name: "Jean-Paul Kamdem", role: "Data Analyst", text: "L'outil est d'une précision chirurgicale sur les questions techniques." },
    { name: "Rostand Mbarga", role: "Back-End Dev", text: "Une expérience immersive qui prépare réellement à la pression du direct." }
  ]

  const duplicatedReviews = [...reviews, ...reviews]

  return (
    <section className="py-32 bg-[#FBFBFA] border-y border-zinc-50 overflow-hidden relative font-outfit">
       <div className="container mx-auto max-w-6xl relative z-10 px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
             <div className="max-w-xl space-y-8">
                <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-xl -rotate-6">
                   <MessageSquare className="w-8 h-8" />
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-[#1C1C1C] uppercase tracking-tighter italic leading-[0.85]">ILS ONT <br /><span className="text-emerald-500 tracking-normal underline decoration-emerald-100 decoration-[12px]">RÉUSSI.</span></h2>
             </div>
             <p className="text-emerald-600 font-bold uppercase tracking-[0.4em] text-[10px] opacity-40 mb-10">Real Experiences</p>
          </div>
       </div>

       <div className="relative flex overflow-hidden group">
          <div className="flex animate-[marquee_40s_linear_infinite] group-hover:[animation-play-state:paused] gap-8 px-4">
             {duplicatedReviews.map((r, i) => (
                <div key={i} className="flex-none w-[320px] md:w-[450px]">
                   <div className="p-12 rounded-[3.5rem] bg-white border-2 border-emerald-50 shadow-[20px_20px_80px_-20px_rgba(16,185,129,0.05)] flex flex-col items-start gap-8 transition-all hover:border-emerald-500/20 h-full relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/20 rounded-bl-[5rem] -z-10"></div>
                      <div className="flex gap-1">
                         {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 text-emerald-500 fill-current" />)}
                      </div>
                      <p className="text-[#1C1C1C] font-black italic text-xl md:text-2xl leading-snug tracking-tighter grow group-hover:scale-[1.02] transition-transform duration-700">"{r.text}"</p>
                      <div className="pt-8 border-t-2 border-emerald-50/30 w-full mt-auto">
                         <h4 className="font-black text-[#1C1C1C] uppercase tracking-widest text-xs">{r.name}</h4>
                         <p className="text-[10px] font-bold text-emerald-500 uppercase opacity-60 tracking-[0.2em] mt-1">{r.role}</p>
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
    { q: "Comment fonctionne l'IA ?", a: "Nous utilisons ElevenLabs pour générer une voix humaine fluide et Gemini pour analyser vos réponses en temps réel." },
    { q: "Les entretiens sont-ils personnalisés ?", a: "Oui, vous pouvez choisir votre rôle, votre niveau et obtenir des questions adaptées." },
    { q: "Puis-je revoir mes feedbacks ?", a: "Absolument. Chaque session est enregistrée dans votre historique avec un compte-rendu détaillé." }
  ]

  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="py-32 bg-white px-6">
       <div className="container mx-auto max-w-3xl font-outfit">
          <div className="text-center mb-24 space-y-6">
             <h2 className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.5em]">Support & QA</h2>
             <h2 className="text-5xl font-black text-[#1C1C1C] uppercase tracking-tighter leading-none">HELP <br /> <span className="italic text-emerald-500 tracking-normal border-b-4 border-emerald-50 inline-block">CENTER.</span></h2>
          </div>

          <div className="space-y-4">
             {faqs.map((f, i) => (
                <div key={i} className={`group rounded-[2rem] bg-white transition-all duration-700 border-2 overflow-hidden ${open === i ? 'border-emerald-500/20 shadow-xl shadow-emerald-500/5' : 'border-zinc-50 hover:border-emerald-50'}`}>
                   <button 
                    onClick={() => setOpen(open === i ? null : i)}
                    className="w-full px-10 py-8 flex justify-between items-center text-left"
                   >
                      <h3 className={`text-xl font-black uppercase tracking-tighter transition-colors ${open === i ? 'text-emerald-600' : 'text-zinc-600'}`}>{f.q}</h3>
                      <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-700 ${open === i ? 'bg-emerald-500' : 'bg-emerald-50'}`}>
                         <div className={`absolute w-4 h-0.5 rounded-full transition-all duration-700 ${open === i ? 'bg-white rotate-45' : 'bg-emerald-600'}`}></div>
                         <div className={`absolute h-4 w-0.5 rounded-full transition-all duration-700 ${open === i ? 'bg-white rotate-45 opacity-0' : 'bg-emerald-600'}`}></div>
                         <div className={`absolute w-4 h-0.5 rounded-full bg-white transition-all duration-700 -rotate-45 ${open === i ? 'opacity-100' : 'opacity-0 rotate-0'}`}></div>
                      </div>
                   </button>
                   
                   <div className={`grid transition-all duration-700 ${open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden">
                         <div className="px-10 pb-10">
                            <p className="text-zinc-500 font-bold leading-relaxed italic text-xl pr-12">{f.a}</p>
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
    <section className="py-48 bg-white px-6 font-outfit overflow-hidden">
       <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-24">
             <div className="flex-1 space-y-12">
                <h2 className="text-6xl md:text-8xl font-black text-[#1C1C1C] uppercase tracking-tighter leading-[0.8] italic">
                   COMMENCEZ EN <br />
                   <span className="text-emerald-500 tracking-normal underline decoration-emerald-100 decoration-[16px] underline-offset-8">3 SECONDES.</span>
                </h2>
                <p className="text-zinc-400 font-bold text-xl md:text-2xl max-w-lg leading-snug">
                   Pas de formulaires interminables. Pas d'attente. Juste vous et votre futur job.
                </p>
                <div className="flex gap-4">
                   <Link href="/signup" className="px-12 py-6 bg-[#1C1C1C] text-white font-black rounded-2xl hover:bg-emerald-500 transition-all text-xs uppercase tracking-[0.4em] shadow-2xl active:scale-95">
                      Ouvrir ma Session
                   </Link>
                </div>
             </div>

             <div className="flex-1 w-full relative">
                <div className="absolute inset-0 bg-emerald-50 blur-[100px] opacity-30 -z-10"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {[
                      { t: "Config", d: "Choisissez votre poste et votre niveau réel." },
                      { t: "Live", d: "Répondez à voix haute aux questions de l'IA." },
                      { t: "Stats", d: "Obtenez un score et vos points d'amélioration." },
                      { t: "Done", d: "Soyez prêt pour l'entretien physique." }
                   ].map((step, i) => (
                      <div key={i} className="p-10 rounded-[2.5rem] bg-white border border-zinc-100 shadow-xl shadow-zinc-950/5 -rotate-2 hover:rotate-0 transition-all duration-500">
                         <h4 className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.4em] mb-4">Step_0{i+1}</h4>
                         <h5 className="text-2xl font-black text-[#1C1C1C] uppercase mb-4 tracking-tighter">{step.t}</h5>
                         <p className="text-zinc-400 font-bold leading-tight text-sm">{step.d}</p>
                      </div>
                   ))}
                </div>
             </div>
          </div>
       </div>
    </section>
  )
}
