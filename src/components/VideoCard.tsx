'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface VideoCardProps {
  id: string
  title: string
  channelName: string
  thumbnailUrl: string
  youtubeUrl: string
  scores: { overall: number }
  scoreRationale: string
  tags: string[]
  publishedAt: string
  onHoverTags?: (tags: string[]) => void
  onLeaveTags?: () => void
  onPlay?: () => void
  isPlaying?: boolean
}

function ShareButton({ id, title }: { id: string; title: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/v/${id}`
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1 text-xs text-sand/40 hover:text-sand/80 transition-colors"
      aria-label="share"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
        <polyline points="16 6 12 2 8 6"/>
        <line x1="12" y1="2" x2="12" y2="15"/>
      </svg>
      <span>{copied ? 'copied!' : 'share'}</span>
    </button>
  )
}

export default function VideoCard({
  id,
  title,
  channelName,
  thumbnailUrl,
  youtubeUrl,
  scores,
  scoreRationale,
  tags,
  publishedAt,
  onHoverTags,
  onLeaveTags,
  onPlay,
  isPlaying,
}: VideoCardProps) {
  const topTags = tags?.slice(0, 2) || []
  const date = publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : ''

  return (
    <Link
      href={`/v/${id}`}
      onMouseEnter={() => onHoverTags?.(tags ?? [])}
      onMouseLeave={() => onLeaveTags?.()}
      className={`group relative flex flex-col w-[270px] sm:w-[300px] shrink-0 bg-white/[0.04] backdrop-blur-sm border rounded-2xl overflow-hidden transition-all duration-300 snap-start ${
        isPlaying
          ? 'border-periwinkle/60 shadow-[0_0_32px_rgba(107,111,173,0.3),0_4px_24px_rgba(0,0,0,0.55)]'
          : 'border-white/8 hover:border-periwinkle/35 shadow-[0_4px_24px_rgba(0,0,0,0.55)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.7),0_0_20px_rgba(107,111,173,0.12)]'
      }`}
    >
      {/* thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-black/40">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-sand/20 text-xs">no thumbnail</span>
          </div>
        )}
        {/* persistent bottom gradient for depth */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        {/* play overlay — ghost at rest, full on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-20 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
        {/* invisible play interceptor when onPlay is wired */}
        {onPlay && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPlay() }}
            className="absolute inset-0 z-10 cursor-pointer"
            aria-label="play video"
          />
        )}
        {isPlaying && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 bg-periwinkle/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-white text-[10px] font-medium tracking-wide">playing</span>
          </div>
        )}
      </div>

      {/* info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {topTags.length > 0 && (
          <p className="text-[10px] font-medium tracking-[0.12em] text-desert-sky/60 uppercase">
            {topTags[0]}{date ? ` · ${date}` : ''}
          </p>
        )}
        <h3 className="text-white/95 text-base font-semibold leading-snug line-clamp-2 group-hover:text-periwinkle-light transition-colors">
          {title}
        </h3>
        <p className="text-sand/40 text-xs">{channelName}</p>
        <div className="flex items-center justify-between mt-auto pt-2">
          {topTags.length > 1 && (
            <div className="flex gap-1.5 flex-wrap">
              {topTags.slice(1).map(tag => (
                <span
                  key={tag}
                  className="text-xs text-desert-sky/85 bg-periwinkle/10 border border-periwinkle/20 rounded-full px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <ShareButton id={id} title={title} />
        </div>
      </div>

      {/* desktop hover detail — rationale + full tag set */}
      {scoreRationale && !scoreRationale.startsWith('Manually') && (
        <div className="hidden sm:flex absolute inset-0 flex-col justify-end p-4 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.65) 45%, transparent 100%)' }}
        >
          <p className="text-white/80 text-xs leading-relaxed line-clamp-3 mb-2.5">{scoreRationale}</p>
          {tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {tags.map(tag => (
                <span key={tag} className="text-xs text-desert-sky/80 bg-black/40 border border-periwinkle/25 rounded-full px-2 py-0.5">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </Link>
  )
}
