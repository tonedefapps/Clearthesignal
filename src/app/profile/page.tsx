'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { updateUserProfile } from '@/lib/firebase/users'
import { HorizontalLockup, SpiralIcon } from '@/components/SpiralIcon'
import AuthStatus from '@/components/AuthStatus'
import { CANONICAL_TAGS } from '@/lib/constants/tags'
import Footer from '@/components/Footer'

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, loading, profileLoading } = useAuth()

  const [displayName, setDisplayName] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth')
      return
    }
    if (!profileLoading && profile) {
      setDisplayName(profile.displayName || '')
      setInterests(profile.interests || [])
    }
  }, [user, profile, loading, profileLoading, router])

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
    setSaved(false)
    try {
      await updateUserProfile(user.uid, {
        displayName: displayName.trim(),
        interests,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'something went wrong')
    } finally {
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
    <main className="min-h-screen text-white">

      <nav className="border-b border-periwinkle/20 px-6 py-3 flex items-center justify-between backdrop-blur-sm bg-mesa/80 sticky top-0 z-10">
        <Link href="/">
          <HorizontalLockup height={72} />
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg text-sand/50 hover:text-desert-sky transition-colors hidden sm:block">
            feed
          </Link>
          <Link href="/about" className="text-lg text-sand/50 hover:text-desert-sky transition-colors hidden sm:block">
            about
          </Link>
          <AuthStatus />
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16">

        <div className="flex justify-center mb-8">
          <SpiralIcon size={48} />
        </div>

        <h1 className="text-3xl font-medium text-periwinkle-light text-center mb-1">
          your signal
        </h1>
        <p className="text-sm text-sand/50 text-center mb-10 tracking-wide">
          tune your feed to what matters to you
        </p>

        {error && (
          <div className="bg-red-rock/15 border border-red-rock/35 rounded-xl px-4 py-3 text-sm text-red-rock-light mb-6">
            {error}
          </div>
        )}

        {saved && (
          <div className="bg-periwinkle/15 border border-periwinkle/35 rounded-xl px-4 py-3 text-sm text-periwinkle-light mb-6 text-center">
            signal updated.
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">

          <div className="flex flex-col gap-2">
            <label className="text-xs text-sand/60 tracking-widest">
              display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
              className="w-full bg-mesa-light border border-periwinkle/20 rounded-xl px-4 py-3 text-white placeholder:text-sand/30 text-sm outline-none focus:border-periwinkle/50 transition-colors"
            />
            {user?.email && (
              <p className="text-xs text-sand/30 mt-1">{user.email}</p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-xs text-sand/60 tracking-widest">
              your interests
              <span className="text-sand/35 ml-2 normal-case">shapes your personal feed</span>
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

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving || !displayName.trim()}
              className="flex-1 bg-periwinkle hover:bg-periwinkle-light text-white font-medium py-3 rounded-xl transition-colors text-sm disabled:opacity-50"
            >
              {saving ? 'saving…' : 'save signal'}
            </button>
            <Link
              href="/"
              className="px-6 py-3 rounded-xl border border-periwinkle/20 text-sand/50 hover:text-sand/80 hover:border-periwinkle/40 transition-colors text-sm text-center"
            >
              back to feed
            </Link>
          </div>

        </form>
      </div>

      <Footer />
    </main>
  )
}
