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
      <h2 className="text-xs font-medium tracking-widest text-periwinkle-light/60 uppercase mb-4">
        amplified
      </h2>

      <div className="bg-mesa-light/80 border border-periwinkle/20 rounded-2xl overflow-hidden shadow-card">
        <div className="flex flex-col sm:flex-row gap-0">
          {/* Thumbnail */}
          <div className="sm:w-64 shrink-0">
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-48 sm:h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-4 p-6 flex-1 min-w-0">
            <div>
              <p className="text-xs text-desert-sky/60 mb-1">{video.channelName}</p>
              <h3 className="text-base font-medium text-white/90 leading-snug line-clamp-2">
                {video.title}
              </h3>
              {video.scores?.overall != null && (
                <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-periwinkle/10 border border-periwinkle/20 text-periwinkle-light/70">
                  signal {video.scores.overall}
                </span>
              )}
            </div>

            {/* Analysis block */}
            <div>
              <p className="text-xs font-medium text-sand/50 uppercase tracking-wider mb-2">
                {analysis.label}
              </p>
              <ol className="flex flex-col gap-2">
                {(analysis.items as Array<string | { text: string; ts?: string }>).map((raw, i) => {
                  const { text, ts } = normalizeItem(raw)
                  const seconds = ts ? tsToSeconds(ts) : 0
                  return (
                    <li key={i} className="flex gap-2 text-sm text-sand/75 leading-snug">
                      <span className="text-periwinkle-light/40 shrink-0 tabular-nums">{i + 1}.</span>
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
            </div>

            <div className="mt-auto pt-2">
              <Link
                href={`/v/${videoId}`}
                className="text-sm text-desert-sky/70 hover:text-desert-sky transition-colors"
              >
                watch →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
