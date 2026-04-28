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

  const [displayName, setDisplayName] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth')
      return
    }
    if (!profileLoading && profile) {
      router.replace('/')
      return
    }
    if (user && !displayName) {
      setDisplayName(user.displayName || '')
    }
  }, [user, profile, loading, profileLoading, router, displayName])

  function toggleInterest(tag: string) {
    setInterests(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
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
      <main className="min-h-screen bg-mesa flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-periwinkle border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-mesa text-white flex flex-col">
      <nav className="border-b border-periwinkle/20 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <HorizontalLockup height={36} />
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">

          <div className="flex justify-center mb-6">
            <SpiralIcon size={56} />
          </div>

          <h1 className="text-3xl font-medium text-periwinkle-light text-center mb-1">
            welcome to the signal
          </h1>
          <p className="text-sm text-sand/50 text-center mb-8 tracking-wide">
            tell us a little about yourself
          </p>

          {error && (
            <div className="bg-redrock/15 border border-redrock/35 rounded-xl px-4 py-3 text-sm text-redrock-light mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            <div className="flex flex-col gap-2">
              <label className="text-xs text-sand/60 tracking-widest lowercase">
                display name <span className="text-redrock">*</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="how should we call you?"
                required
                className="w-full bg-mesa-light border border-periwinkle/20 rounded-xl px-4 py-3 text-white placeholder:text-sand/30 text-sm outline-none focus:border-periwinkle/50 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xs text-sand/60 tracking-widest lowercase">
                what are you curious about?
                <span className="text-sand/35 ml-2 normal-case">pick any that resonate</span>
              </label>
              <div className="flex flex-wrap gap-2">
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
            </div>

            <button
              type="submit"
              disabled={saving || !displayName.trim()}
              className="w-full bg-periwinkle hover:bg-periwinkle-light text-white font-medium py-3 rounded-xl transition-colors text-sm disabled:opacity-50 mt-2"
            >
              {saving ? 'setting up your space…' : 'enter the signal'}
            </button>

          </form>

          <p className="text-xs text-sand/25 text-center mt-6">
            <span className="text-desert-sky/60">clear the signal.</span>{' '}
            <span className="text-redrock/60">find your frequency.</span>
          </p>

        </div>
      </div>
    </main>
  )
}
