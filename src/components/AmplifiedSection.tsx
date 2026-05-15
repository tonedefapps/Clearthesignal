'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { VideoSummary } from '@/lib/firebase/videos'

export default function AmplifiedSection() {
  const [video, setVideo] = useState<VideoSummary | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/videos?amplified=true')
      .then(r => r.json())
      .then(data => {
        if (data && data.amplifiedAnalysis) setVideo(data)
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  if (!loaded || !video || !video.amplifiedAnalysis) return null

  const { amplifiedAnalysis: analysis } = video
  const videoId = video.youtubeUrl?.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1] ?? video.id

  function normalizeItem(item: string | { text: string; ts?: string }): { text: string; ts?: string } {
    return typeof item === 'string' ? { text: item } : item
  }

  function tsToSeconds(ts: string): number {
    const parts = ts.split(':').map(Number)
    return parts.length === 3
      ? parts[0] * 3600 + parts[1] * 60 + parts[2]
      : parts[0] * 60 + parts[1]
  }

  return (
    <section className="w-full max-w-4xl mx-auto px-4 mb-10">
      <h2 className="text-xs font-medium tracking-widest text-periwinkle-light/50 uppercase mb-4 pl-1 border-l-2 border-red-rock/50">
        amplified
      </h2>

      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden shadow-[0_8px_48px_rgba(0,0,0,0.7),0_2px_8px_rgba(0,0,0,0.5)]">
        {/* Cinematic thumbnail with overlay */}
        <div className="relative w-full aspect-video">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 p-5">
            <p className="text-xs text-desert-sky/70 mb-1.5 tracking-wide">{video.channelName}</p>
            <h3 className="text-lg font-semibold text-white leading-snug line-clamp-2 drop-shadow-lg">
              {video.title}
            </h3>
            {video.scores?.overall != null && (
              <span className="inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full bg-periwinkle/20 border border-periwinkle/30 text-periwinkle-light/90 backdrop-blur-sm">
                signal {video.scores.overall}
              </span>
            )}
          </div>
        </div>

        {/* Analysis + CTA */}
        <div className="p-5">
          <p className="text-xs font-medium text-sand/45 uppercase tracking-wider mb-3">
            {analysis.label}
          </p>
          <ol className="flex flex-col gap-2.5 mb-5">
            {(analysis.items as Array<string | { text: string; ts?: string }>).map((raw, i) => {
              const { text, ts } = normalizeItem(raw)
              const seconds = ts ? tsToSeconds(ts) : 0
              return (
                <li key={i} className="flex gap-2.5 text-sm text-sand/70 leading-snug">
                  <span className="text-periwinkle-light/35 shrink-0 tabular-nums">{i + 1}.</span>
                  <span className="flex flex-col gap-0.5">
                    <span>{text}</span>
                    {ts && (
                      <a
                        href={`https://youtube.com/watch?v=${videoId}&t=${seconds}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-periwinkle/40 hover:text-periwinkle-light transition-colors w-fit"
                      >
                        {ts} ↗
                      </a>
                    )}
                  </span>
                </li>
              )
            })}
          </ol>
          <Link
            href={`/v/${videoId}`}
            className="inline-flex items-center gap-1.5 text-sm text-desert-sky/80 hover:text-desert-sky transition-colors px-3.5 py-1.5 bg-periwinkle/10 hover:bg-periwinkle/20 border border-periwinkle/25 hover:border-periwinkle/40 rounded-full"
          >
            watch ↗
          </Link>
        </div>
      </div>
    </section>
  )
}
