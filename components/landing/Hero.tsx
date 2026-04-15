"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { BookOpen, GraduationCap, Mic, Target, Award, ShieldCheck, Zap } from "lucide-react"

export function Hero() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <section className="relative pt-24 pb-32 overflow-hidden bg-white">
      {/* Background - EdTech Pattern Refined (More subtle) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:2rem_2rem]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
        <div className={`transition-all duration-1000 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>

          <div className="relative mb-12 px-4 space-y-4">
            <h1 className={`text-4xl md:text-6xl font-black font-outfit text-[#1C1C1C] leading-[0.95] tracking-tighter transition-all duration-1000 delay-300 ${isMounted ? 'opacity-100 blur-0' : 'opacity-0 blur-xl uppercase'}`}>
              RÉUSSI <br />
              <span className="relative inline-block mt-2 lg:mt-0 font-outfit text-emerald-400">
                L'ORAL
                {/* Zigzag Underline SVG - Finer */}
                <svg className="absolute -bottom-1 left-0 w-full h-2 text-emerald-100" viewBox="0 0 200 20" preserveAspectRatio="none">
                  <path d="M0,10 Q25,0 50,10 T100,10 T150,10 T200,10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
              {" "}
              <span className="relative inline-block mt-4 lg:mt-0">
                <span className="relative z-10 text-white px-6 py-2.5 bg-emerald-400 inline-block -rotate-1 shadow-xl shadow-emerald-400/10 rounded-2xl font-outfit uppercase text-3xl md:text-5xl">
                  MAINTENANT.
                </span>
              </span>
            </h1>
          </div>

          <div className="space-y-12">
            <p className={`text-zinc-400 text-base md:text-lg max-w-md mx-auto font-outfit font-medium leading-tight transition-all duration-1000 delay-500 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
              Une architecture <span className="text-emerald-500 underline decoration-emerald-50 underline-offset-4">pédagogique</span> par la voix pour transformer vos hésitations.
            </p>

            <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-700 ${isMounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <Link href="/signup" className="group relative px-10 py-4 bg-emerald-400 text-white font-black rounded-xl hover:bg-emerald-500 transition-all text-[10px] tracking-[0.2em] shadow-xl shadow-emerald-400/10 active:scale-95 uppercase">
                Ouvrir ma Session
              </Link>
              <Link href="/login" className="px-10 py-4 bg-white text-emerald-400 font-black rounded-xl shadow-sm hover:shadow-md transition-all text-[10px] tracking-[0.2em] uppercase border border-zinc-50">
                Accès Elève
              </Link>
            </div>
          </div>

          {/* Graphical Section - More refined/smaller */}
          <div className={`mt-24 max-w-2xl mx-auto transition-all duration-1000 delay-1000 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-white border text-left border-zinc-50 shadow-2xl relative p-8 rounded-[2.5rem] overflow-hidden">
              <div className="flex gap-2 items-center mb-10 opacity-5">
                <div className="w-8 h-1 bg-emerald-400 rounded-full"></div>
                <div className="w-4 h-1 bg-emerald-400 rounded-full"></div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                  <div className="w-full h-0.5 bg-zinc-50 rounded-full"></div>
                  <div className="w-5/6 h-0.5 bg-zinc-50 rounded-full opacity-60"></div>
                  <div className="w-4/6 h-0.5 bg-zinc-50 rounded-full opacity-30"></div>
                </div>

                <div className="w-full md:w-32 aspect-square bg-emerald-50/10 rounded-3xl border border-emerald-50 flex items-center justify-center relative">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
