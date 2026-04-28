'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { completeMagicLinkSignIn } from '@/lib/firebase/auth'
import { getUserProfile } from '@/lib/firebase/users'
import Link from 'next/link'
import { HorizontalLockup } from '@/components/SpiralIcon'

export default function VerifyPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'need-email'>('verifying')
  const [error, setError] = useState('')
  const [manualEmail, setManualEmail] = useState('')

  useEffect(() => {
    async function verify() {
      try {
        const result = await completeMagicLinkSignIn(window.location.href)
        if (result) {
          setStatus('success')
          const profile = await getUserProfile(result.user.uid)
          setTimeout(() => router.push(profile ? '/' : '/register'), 1200)
        } else {
          setStatus('error')
          setError('this link is not a valid sign-in link.')
        }
      } catch (e: unknown) {
        if (e instanceof Error && e.message === 'EMAIL_NOT_FOUND') {
          setStatus('need-email')
        } else {
          setStatus('error')
          setError(e instanceof Error ? e.message : 'something went wrong')
        }
      }
    }
    verify()
  }, [router])

  async function handleManualEmail() {
    try {
      window.localStorage.setItem('emailForSignIn', manualEmail)
      const result = await completeMagicLinkSignIn(window.location.href)
      if (result) {
        setStatus('success')
        const profile = await getUserProfile(result.user.uid)
        setTimeout(() => router.push(profile ? '/' : '/register'), 1200)
      }
    } catch (e: unknown) {
      setStatus('error')
      setError(e instanceof Error ? e.message : 'something went wrong')
    }
  }

  return (
    <main className="min-h-screen bg-mesa text-white flex flex-col">
      <nav className="border-b border-periwinkle/20 px-6 py-4">
        <Link href="/" className="w-fit flex items-center">
          <HorizontalLockup height={36} />
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">

          {status === 'verifying' && (
            <>
              <div className="w-8 h-8 border-2 border-periwinkle border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sand/50 text-sm">verifying your link…</p>
            </>
          )}

          {status === 'success' && (
            <>
              <p className="text-periwinkle-light text-2xl font-medium mb-2">you're in.</p>
              <p className="text-sand/40 text-sm">redirecting…</p>
            </>
          )}

          {status === 'error' && (
            <>
              <p className="text-redrock-light text-lg font-medium mb-2">link invalid or expired</p>
              <p className="text-sand/40 text-sm mb-6">{error}</p>
              <Link href="/auth" className="text-desert-sky hover:text-periwinkle-light text-sm transition-colors">
                back to sign in →
              </Link>
            </>
          )}

          {status === 'need-email' && (
            <>
              <p className="text-white font-medium mb-2">confirm your email</p>
              <p className="text-sand/40 text-sm mb-6">
                we need your email to complete sign-in.
              </p>
              <input
                type="email"
                placeholder="your@email.com"
                value={manualEmail}
                onChange={e => setManualEmail(e.target.value)}
                className="w-full bg-mesa-light border border-periwinkle/20 rounded-xl px-4 py-3 text-white placeholder:text-sand/30 text-sm outline-none focus:border-periwinkle/50 mb-3"
              />
              <button
                onClick={handleManualEmail}
                disabled={!manualEmail}
                className="w-full bg-periwinkle hover:bg-periwinkle-light text-white font-medium py-3 rounded-xl transition-colors text-sm disabled:opacity-50"
              >
                confirm
              </button>
            </>
          )}

        </div>
      </div>
    </main>
  )
}
