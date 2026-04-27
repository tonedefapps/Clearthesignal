'use client'

import { clsx } from 'clsx'

const TAGS = [
  { value: '', label: 'all' },
  { value: 'consciousness', label: 'consciousness' },
  { value: 'synchronicity', label: 'synchronicity' },
  { value: 'manifestation', label: 'manifestation' },
  { value: 'energy', label: 'energy' },
  { value: 'UAP', label: 'UAP' },
  { value: 'healing', label: 'healing' },
  { value: 'quantum', label: 'quantum' },
  { value: 'meditation', label: 'meditation' },
  { value: 'disclosure', label: 'disclosure' },
]

interface TagFilterProps {
  active: string
  onChange: (tag: string) => void
}

export default function TagFilter({ active, onChange }: TagFilterProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {TAGS.map(tag => (
        <button
          key={tag.value}
          onClick={() => onChange(tag.value)}
          className={clsx(
            'text-sm px-4 py-1.5 rounded-full border transition-all duration-150 font-medium',
            active === tag.value
              ? 'bg-periwinkle border-periwinkle text-white'
              : 'bg-mesa-light border-white/15 text-sand/60 hover:border-periwinkle/40 hover:text-sand'
          )}
        >
          {tag.label}
        </button>
      ))}
    </div>
  )
}
