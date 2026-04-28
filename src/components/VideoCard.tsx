'use client'

import Image from 'next/image'
import { clsx } from 'clsx'

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
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <span className={clsx(
      'text-xs font-medium px-2 py-0.5 rounded-full border tracking-wide',
      score >= 4
        ? 'bg-periwinkle/25 text-periwinkle-light border-periwinkle/40'
        : 'bg-red-rock/20 text-red-rock-light border-red-rock/35'
    )}>
      {score.toFixed(1)}
    </span>
  )
}

export default function VideoCard({
  title,
  channelName,
  thumbnailUrl,
  youtubeUrl,
  scores,
  tags,
  publishedAt,
}: VideoCardProps) {
  const topTags = tags?.slice(0, 2) || []
  const date = publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : ''

  return (
    <a
      href={youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col w-[270px] sm:w-[300px] shrink-0 bg-mesa-light border border-periwinkle/15 rounded-2xl overflow-hidden hover:border-periwinkle/40 transition-all duration-200 scroll-snap-align-start"
    >
      {/* thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-white/5">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-sand/20 text-xs">no thumbnail</span>
          </div>
        )}
        {/* play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20">
          <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
        {/* score badge */}
        <div className="absolute top-2 right-2">
          <ScoreBadge score={scores?.overall ?? 0} />
        </div>
      </div>

      {/* info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="text-white text-sm font-medium leading-snug line-clamp-2 group-hover:text-periwinkle-light transition-colors">
          {title}
        </h3>
        <p className="text-sand/40 text-xs">{channelName}{date ? ` · ${date}` : ''}</p>
        {topTags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-auto pt-2">
            {topTags.map(tag => (
              <span
                key={tag}
                className="text-xs text-desert-sky/70 bg-periwinkle/10 border border-periwinkle/20 rounded-full px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  )
}
