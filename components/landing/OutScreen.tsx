"use client"

import Link from "next/link"
import { Hero } from './Hero'
import { Features, Testimonials, FAQ } from './Marketing'
import { Comparison } from './Comparison'

export function OutScreen() {
  return (
    <main className="flex-1 overflow-x-hidden bg-white">
      <Hero />
      <Features />
      <Comparison />
      <Testimonials />
      <FAQ />
    </main>
  )
}
