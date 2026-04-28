'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getSignalPosts, type SignalPost } from '@/lib/firebase/signal'

export default function SignalStrip() {
  const [posts, setPosts] = useState<SignalPost[]>([])

  useEffect(() => {
    getSignalPosts(undefined, 3).then(setPosts).catch(() => setPosts([]))
  }, [])

  if (posts.length === 0) return null

  return (
    <section className="px-6 pb-12 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm text-sand/40 tracking-widest">the dispatch</h2>
        <Link href="/signal" className="text-xs text-desert-sky/50 hover:text-desert-sky transition-colors">
          all posts →
        </Link>
      </div>

      <div className="flex flex-col divide-y divide-periwinkle/10">
        {posts.map(post => {
          const date = post.publishedAt
            ? new Date((post.publishedAt as { seconds: number }).seconds * 1000).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric',
              })
            : ''

          return (
            <div key={post.id} className="py-5 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-desert-sky/70 tracking-wide">{post.source}</span>
                <span className="text-xs text-sand/25">{date}</span>
                {post.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-periwinkle/10 border border-periwinkle/20 text-periwinkle-light/60">
                    {tag}
                  </span>
                ))}
              </div>

              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-medium text-white/90 hover:text-desert-sky transition-colors leading-snug"
              >
                {post.headline}
              </a>

              {post.note && (
                <p className="text-sm text-sand/50 leading-relaxed">{post.note}</p>
              )}

              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-desert-sky/50 hover:text-desert-sky transition-colors self-start"
              >
                read →
              </a>
            </div>
          )
        })}
      </div>
    </section>
  )
}
