"use client"

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Activity } from 'lucide-react'

export default function LoginPage() {
  const { signInEmail, signInGoogle, error } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signInEmail(email, password)
      router.push('/')
    } catch (e) {
      // error is handled by useAuth
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await signInGoogle()
      router.push('/')
    } catch (e) {
      // error is handled by useAuth
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col p-6 bg-[var(--bg-page)] text-[var(--text-primary)]">
      
      {/* Back Button */}
      <div className="mb-12">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft size={16} />
          Retour
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm">
          
          <div className="mb-8 text-center flex flex-col items-center">
            <div className="w-10 h-10 rounded flex items-center justify-center bg-[var(--accent)] text-white mb-4">
              <Activity size={24} />
            </div>
            <h1 className="text-2xl font-bold">
              Se connecter
            </h1>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-page)] border border-[var(--border-default)] rounded-md focus:border-[var(--accent)] outline-none transition-colors text-sm placeholder:text-[var(--text-disabled)]"
                placeholder="nom@email.com"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-page)] border border-[var(--border-default)] rounded-md focus:border-[var(--accent)] outline-none transition-colors text-sm placeholder:text-[var(--text-disabled)]"
                placeholder="Votre mot de passe"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-[var(--danger-bg)] border border-transparent rounded-md text-[var(--danger)] text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--accent)] text-white font-medium py-2 rounded-md hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Connexion...' : 'Continuer avec l\'email'}
            </button>
          </form>

          <div className="mt-6 relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border-default)]"></div></div>
            <span className="relative px-3 bg-[var(--bg-page)] text-xs font-medium text-[var(--text-disabled)]">OU</span>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-[var(--bg-page)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] font-medium py-2 rounded-md transition-colors text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuer avec Google
          </button>

          <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
            Pas encore de compte ?{' '}
            <Link href="/signup" className="text-[var(--accent)] hover:underline">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
