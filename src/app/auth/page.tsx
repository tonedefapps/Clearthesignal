'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { HorizontalLockup } from '@/components/SpiralIcon'
import { getUserProfile } from '@/lib/firebase/users'
import {
  signInWithGoogle,
  signInWithApple,
  signInWithEmail,
  signUpWithEmail,
  sendMagicLink,
} from '@/lib/firebase/auth'
import type { UserCredential } from 'firebase/auth'

type Mode = 'choose' | 'email-password' | 'magic-link'

async function routeAfterAuth(credential: UserCredential, router: ReturnType<typeof useRouter>) {
  const profile = await getUserProfile(credential.user.uid)
  router.push(profile ? '/' : '/register')
}

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('choose')
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)

  async function handle(fn: () => Promise<UserCredential>) {
    setError('')
    setLoading(true)
    try {
      const credential = await fn()
      await routeAfterAuth(credential, router)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleMagicLink() {
    setError('')
    setLoading(true)
    try {
      await sendMagicLink(email)
      setMagicSent(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-mesa text-white flex flex-col">
      <nav className="border-b border-periwinkle/20 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <HorizontalLockup height={36} />
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">

          {mode === 'choose' && (
            <>
              <h1 className="text-3xl font-medium text-periwinkle-light mb-1 text-center">
                find your frequency
              </h1>
              <p className="text-sm text-sand/50 text-center mb-8 tracking-wide">
                sign in to join the community
              </p>
            </>
          )}

          {mode !== 'choose' && (
            <>
              <h1 className="text-3xl font-medium text-periwinkle-light mb-1 text-center">
                {isSignUp ? 'create account' : 'welcome back'}
              </h1>
              <p className="text-sm text-sand/50 text-center mb-8 tracking-wide">via email</p>
            </>
          )}

          {error && (
            <div className="bg-redrock/15 border border-redrock/35 rounded-xl px-4 py-3 text-sm text-redrock-light mb-6">
              {error}
            </div>
          )}

          {mode === 'choose' && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handle(signInWithGoogle)}
                disabled={loading}
                className="flex items-center justify-center gap-3 w-full bg-mesa-light border border-periwinkle/20 hover:border-periwinkle/40 text-white font-medium py-3 rounded-xl transition-colors text-sm disabled:opacity-50"
              >
                <GoogleIcon />
                continue with google
              </button>

              <button
                onClick={() => handle(signInWithApple)}
                disabled={loading}
                className="flex items-center justify-center gap-3 w-full bg-mesa-light border border-periwinkle/20 hover:border-periwinkle/40 text-white font-medium py-3 rounded-xl transition-colors text-sm disabled:opacity-50"
              >
                <AppleIcon />
                continue with apple
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 border-t border-periwinkle/15" />
                <span className="text-sand/30 text-xs">or</span>
                <div className="flex-1 border-t border-periwinkle/15" />
              </div>

              <button
                onClick={() => setMode('magic-link')}
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full bg-periwinkle/10 border border-periwinkle/25 hover:bg-periwinkle/20 text-periwinkle-light font-medium py-3 rounded-xl transition-colors text-sm"
              >
                ✉ magic link (passwordless)
              </button>

              <button
                onClick={() => setMode('email-password')}
                disabled={loading}
                className="text-sm text-sand/35 hover:text-sand/60 transition-colors text-center py-1"
              >
                use email + password instead
              </button>
            </div>
          )}

          {mode === 'magic-link' && (
            <div className="flex flex-col gap-4">
              {magicSent ? (
                <div className="text-center py-6">
                  <p className="text-periwinkle-light text-lg font-medium mb-2">check your inbox</p>
                  <p className="text-sand/50 text-sm">
                    we sent a sign-in link to{' '}
                    <strong className="text-desert-sky">{email}</strong>. click it to sign in — no password needed.
                  </p>
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-mesa-light border border-periwinkle/20 rounded-xl px-4 py-3 text-white placeholder:text-sand/30 text-sm outline-none focus:border-periwinkle/50"
                  />
                  <button
                    onClick={handleMagicLink}
                    disabled={loading || !email}
                    className="w-full bg-periwinkle hover:bg-periwinkle-light text-white font-medium py-3 rounded-xl transition-colors text-sm disabled:opacity-50"
                  >
                    {loading ? 'sending…' : 'send magic link'}
                  </button>
                </>
              )}
              <button
                onClick={() => { setMode('choose'); setMagicSent(false) }}
                className="text-sm text-sand/35 hover:text-sand/60 text-center"
              >
                ← back
              </button>
            </div>
          )}

          {mode === 'email-password' && (
            <div className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-mesa-light border border-periwinkle/20 rounded-xl px-4 py-3 text-white placeholder:text-sand/30 text-sm outline-none focus:border-periwinkle/50"
              />
              <input
                type="password"
                placeholder="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-mesa-light border border-periwinkle/20 rounded-xl px-4 py-3 text-white placeholder:text-sand/30 text-sm outline-none focus:border-periwinkle/50"
              />
              <button
                onClick={() => handle(() =>
                  isSignUp
                    ? signUpWithEmail(email, password)
                    : signInWithEmail(email, password)
                )}
                disabled={loading || !email || !password}
                className="w-full bg-periwinkle hover:bg-periwinkle-light text-white font-medium py-3 rounded-xl transition-colors text-sm disabled:opacity-50"
              >
                {loading ? '…' : isSignUp ? 'create account' : 'sign in'}
              </button>
              <button
                onClick={() => setIsSignUp(v => !v)}
                className="text-sm text-sand/35 hover:text-sand/60 text-center"
              >
                {isSignUp ? 'already have an account? sign in' : "don't have an account? sign up"}
              </button>
              <button
                onClick={() => setMode('choose')}
                className="text-sm text-sand/35 hover:text-sand/60 text-center"
              >
                ← back
              </button>
            </div>
          )}

        </div>
      </div>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.06.04c-.22.14-3.22 1.87-3.19 5.59.03 4.43 3.89 5.9 3.91 5.91zm-3.8-17.81c.73-.88 1.94-1.55 2.94-1.69.16 1.19-.35 2.38-1.06 3.23-.72.88-1.87 1.56-2.98 1.47-.18-1.15.36-2.33 1.1-3.01z"/>
    </svg>
  )
}
