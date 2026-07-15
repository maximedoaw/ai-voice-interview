"use client"

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { LogOut, User, History, LayoutDashboard } from 'lucide-react'

export function Navbar() {
  const { user, isLoading, signOut } = useAuth()

  return (
    <header className="fixed top-0 w-full z-50 px-6 py-4 pointer-events-none font-sans">
      <div className="container mx-auto max-w-5xl flex items-center justify-between bg-[var(--bg-page)]/90 backdrop-blur-md border border-[var(--border-default)] shadow-xs rounded-lg px-6 h-14 pointer-events-auto">
        <Link href="/" className="font-bold text-base tracking-tight text-[var(--text-primary)] flex items-center gap-1">
          AI INTERVIEW
          <span className="text-[var(--accent)]">.</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
           {!user && (
             <>
               <Link href="/#features" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Fonctionnalités</Link>
               <Link href="/#faq" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">FAQ</Link>
             </>
           )}
           {user && (
             <Link href="/" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2">
                <LayoutDashboard size={16} />
                Tableau de bord
             </Link>
           )}
        </nav>

        <div className="flex items-center gap-4">
          {!isLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-2">
                  <Link href="/history" className="w-8 h-8 rounded flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors" title="Historique">
                    <History size={16} />
                  </Link>
                  <Link href="/profile" className="w-8 h-8 rounded flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors" title="Profil">
                    <User size={16} />
                  </Link>
                  <button 
                    onClick={signOut} 
                    className="ml-2 w-8 h-8 rounded flex items-center justify-center text-[var(--danger)] hover:bg-[var(--danger-bg)] transition-colors"
                    title="Déconnexion"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    Connexion
                  </Link>
                  <Link href="/signup" className="flex items-center justify-center bg-[var(--accent)] text-white px-4 py-2 rounded-md hover:bg-[var(--accent-hover)] transition-colors text-sm font-medium shadow-sm">
                    S'inscrire
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
