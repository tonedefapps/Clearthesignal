'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { clsx } from 'clsx'

interface VideoCardProps {
  id: string
  title: string
  channelName: string
  thumbnailUrl: string
  youtubeUrl: string
  scores: {
    overall: number
  }
  scoreRationale: string
  tags: string[]
  publishedAt: string
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 4 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
    score >= 3.5 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
    'bg-slate-500/20 text-slate-300 border-slate-500/30'

  return (
    <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full border', color)}>
      {score.toFixed(1)}
    </span>
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
}: VideoCardProps) {
  const firstSentence = scoreRationale?.split(/[.!?]/)[0] || ''
  const topTags = tags?.slice(0, 2) || []
  const date = publishedAt ? new Date(publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''

  return (
    <div className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 hover:bg-white/8 transition-all duration-200">
      <Link href={`/videos/${id}`} className="block relative aspect-video overflow-hidden">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-white/10 flex items-center justify-center">
            <span className="text-white/30 text-sm">No thumbnail</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <ScoreBadge score={scores?.overall ?? 0} />
        </div>
      </Link>

      <div className="p-4 flex flex-col gap-3">
        <div>
          <Link href={`/videos/${id}`}>
            <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 hover:text-sky-300 transition-colors">
              {title}
            </h3>
          </Link>
          <p className="text-white/50 text-xs mt-1">{channelName} · {date}</p>
        </div>

        {firstSentence && (
          <p className="text-white/60 text-xs leading-relaxed italic border-l-2 border-sky-500/40 pl-3">
            {firstSentence}.
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5 flex-wrap">
            {topTags.map(tag => (
              <span key={tag} className="text-xs text-sky-400/80 bg-sky-500/10 border border-sky-500/20 rounded-full px-2 py-0.5">
                {tag}
              </span>
            ))}
          </div>
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/30 hover:text-white/70 transition-colors ml-2 shrink-0"
            aria-label="Open on YouTube"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  )
}
