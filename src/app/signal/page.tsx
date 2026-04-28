'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { HorizontalLockup } from '@/components/SpiralIcon'
import AuthStatus from '@/components/AuthStatus'
import Footer from '@/components/Footer'
import SignalCard from '@/components/SignalCard'
import { getSignalPosts, type SignalPost } from '@/lib/firebase/signal'
import { CANONICAL_TAGS } from '@/lib/constants/tags'
import { clsx } from 'clsx'

export default function SignalPage() {
  const [posts, setPosts] = useState<SignalPost[]>([])
  const [activeTag, setActiveTag] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getSignalPosts(activeTag || undefined, 50)
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [activeTag])

  return (
    <main className="min-h-screen text-white">

      <nav className="border-b border-periwinkle/20 px-6 py-3 flex items-center justify-between backdrop-blur-sm bg-mesa/80 sticky top-0 z-10">
        <Link href="/"><HorizontalLockup height={72} /></Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg text-sand/50 hover:text-desert-sky transition-colors hidden sm:block">feed</Link>
          <Link href="/about" className="text-lg text-sand/50 hover:text-desert-sky transition-colors hidden sm:block">about</Link>
          <AuthStatus />
        </div>
      </nav>

      <section className="px-6 pt-16 pb-10 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 text-xs text-periwinkle-light bg-periwinkle/10 border border-periwinkle/25 rounded-full px-3 py-1 mb-8">
          <span className="w-1.5 h-1.5 bg-desert-sky rounded-full" />
          editor-curated · updated as signal breaks
        </div>
        <h1 className="text-4xl font-medium text-desert-sky mb-3 tracking-tight">the dispatch</h1>
        <p className="text-white/50 text-base max-w-lg mx-auto leading-relaxed font-light">
          links, articles, and breaking signal — hand-picked and annotated by the clear the signal team.
        </p>
      </section>

      <section className="pb-24 max-w-7xl mx-auto px-6">
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8" style={{ scrollbarWidth: 'none' }}>
          {[{ value: '', label: 'all' }, ...CANONICAL_TAGS.map(t => ({ value: t, label: t }))].map(tag => (
            <button
              key={tag.value}
              onClick={() => setActiveTag(tag.value)}
              className={clsx(
                'text-xs px-4 py-1.5 rounded-full border transition-all duration-150 whitespace-nowrap shrink-0 tracking-wide',
                activeTag === tag.value
                  ? 'bg-periwinkle border-periwinkle text-white'
                  : 'bg-mesa-light/80 border-periwinkle/20 text-sand/50 hover:border-periwinkle/45 hover:text-sand/80'
              )}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex gap-4 flex-wrap">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-[300px] h-[200px] bg-mesa-light/70 border border-periwinkle/15 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-periwinkle/40 text-lg font-light">no dispatch posts yet</p>
            <p className="text-sand/25 text-sm mt-2">check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map(post => (
              <div key={post.id} className="w-full">
                <SignalCard post={post} />
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}
