"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export function Hero() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <section className="relative pt-24 pb-20 overflow-hidden bg-[var(--bg-page)] text-[var(--text-primary)] border-b border-[var(--border-default)]">
      
      <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
        <div className={`transition-all duration-1000 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-[var(--text-primary)] leading-tight">
            Maîtrisez vos entretiens, <br />
            sans <span className="text-[var(--accent)]">pression</span>.
          </h1>

          <p className="text-lg md:text-xl text-[var(--text-secondary)] font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
            Un espace neutre et structuré pour s'entraîner à l'oral avec une intelligence artificielle. Recevez un feedback détaillé et améliorez-vous à votre rythme.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup" className="w-full sm:w-auto px-6 py-3 bg-[var(--accent)] text-white font-medium rounded-md hover:bg-[var(--accent-hover)] transition-colors text-sm shadow-sm">
              Commencer gratuitement
            </Link>
            <Link href="/login" className="w-full sm:w-auto px-6 py-3 bg-[var(--bg-page)] text-[var(--text-primary)] font-medium rounded-md border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors text-sm shadow-xs">
              Accéder à l'espace élève
            </Link>
          </div>

          <div className="mt-16 flex flex-col items-center">
             <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--border-default)] to-transparent mb-8"></div>
             <p className="text-xs font-medium text-[var(--text-disabled)] uppercase tracking-wider mb-6">
                Ils s'entraînent avec notre plateforme
             </p>
             <div className="flex gap-8 items-center justify-center opacity-60 grayscale filter hover:grayscale-0 transition-all duration-500">
                <div className="font-bold text-lg text-[var(--text-secondary)]">Skillwokz</div>
                <div className="font-bold text-lg text-[var(--text-secondary)]">Nera</div>
                <div className="font-bold text-lg text-[var(--text-secondary)]">Pharmzone</div>
             </div>
          </div>
        </div>
      </div>
    </section>
  )
}
