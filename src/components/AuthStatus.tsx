'use client'

import { useAuth } from '@/context/AuthContext'
import { signOut } from '@/lib/firebase/auth'
import Link from 'next/link'

export default function AuthStatus() {
  const { user, profile, loading } = useAuth()

  if (loading) return <div className="w-20 h-7 bg-white/8 rounded-lg animate-pulse" />

  if (user) {
    const name = profile?.displayName || user.displayName || user.email
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="text-lg text-sand/50 hover:text-desert-sky transition-colors hidden sm:block truncate max-w-[140px]"
        >
          {name}
        </Link>
        <button
          onClick={() => signOut()}
          className="text-lg text-sand/40 hover:text-sand/70 transition-colors"
        >
          sign out
        </button>
      </div>
    )
  }

  return (
    <Link
      href="/auth"
      className="text-lg text-sand/50 hover:text-desert-sky transition-colors"
    >
      sign in
    </Link>
  )
}
