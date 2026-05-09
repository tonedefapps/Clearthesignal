'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { signOut } from '@/lib/firebase/auth'
import { SpiralIcon } from './SpiralIcon'
import AuthStatus from './AuthStatus'

interface SiteNavProps {
  extra?: React.ReactNode
}

export default function SiteNav({ extra }: SiteNavProps) {
  const pathname = usePathname()
  const { user, profile, loading } = useAuth()
  const [open, setOpen] = useState(false)
  const isAdmin = profile?.role === 'admin' || profile?.role === 'mod'
  const displayName = profile?.displayName || user?.displayName || user?.email || ''

  const link = (href: string, label: string) => {
    const active = pathname === href
    return (
      <Link
        href={href}
        className={`text-sm transition-colors ${active ? 'text-periwinkle-light' : 'text-sand/50 hover:text-desert-sky'}`}
      >
        {label}
      </Link>
    )
  }

  return (
    <nav className="border-b border-periwinkle/20 px-4 sm:px-6 py-3 backdrop-blur-sm bg-mesa/80 sticky top-0 z-20">
      <div className="flex items-center justify-between">

        {/* logo */}
        <Link href="/" className="flex items-center gap-3">
          <SpiralIcon size={36} className="sm:hidden" />
          <span className="hidden sm:flex items-center gap-3">
            <SpiralIcon size={40} />
            <span className="flex flex-col leading-none gap-0.5">
              <span className="text-[10px] font-light tracking-[0.35em] text-periwinkle-light/75">clear the</span>
              <span className="text-lg font-normal tracking-[0.15em] text-desert-sky">signal</span>
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          {/* desktop links + auth */}
          <span className="hidden sm:flex items-center gap-5">
            {link('/signal', 'dispatch')}
            {link('/about', 'about')}
            <a
              href="https://discord.gg/placeholder"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-sand/50 hover:text-sand transition-colors"
            >
              community
            </a>
            {isAdmin && (
              <Link
                href="/admin"
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  pathname === '/admin'
                    ? 'bg-periwinkle/25 border-periwinkle/50 text-periwinkle-light'
                    : 'bg-periwinkle/10 border-periwinkle/30 text-periwinkle/70 hover:bg-periwinkle/20 hover:text-periwinkle-light'
                }`}
              >
                {profile?.role}
              </Link>
            )}
            {extra}
            <AuthStatus />
          </span>

          {/* hamburger (mobile only) — dot appears when signed in */}
          <button
            onClick={() => setOpen(o => !o)}
            className="sm:hidden relative w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-periwinkle/10 transition-colors"
            aria-label="menu"
          >
            <span className={`block w-5 h-px bg-sand/60 transition-transform duration-200 ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block w-5 h-px bg-sand/60 transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-px bg-sand/60 transition-transform duration-200 ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
            {!loading && user && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-periwinkle border-2 border-mesa pointer-events-none" />
            )}
          </button>
        </div>
      </div>

      {/* mobile dropdown */}
      {open && (
        <div className="sm:hidden border-t border-periwinkle/10 mt-3 pt-3 pb-2 flex flex-col gap-1">
          <Link href="/signal" onClick={() => setOpen(false)}
            className="px-2 py-2.5 text-sm text-sand/60 hover:text-desert-sky transition-colors rounded-lg hover:bg-periwinkle/5">
            dispatch
          </Link>
          <Link href="/about" onClick={() => setOpen(false)}
            className="px-2 py-2.5 text-sm text-sand/60 hover:text-desert-sky transition-colors rounded-lg hover:bg-periwinkle/5">
            about
          </Link>
          <a href="https://discord.gg/placeholder" target="_blank" rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="px-2 py-2.5 text-sm text-sand/60 hover:text-sand transition-colors rounded-lg hover:bg-periwinkle/5">
            community
          </a>
          {isAdmin && (
            <Link href="/admin" onClick={() => setOpen(false)}
              className="px-2 py-2.5 text-sm text-periwinkle/70 hover:text-periwinkle-light transition-colors rounded-lg hover:bg-periwinkle/5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-periwinkle/60" />
              admin panel
            </Link>
          )}

          {/* auth section */}
          <div className="border-t border-periwinkle/10 mt-2 pt-2">
            {!loading && user ? (
              <>
                {displayName && (
                  <p className="px-3 py-1.5 text-xs text-sand/30 truncate">{displayName}</p>
                )}
                <Link href="/profile" onClick={() => setOpen(false)}
                  className="block px-2 py-2.5 text-sm text-sand/60 hover:text-desert-sky transition-colors rounded-lg hover:bg-periwinkle/5">
                  your signal
                </Link>
                <button
                  onClick={() => { signOut(); setOpen(false) }}
                  className="w-full text-left px-2 py-2.5 text-sm text-sand/40 hover:text-white transition-colors rounded-lg hover:bg-periwinkle/5"
                >
                  sign out
                </button>
              </>
            ) : !loading && (
              <Link href="/auth" onClick={() => setOpen(false)}
                className="block px-2 py-2.5 text-sm text-periwinkle-light hover:text-desert-sky transition-colors rounded-lg hover:bg-periwinkle/5">
                sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
