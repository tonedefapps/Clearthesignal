'use client'

import Image from 'next/image'

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
}


export default function VideoCard({
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
      onMouseEnter={() => onHoverTags?.(tags ?? [])}
      onMouseLeave={() => onLeaveTags?.()}
      className="group relative flex flex-col w-[270px] sm:w-[300px] shrink-0 bg-mesa-light border border-periwinkle/15 rounded-2xl overflow-hidden hover:border-periwinkle/40 transition-all duration-200 scroll-snap-align-start"
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

      {/* desktop hover detail — rationale + full tag set */}
      {scoreRationale && (
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
    </a>
  )
}
