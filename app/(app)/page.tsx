"use client"

import { useAuth } from '@/hooks/useAuth'
import { HomeScreen } from '@/components/landing/HomeScreen'
import { OutScreen } from '@/components/landing/OutScreen'

export default function Page() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-800 rounded-full animate-spin"></div>
      </div>
    )
  }

  return user ? <HomeScreen /> : <OutScreen />
}
