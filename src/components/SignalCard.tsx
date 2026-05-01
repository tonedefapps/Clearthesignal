import Link from 'next/link'
import type { SignalPost } from '@/lib/firebase/signal'

interface SignalCardProps {
  post: SignalPost
  onDelete?: (id: string) => void
}

export default function SignalCard({ post, onDelete }: SignalCardProps) {
  const date = post.publishedAt
    ? new Date((post.publishedAt as { seconds: number }).seconds * 1000).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : ''

  return (
    <div className="w-full bg-mesa-light/70 border border-periwinkle/15 rounded-2xl p-5 flex flex-col gap-3 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-desert-sky/70 font-medium tracking-wide truncate">
          {post.source}
        </span>
        <span className="text-xs text-sand/30 whitespace-nowrap">{date}</span>
      </div>

      <Link
        href={`/signal/${post.id}`}
        className="text-sm font-medium text-white/90 leading-snug hover:text-desert-sky transition-colors line-clamp-3"
      >
        {post.headline}
      </Link>

      {post.note && (
        <p className="text-xs text-sand/55 leading-relaxed line-clamp-3">{post.note}</p>
      )}

      <div className="flex items-center justify-between gap-2 mt-auto pt-1">
        <div className="flex gap-1.5 flex-wrap">
          {post.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-periwinkle/10 border border-periwinkle/20 text-periwinkle-light/70"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-desert-sky/60 hover:text-desert-sky transition-colors"
          >
            read →
          </a>
          <Link
            href={`/signal/${post.id}`}
            className="text-xs text-sand/35 hover:text-sand/60 transition-colors"
          >
            {post.commentCount && post.commentCount > 0
              ? `${post.commentCount} comment${post.commentCount === 1 ? '' : 's'}`
              : 'discuss'}
          </Link>
          {onDelete && (
            <button
              onClick={() => onDelete(post.id)}
              className="text-xs text-red-rock/40 hover:text-red-rock transition-colors"
            >
              delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
