'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import YouTube from 'react-youtube'
import VideoCard from '@/components/VideoCard'
import TagFilter from '@/components/TagFilter'
import { useAuth } from '@/context/AuthContext'
import Footer from '@/components/Footer'
import SignalStrip from '@/components/SignalStrip'
import SiteNav from '@/components/SiteNav'
import AmplifiedSection from '@/components/AmplifiedSection'

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
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showSwipeHint, setShowSwipeHint] = useState(true)
  const [hoveredTags, setHoveredTags] = useState<string[]>([])
  const carouselRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const [nowPlayingId, setNowPlayingId] = useState<string | null>(null)

  function handleScroll() {
    const el = carouselRef.current
    if (!el) return
    setAtStart(el.scrollLeft < 16)
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 16)
    if (el.scrollLeft > 20) setShowSwipeHint(false)
  }

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    const check = () => {
      const overflow = el.scrollWidth > el.clientWidth + 8
      setIsOverflowing(overflow)
      if (!overflow) { setAtStart(true); setAtEnd(true) }
    }
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [videos])

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

  // clear search and reset scroll on tag change
  useEffect(() => {
    setSearchQuery('')
    carouselRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
  }, [activeTag])

  const filteredVideos = searchQuery.trim()
    ? videos.filter(v =>
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : videos

  const nowPlayingIdx = nowPlayingId ? filteredVideos.findIndex(v => v.id === nowPlayingId) : -1
  const nowPlaying = nowPlayingIdx >= 0 ? filteredVideos[nowPlayingIdx] : null

  function handlePlay(id: string) {
    setNowPlayingId(id)
    setTimeout(() => playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  function handleEnd() {
    if (nowPlayingIdx < 0 || filteredVideos.length === 0) return
    const nextIdx = (nowPlayingIdx + 1) % filteredVideos.length
    setNowPlayingId(filteredVideos[nextIdx].id)
  }

  function getYouTubeId(video: Video): string {
    return video.youtubeUrl?.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1] ?? video.id
  }

  return (
    <main className="min-h-screen text-white">

      <SiteNav />

      {/* hero */}
      <section className="px-6 pt-28 pb-20 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 text-xs text-periwinkle-light bg-periwinkle/10 border border-periwinkle/25 rounded-full px-3 py-1 mb-10">
          <span className="w-1.5 h-1.5 bg-periwinkle rounded-full animate-pulse" />
          updated daily
        </div>
        <h1 className="text-5xl sm:text-6xl font-medium tracking-tight mb-5 leading-tight">
          <span
            className="text-desert-sky"
            style={{ textShadow: '0 0 60px rgba(168,196,224,0.2)' }}
          >
            clear the signal.
          </span>
          <br />
          <span className="text-red-rock">find your frequency.</span>
        </h1>
        <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed font-light">
          focus on the message. not the noise.
        </p>
      </section>

      <SignalStrip />

      <AmplifiedSection />

      {/* inline player */}
      {nowPlaying && (
        <section ref={playerRef} className="w-full max-w-4xl mx-auto px-4 mb-10">
          <div className="bg-mesa-light/60 border border-periwinkle/20 rounded-2xl overflow-hidden shadow-[0_8px_48px_rgba(0,0,0,0.6)]">
            <div className="relative w-full aspect-video bg-black">
              <YouTube
                videoId={getYouTubeId(nowPlaying)}
                opts={{ width: '100%', height: '100%', playerVars: { autoplay: 1, rel: 0, modestbranding: 1 } }}
                onEnd={handleEnd}
                className="absolute inset-0"
                iframeClassName="w-full h-full"
              />
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="text-xs text-desert-sky/60 mb-0.5">{nowPlaying.channelName}</p>
                <p className="text-sm font-medium text-white/90 leading-snug truncate">{nowPlaying.title}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {nowPlayingIdx < filteredVideos.length - 1 && (
                  <button
                    onClick={() => setNowPlayingId(filteredVideos[nowPlayingIdx + 1].id)}
                    className="text-xs text-sand/50 hover:text-desert-sky transition-colors flex items-center gap-1"
                  >
                    next ⏭
                  </button>
                )}
                <button
                  onClick={() => setNowPlayingId(null)}
                  className="text-xs text-sand/40 hover:text-white transition-colors"
                  aria-label="close player"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* feed */}
      <section id="feed" className="pb-24">
        {/* search + filter */}
        <div className="px-6 mb-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm text-sand/40 tracking-widest">the signal</h2>
          </div>

          {/* search */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="search by title or topic..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.05] backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-sand/30 focus:outline-none focus:border-periwinkle/40 focus:bg-white/[0.07] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sand/40 hover:text-sand/70 transition-colors text-xl leading-none"
                aria-label="clear search"
              >
                ×
              </button>
            )}
          </div>

          <TagFilter active={activeTag} onChange={setActiveTag} highlightedTags={hoveredTags} />
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
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-24 px-6">
            {searchQuery ? (
              <>
                <p className="text-periwinkle/40 text-lg font-light tracking-wide">no signal found</p>
                <p className="text-sand/25 text-sm mt-2">try a different search, or <button onClick={() => setSearchQuery('')} className="text-desert-sky/50 hover:text-desert-sky underline-offset-2 underline transition-colors">clear it</button></p>
              </>
            ) : (
              <>
                <p className="text-periwinkle/40 text-lg font-light tracking-wide">no signal yet</p>
                <p className="text-sand/25 text-sm mt-2">the pipeline runs daily. check back soon.</p>
              </>
            )}
          </div>
        ) : (
          <div className="relative">
            {/* left fade + arrow */}
            {!atStart && (
              <div className="absolute left-0 top-0 bottom-4 w-24 z-10 hidden sm:flex items-center"
                style={{ background: 'linear-gradient(to right, #1e1e35 60%, transparent 100%)' }}>
                <button
                  onClick={() => carouselRef.current?.scrollBy({ left: -320, behavior: 'smooth' })}
                  className="ml-3 w-9 h-9 rounded-full bg-mesa-light/80 border border-periwinkle/25 text-sand/60 hover:text-white hover:border-periwinkle/50 transition-all flex items-center justify-center"
                >
                  ←
                </button>
              </div>
            )}
            {/* right fade + arrow */}
            {!atEnd && (
              <div className="absolute right-0 top-0 bottom-4 w-24 z-10 hidden sm:flex items-center justify-end"
                style={{ background: 'linear-gradient(to left, #1e1e35 60%, transparent 100%)' }}>
                <button
                  onClick={() => carouselRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
                  className="mr-3 w-9 h-9 rounded-full bg-mesa-light/80 border border-periwinkle/25 text-sand/60 hover:text-white hover:border-periwinkle/50 transition-all flex items-center justify-center"
                >
                  →
                </button>
              </div>
            )}
            <div
              ref={carouselRef}
              onScroll={handleScroll}
              className={`flex gap-4 overflow-x-auto px-6 pb-4 ${!isOverflowing ? 'justify-center' : ''}`}
              style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}
            >
              {filteredVideos.map((video, idx) => (
                <VideoCard
                  key={video.id}
                  {...video}
                  onHoverTags={setHoveredTags}
                  onLeaveTags={() => setHoveredTags([])}
                  onPlay={() => handlePlay(video.id)}
                  isPlaying={idx === nowPlayingIdx}
                />
              ))}
              <div className="w-2 shrink-0" />
            </div>

            {/* mobile swipe hint — fades after first scroll */}
            {showSwipeHint && isOverflowing && (
              <div className="sm:hidden flex items-center justify-center gap-1.5 mt-3 animate-pulse">
                <span className="text-sand/25 text-xs tracking-wide">swipe to explore</span>
                <span className="text-sand/25 text-xs">→</span>
              </div>
            )}
          </div>
        )}
      </section>

      <Footer />
    </main>
  )
}
