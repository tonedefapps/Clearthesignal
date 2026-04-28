'use client'

import { clsx } from 'clsx'

const TAGS = [
  { value: '', label: 'all' },
  { value: 'consciousness', label: 'consciousness' },
  { value: 'UAP', label: 'UAP' },
  { value: 'disclosure', label: 'disclosure' },
  { value: 'synchronicity', label: 'synchronicity' },
  { value: 'energy', label: 'energy' },
  { value: 'manifestation', label: 'manifestation' },
  { value: 'healing', label: 'healing' },
  { value: 'quantum', label: 'quantum' },
  { value: 'meditation', label: 'meditation' },
  { value: 'contact', label: 'contact' },
  { value: 'evolution', label: 'evolution' },
]

interface TagFilterProps {
  active: string
  onChange: (tag: string) => void
}

export default function TagFilter({ active, onChange }: TagFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
      {TAGS.map(tag => (
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
