'use client'

import { clsx } from 'clsx'
import { useAuth } from '@/context/AuthContext'
import { CANONICAL_TAGS } from '@/lib/constants/tags'

const FEED_TAGS = [{ value: '', label: 'all' }, ...CANONICAL_TAGS.map(t => ({ value: t, label: t }))]

interface TagFilterProps {
  active: string
  onChange: (tag: string) => void
}

export default function TagFilter({ active, onChange }: TagFilterProps) {
  const { profile } = useAuth()
  const hasInterests = profile?.interests && profile.interests.length > 0

  return (
    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
      {hasInterests && (
        <button
          onClick={() => onChange('my-feed')}
          className={clsx(
            'text-xs px-4 py-1.5 rounded-full border transition-all duration-150 whitespace-nowrap shrink-0 tracking-wide',
            active === 'my-feed'
              ? 'bg-red-rock border-red-rock text-white'
              : 'bg-mesa-light/80 border-red-rock/30 text-sand/60 hover:border-red-rock/55 hover:text-sand/90'
          )}
        >
          my feed
        </button>
      )}
      {FEED_TAGS.map(tag => (
        <button
          key={tag.value}
          onClick={() => onChange(tag.value)}
          className={clsx(
            'text-xs px-4 py-1.5 rounded-full border transition-all duration-150 whitespace-nowrap shrink-0 tracking-wide',
            active === tag.value
              ? 'bg-periwinkle border-periwinkle text-white'
              : 'bg-mesa-light/80 border-periwinkle/20 text-sand/50 hover:border-periwinkle/45 hover:text-sand/80'
          )}
        >
          {tag.label}
        </button>
      ))}
    </div>
  )
}
