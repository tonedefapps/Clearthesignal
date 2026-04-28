'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import VideoCard from '@/components/VideoCard'
import TagFilter from '@/components/TagFilter'
import AuthStatus from '@/components/AuthStatus'
import { useAuth } from '@/context/AuthContext'
import Footer from '@/components/Footer'
import SignalStrip from '@/components/SignalStrip'
import { HorizontalLockup } from '@/components/SpiralIcon'

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
  const { profile } = useAuth()
  const [videos, setVideos] = useState<Video[]>([])
  const [activeTag, setActiveTag] = useState('')
  const [loading, setLoading] = useState(true)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  function handleScroll() {
    const el = carouselRef.current
    if (!el) return
    setAtStart(el.scrollLeft < 16)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 16)
  }

  const fetchVideos = useCallback(async (tag: string, interests?: string[]) => {
    setLoading(true)
    try {
      let url = '/api/videos'
      if (tag === 'my-feed' && interests && interests.length > 0) {
        url = `/api/videos?tags=${interests.join(',')}`
      } else if (tag && tag !== 'my-feed') {
        url = `/api/videos?tag=${tag}`
      }
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
    fetchVideos(activeTag, profile?.interests)
  }, [activeTag, fetchVideos, profile?.interests])

  // reset carousel scroll on tag change
  useEffect(() => {
    carouselRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
  }, [activeTag])

  return (
    <main className="min-h-screen text-white">

      {/* nav */}
      <nav className="border-b border-periwinkle/20 px-6 py-3 flex items-center justify-between backdrop-blur-sm bg-mesa/80 sticky top-0 z-10">
        <HorizontalLockup height={108} />
        <div className="flex items-center gap-6">
          <Link href="/signal" className="text-lg text-sand/50 hover:text-desert-sky transition-colors hidden sm:block">
            dispatch
          </Link>
          <Link href="/about" className="text-lg text-sand/50 hover:text-desert-sky transition-colors hidden sm:block">
            about
          </Link>
          <a
            href="https://discord.gg/placeholder"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg text-sand/50 hover:text-sand transition-colors hidden sm:block"
          >
            community →
          </a>
          <AuthStatus />
        </div>
      </nav>

      {/* hero */}
      <section className="px-6 pt-20 pb-16 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 text-xs text-periwinkle-light bg-periwinkle/10 border border-periwinkle/25 rounded-full px-3 py-1 mb-8">
          <span className="w-1.5 h-1.5 bg-periwinkle rounded-full animate-pulse" />
          ai-curated · updated daily
        </div>
        <h1 className="text-5xl sm:text-6xl font-medium tracking-tight mb-4 leading-tight">
          <span className="text-desert-sky">clear the signal.</span>
          <br />
          <span className="text-red-rock">find your frequency.</span>
        </h1>
        <p className="text-white/60 text-lg max-w-xl mx-auto leading-relaxed font-light">
          consciousness, synchronicity, disclosure, energy — filtered for substance, credibility, and tone. no noise. no fear. no agenda.
        </p>
      </section>

      {/* how it works */}
      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              step: '01',
              title: 'we watch the noise',
              body: 'hundreds of videos published daily across consciousness, UAP, energy, and awareness channels.',
            },
            {
              step: '02',
              title: 'ai scores the signal',
              body: 'each video is scored across novelty, credibility, tone, signal density, and timing relevance.',
            },
            {
              step: '03',
              title: 'you get the frequency',
              body: 'only content that passes our threshold reaches the feed. no doom, no fringe, no filler.',
            },
          ].map(item => (
            <div key={item.step} className="bg-mesa-light/70 border border-periwinkle/15 rounded-2xl p-6 backdrop-blur-sm">
              <p className="text-periwinkle/50 text-xs tracking-widest mb-2">{item.step}</p>
              <h3 className="text-periwinkle-light font-medium mb-2">{item.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <SignalStrip />

      {/* feed */}
      <section id="feed" className="pb-24">
        {/* filter pills */}
        <div className="px-6 mb-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm text-sand/40 tracking-widest">the signal</h2>
          </div>
          <TagFilter active={activeTag} onChange={setActiveTag} />
        </div>

        {/* carousel */}
        {loading ? (
          <div
            className="flex gap-4 overflow-x-auto px-6"
            style={{ scrollbarWidth: 'none' }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="w-[270px] sm:w-[300px] shrink-0 bg-mesa-light/70 border border-periwinkle/15 rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-white/5" />
                <div className="p-4 flex flex-col gap-3">
                  <div className="h-4 bg-white/8 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                  <div className="h-3 bg-white/5 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-24 px-6">
            <p className="text-periwinkle/40 text-lg font-light tracking-wide">no signal yet</p>
            <p className="text-sand/25 text-sm mt-2">the pipeline runs daily — check back soon.</p>
          </div>
        ) : (
          <div className="relative">
            {/* left fade */}
            {!atStart && (
              <div className="absolute left-0 top-0 bottom-4 w-24 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to right, #1e1e35 0%, transparent 100%)' }} />
            )}
            {/* right fade */}
            {!atEnd && (
              <div className="absolute right-0 top-0 bottom-4 w-24 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to left, #1e1e35 0%, transparent 100%)' }} />
            )}
            <div
              ref={carouselRef}
              onScroll={handleScroll}
              className="flex gap-4 overflow-x-auto px-6 pb-4"
              style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}
            >
              {videos.map(video => (
                <VideoCard key={video.id} {...video} />
              ))}
              <div className="w-2 shrink-0" />
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}
