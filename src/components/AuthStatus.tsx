'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { signOut } from '@/lib/firebase/auth'

export default function AuthStatus() {
  const { user, profile, loading } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (loading) return <div className="w-9 h-9 rounded-full bg-white/8 animate-pulse" />

  if (user) {
    const name = profile?.displayName || user.displayName || user.email || '?'
    const initial = name.charAt(0).toUpperCase()

    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-9 h-9 rounded-full bg-periwinkle hover:bg-periwinkle-light transition-colors flex items-center justify-center text-white text-sm font-medium"
        >
          {initial}
        </button>

        {open && (
          <div className="absolute right-0 top-11 w-48 bg-mesa-light border border-periwinkle/20 rounded-xl shadow-lg py-1 z-50">
            <div className="px-4 py-2 border-b border-periwinkle/10">
              <p className="text-xs text-sand/40 truncate">{name}</p>
            </div>
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-sand/70 hover:text-white hover:bg-periwinkle/10 transition-colors"
            >
              your signal
            </Link>
            {(profile?.role === 'admin' || profile?.role === 'mod') && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm text-sand/70 hover:text-white hover:bg-periwinkle/10 transition-colors"
              >
                dispatch admin
              </Link>
            )}
            <div className="border-t border-periwinkle/10 mt-1">
              <button
                onClick={() => { signOut(); setOpen(false) }}
                className="block w-full text-left px-4 py-2.5 text-sm text-sand/50 hover:text-white hover:bg-periwinkle/10 transition-colors"
              >
                sign out
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href="/auth"
      className="bg-periwinkle hover:bg-periwinkle-light text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
    >
      sign in
    </Link>
  )
}
