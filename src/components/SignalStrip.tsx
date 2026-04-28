'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getSignalPosts, type SignalPost } from '@/lib/firebase/signal'
import SignalCard from './SignalCard'

export default function SignalStrip() {
  const [posts, setPosts] = useState<SignalPost[]>([])

  useEffect(() => {
    getSignalPosts(undefined, 3).then(setPosts).catch(() => setPosts([]))
  }, [])

  if (posts.length === 0) return null

  return (
    <section className="pb-10">
      <div className="px-6 mb-4 max-w-7xl mx-auto flex items-center justify-between">
        <h2 className="text-sm text-sand/40 tracking-widest">the dispatch</h2>
        <Link href="/signal" className="text-xs text-desert-sky/50 hover:text-desert-sky transition-colors">
          all posts →
        </Link>
      </div>
      <div
        className="flex gap-4 overflow-x-auto px-6 pb-2"
        style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}
      >
        {posts.map(post => (
          <SignalCard key={post.id} post={post} />
        ))}
        <div className="w-2 shrink-0" />
      </div>
    </section>
  )
}
