'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { createUserProfile } from '@/lib/firebase/users'
import { HorizontalLockup, SpiralIcon } from '@/components/SpiralIcon'
import { CANONICAL_TAGS } from '@/lib/constants/tags'

export default function RegisterPage() {
  const router = useRouter()
  const { user, profile, loading, profileLoading } = useAuth()

  const [step, setStep] = useState<1 | 2>(1)
  const [displayName, setDisplayName] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) { router.replace('/auth'); return }
    if (!profileLoading && profile) { router.replace('/'); return }
    if (user && !displayName) setDisplayName(user.displayName || '')
  }, [user, profile, loading, profileLoading, router, displayName])

  function toggleInterest(tag: string) {
    setInterests(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !displayName.trim()) return
    setError('')
    setSaving(true)
    try {
      await createUserProfile(user.uid, {
        displayName: displayName.trim(),
        email: user.email,
        photoURL: user.photoURL,
        interests,
      })
      router.push('/')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'something went wrong')
      setSaving(false)
    }
  }

  if (loading || profileLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-periwinkle border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen text-white flex flex-col">
      <nav className="border-b border-periwinkle/20 px-6 py-3 flex items-center justify-between">
        <Link href="/"><HorizontalLockup height={72} /></Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">

          <div className="flex justify-center mb-8">
            <SpiralIcon size={56} />
          </div>

          {/* step indicators */}
          <div className="flex justify-center gap-2 mb-10">
            {[1, 2].map(n => (
              <div
                key={n}
                className={`h-1 rounded-full transition-all duration-300 ${
                  n === step ? 'w-8 bg-periwinkle' : n < step ? 'w-4 bg-periwinkle/50' : 'w-4 bg-white/10'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="bg-red-rock/15 border border-red-rock/35 rounded-xl px-4 py-3 text-sm text-red-rock-light mb-6">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div className="text-center">
                <h1 className="text-3xl font-medium text-periwinkle-light mb-2">welcome.</h1>
                <p className="text-sand/50 text-sm leading-relaxed">
                  you found your way here for a reason.<br />let's start with your name.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-sand/50 tracking-widest">what should we call you?</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="your name or handle"
                  autoFocus
                  className="w-full bg-mesa-light border border-periwinkle/20 rounded-xl px-4 py-3 text-white placeholder:text-sand/25 text-sm outline-none focus:border-periwinkle/50 transition-colors"
                />
              </div>

              <button
                onClick={() => { if (displayName.trim()) setStep(2) }}
                disabled={!displayName.trim()}
                className="w-full bg-periwinkle hover:bg-periwinkle-light text-white font-medium py-3 rounded-xl transition-colors text-sm disabled:opacity-40"
              >
                continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="text-center">
                <h1 className="text-3xl font-medium text-periwinkle-light mb-2">tune your signal.</h1>
                <p className="text-sand/50 text-sm leading-relaxed">
                  pick what moves you. your feed will reflect it.<br />
                  <span className="text-sand/35">you can always change this later.</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {CANONICAL_TAGS.map(tag => {
                  const active = interests.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleInterest(tag)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                        active
                          ? 'bg-periwinkle/25 border-periwinkle/60 text-periwinkle-light'
                          : 'bg-mesa-light border-periwinkle/20 text-sand/50 hover:border-periwinkle/35 hover:text-sand/70'
                      }`}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-periwinkle hover:bg-periwinkle-light text-white font-medium py-3 rounded-xl transition-colors text-sm disabled:opacity-50"
                >
                  {saving ? 'entering the signal…' : 'enter the signal →'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-sand/30 hover:text-sand/60 transition-colors text-center py-1"
                >
                  ← back
                </button>
              </div>
            </form>
          )}

          <p className="text-xs text-sand/20 text-center mt-8">
            <span className="text-desert-sky/50">clear the signal.</span>{' '}
            <span className="text-red-rock/50">find your frequency.</span>
          </p>

        </div>
      </div>
    </main>
  )
}
