'use client'

import { useState, useEffect, useCallback } from 'react'
import VideoCard from '@/components/VideoCard'
import TagFilter from '@/components/TagFilter'
import { Radio, ArrowDown } from 'lucide-react'

interface Video {
  id: string
  title: string
  channelName: string
  thumbnailUrl: string
  youtubeUrl: string
  scores: { overall: number }
  scoreRationale: string
  tags: string[]
  publishedAt: string
}

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [activeTag, setActiveTag] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchVideos = useCallback(async (tag: string) => {
    setLoading(true)
    try {
      const url = tag ? `/api/videos?tag=${tag}` : '/api/videos'
      const res = await fetch(url)
      const data = await res.json()
      setVideos(Array.isArray(data) ? data : [])
    } catch {
      setVideos([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVideos(activeTag)
  }, [activeTag, fetchVideos])

  return (
    <main className="min-h-screen bg-[#0d0d1a] text-white">
      {/* Nav */}
      <nav className="border-b border-white/8 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Radio size={20} className="text-sky-400" />
          <span className="font-bold text-white tracking-tight">Clear the Signal</span>
        </div>
        <a
          href="https://discord.gg/placeholder"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          community →
        </a>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 text-xs text-sky-400/80 bg-sky-500/10 border border-sky-500/20 rounded-full px-3 py-1 mb-6">
          <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-pulse" />
          AI-curated · updated daily
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4 leading-tight">
          Clear the Signal.
          <br />
          <span className="text-sky-400">Find your frequency.</span>
        </h1>
        <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
          We surface the signal. Consciousness, awareness, synchronicity, disclosure — filtered for substance, credibility, and tone. No noise. No fear. No agenda.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <a
            href="#feed"
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Explore the feed <ArrowDown size={15} />
          </a>
          <a
            href="https://discord.gg/placeholder"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/50 hover:text-white/80 border border-white/15 px-6 py-3 rounded-xl transition-colors"
          >
            Join the community
          </a>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              step: '01',
              title: 'We watch the noise',
              body: 'Hundreds of videos published daily across consciousness, UAP, energy, and awareness channels.',
            },
            {
              step: '02',
              title: 'AI scores the signal',
              body: 'Each video is scored across novelty, credibility, tone, signal density, and timing relevance.',
            },
            {
              step: '03',
              title: 'You get the frequency',
              body: 'Only content that passes our threshold reaches the feed. No doom, no fringe, no filler.',
            },
          ].map(item => (
            <div key={item.step} className="bg-white/4 border border-white/8 rounded-2xl p-6">
              <p className="text-sky-500/60 text-xs font-bold tracking-widest mb-2">{item.step}</p>
              <h3 className="text-white font-semibold mb-2">{item.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feed */}
      <section id="feed" className="px-6 pb-24 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-xl font-bold text-white">Curated feed</h2>
          <TagFilter active={activeTag} onChange={setActiveTag} />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-white/8" />
                <div className="p-4 flex flex-col gap-3">
                  <div className="h-4 bg-white/8 rounded w-3/4" />
                  <div className="h-3 bg-white/8 rounded w-1/2" />
                  <div className="h-3 bg-white/8 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-24 text-white/30">
            <Radio size={32} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No signal yet</p>
            <p className="text-sm mt-1">The pipeline runs daily — check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map(video => (
              <VideoCard key={video.id} {...video} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 px-6 py-8 text-center">
        <p className="text-white/30 text-sm">
          Clear the Signal · curated by AI · no cloud, no agenda, no noise
        </p>
      </footer>
    </main>
  )
}
