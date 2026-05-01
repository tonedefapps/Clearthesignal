'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { VideoSummary } from '@/lib/firebase/videos'

export default function SpotlightSection() {
  const [video, setVideo] = useState<VideoSummary | null>(null)

  useEffect(() => {
    fetch('/api/videos?spotlight=true')
      .then(r => r.json())
      .then((data: VideoSummary[]) => {
        const v = data?.[0]
        if (v?.spotlightAnalysis) setVideo(v)
      })
      .catch(() => {})
  }, [])

  if (!video || !video.spotlightAnalysis) return null

  const { label, claims } = video.spotlightAnalysis
  const score = video.scores.overall
  const scoreColor = score >= 4 ? 'text-desert-sky' : score >= 3.5 ? 'text-periwinkle-light' : 'text-red-rock/70'
  const scoreBg = score >= 4 ? 'border-desert-sky/40' : score >= 3.5 ? 'border-periwinkle/40' : 'border-red-rock/40'

  return (
    <section className="px-6 mb-10 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1.5 h-1.5 bg-desert-sky rounded-full animate-pulse" />
        <span className="text-xs text-sand/40 tracking-widest uppercase">amplified</span>
      </div>

      <Link
        href={`/v/${video.id}`}
        className="group block bg-mesa-light border border-periwinkle/20 rounded-2xl overflow-hidden hover:border-periwinkle/40 transition-all duration-300 shadow-card"
      >
        {/* full-width hero thumbnail */}
        <div className="relative w-full aspect-video overflow-hidden bg-white/5">
          {video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-sand/20 text-sm">no thumbnail</span>
            </div>
          )}

          {/* bottom gradient for readability */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to top, rgba(20,20,40,0.75) 0%, transparent 55%)' }}
          />

          {/* score badge — top right */}
          <div className={`absolute top-4 right-4 text-sm font-medium tabular-nums px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm border ${scoreBg} ${scoreColor}`}>
            {score.toFixed(1)}
          </div>

          {/* play overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* content */}
        <div className="p-6 flex flex-col gap-5">

          {/* title + channel */}
          <div className="flex flex-col gap-1">
            <p className="text-xs text-sand/40 tracking-wide">{video.channelName}</p>
            <h2 className="text-xl sm:text-2xl font-medium text-white leading-snug group-hover:text-periwinkle-light transition-colors">
              {video.title}
            </h2>
          </div>

          {/* AI analysis */}
          <div className="border-t border-periwinkle/10 pt-5">
            <p className="text-xs text-periwinkle-light/50 tracking-widest uppercase mb-4">{label}</p>
            <ol className="grid sm:grid-cols-2 gap-x-10 gap-y-2.5">
              {claims.map((claim, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-white/65 leading-snug">
                  <span className="text-periwinkle/25 shrink-0 tabular-nums w-4">{i + 1}.</span>
                  <span>{claim}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* CTA */}
          <div className="border-t border-periwinkle/8 pt-4 flex items-center justify-end">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-desert-sky/60 group-hover:text-desert-sky transition-colors">
              watch now
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </span>
          </div>
        </div>
      </Link>
    </section>
  )
}
