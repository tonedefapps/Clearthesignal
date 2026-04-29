'use client'

import { useState, useEffect } from 'react'
import Footer from '@/components/Footer'
import SiteNav from '@/components/SiteNav'
import SignalCard from '@/components/SignalCard'
import { getSignalPosts, type SignalPost } from '@/lib/firebase/signal'
import { CANONICAL_TAGS } from '@/lib/constants/tags'
import { clsx } from 'clsx'

const PAGE_SIZE = 10

export default function SignalPage() {
  const [allPosts, setAllPosts] = useState<SignalPost[]>([])
  const [activeTag, setActiveTag] = useState('')
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getSignalPosts(activeTag || undefined, 100)
      .then(setAllPosts)
      .catch(() => setAllPosts([]))
      .finally(() => setLoading(false))
  }, [activeTag])

  // reset to first page on tag change
  useEffect(() => { setPage(0) }, [activeTag])

  const totalPages = Math.ceil(allPosts.length / PAGE_SIZE)
  const pagePosts = allPosts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function handleTag(tag: string) {
    setActiveTag(tag)
    setPage(0)
  }

  return (
    <main className="min-h-screen text-white">

      <SiteNav />

      <section className="px-6 pt-16 pb-10 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 text-xs text-periwinkle-light bg-periwinkle/10 border border-periwinkle/25 rounded-full px-3 py-1 mb-8">
          <span className="w-1.5 h-1.5 bg-desert-sky rounded-full" />
          editor-curated · updated as signal breaks
        </div>
        <h1 className="text-4xl font-medium text-desert-sky mb-3 tracking-tight">the dispatch</h1>
        <p className="text-white/50 text-base max-w-lg mx-auto leading-relaxed font-light">
          links, articles, and breaking signal. hand-picked and annotated by the team.
        </p>
      </section>

      <section className="pb-24 max-w-7xl mx-auto px-6">

        {/* tag filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8" style={{ scrollbarWidth: 'none' }}>
          {[{ value: '', label: 'all' }, ...CANONICAL_TAGS.map(t => ({ value: t, label: t }))].map(tag => (
            <button
              key={tag.value}
              onClick={() => handleTag(tag.value)}
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

        {/* posts */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[200px] bg-mesa-light/70 border border-periwinkle/15 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : pagePosts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-periwinkle/40 text-lg font-light">no dispatch posts yet</p>
            <p className="text-sand/25 text-sm mt-2">check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagePosts.map(post => (
              <div key={post.id} className="w-full">
                <SignalCard post={post} />
              </div>
            ))}
          </div>
        )}

        {/* pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-periwinkle/10">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-2 text-sm text-sand/50 hover:text-sand/80 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            >
              ← previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={clsx(
                    'w-7 h-7 rounded-full text-xs transition-all',
                    i === page
                      ? 'bg-periwinkle text-white'
                      : 'text-sand/40 hover:text-sand/70'
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="flex items-center gap-2 text-sm text-sand/50 hover:text-sand/80 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            >
              next →
            </button>
          </div>
        )}

      </section>

      <Footer />
    </main>
  )
}
