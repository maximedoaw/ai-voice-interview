// 🎣 HOOK : useAuth.ts
"use client" // Obligatoire car Firebase Auth interagit avec le navigateur

import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  User 
} from 'firebase/auth'

function getFriendlyErrorMessage(message: string) {
  if (message.includes('invalid-credential') || message.includes('wrong-password') || message.includes('user-not-found')) {
    return 'Identifiants incorrects.'
  }
  if (message.includes('email-already-in-use')) {
    return 'Cet email est déjà lié à un compte.'
  }
  if (message.includes('weak-password')) {
    return 'Le mot de passe doit faire au moins 6 caractères.'
  }
  if (message.includes('invalid-email')) {
    return 'Format d\'email invalide.'
  }
  if (message.includes('popup-closed-by-user')) {
    return 'La fenêtre de connexion Google a été fermée.'
  }
  return 'Une erreur inattendue est survenue.'
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setIsLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const signInEmail = async (email: string, pass: string) => {
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, pass)
    } catch (e: any) {
      setError(getFriendlyErrorMessage(e.message))
      throw e
    }
  }

  const signUpEmail = async (email: string, pass: string) => {
    setError(null)
    try {
      await createUserWithEmailAndPassword(auth, email, pass)
    } catch (e: any) {
      setError(getFriendlyErrorMessage(e.message))
      throw e
    }
  }

  const signInGoogle = async () => {
    setError(null)
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (e: any) {
      setError(getFriendlyErrorMessage(e.message))
      throw e
    }
  }

  const signOut = async () => {
    setError(null)
    await firebaseSignOut(auth)
  }

  return { user, isLoading, error, signInEmail, signUpEmail, signInGoogle, signOut }
}
