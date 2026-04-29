import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDb, doc, getDoc, updateDoc, increment } from '@/lib/firebase/server'
import { SpiralIcon } from '@/components/SpiralIcon'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ videoId: string }> }

interface VideoData {
  videoId: string
  title: string
  channelName: string
  thumbnailUrl: string
  youtubeUrl: string
  publishedAt: string
  scoreRationale?: string
  tags: string[]
  passed: boolean
}

async function fetchVideo(videoId: string): Promise<VideoData | null> {
  const snap = await getDoc(doc(getDb(), 'videos', videoId))
  if (!snap.exists()) return null
  return { videoId, ...snap.data() } as VideoData
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { videoId } = await params
  const video = await fetchVideo(videoId)
  if (!video) return { title: 'Clear the Signal' }

  const description = video.scoreRationale && !video.scoreRationale.startsWith('Manually')
    ? video.scoreRationale
    : 'Curated by Clear the Signal — consciousness, synchronicity, disclosure, energy.'

  return {
    title: `${video.title} · Clear the Signal`,
    description,
    openGraph: {
      title: video.title,
      description,
      images: [{ url: video.thumbnailUrl, width: 1280, height: 720, alt: video.title }],
      url: `https://clearthesignal.com/v/${videoId}`,
      type: 'video.other',
    },
    twitter: {
      card: 'summary_large_image',
      title: video.title,
      description,
      images: [video.thumbnailUrl],
    },
  }
}

export default async function VideoPage({ params }: Props) {
  const { videoId } = await params
  const video = await fetchVideo(videoId)

  if (!video || !video.passed) notFound()

  // log the click — fire and forget
  updateDoc(doc(getDb(), 'videos', videoId), { clickCount: increment(1) }).catch(() => {})

  const date = video.publishedAt
    ? new Date(video.publishedAt).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
      })
    : ''

  const showRationale = video.scoreRationale && !video.scoreRationale.startsWith('Manually')
  const primaryTag = video.tags?.[0] ?? ''

  return (
    <main className="min-h-screen text-white">

      {/* minimal nav */}
      <nav className="border-b border-periwinkle/20 px-6 py-3 backdrop-blur-sm bg-mesa/80 sticky top-0 z-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <SpiralIcon size={28} />
          <span className="text-xs text-sand/35 tracking-widest group-hover:text-sand/60 transition-colors hidden sm:block">
            clear the signal
          </span>
        </Link>
        <Link
          href={primaryTag ? `/?tag=${primaryTag}` : '/'}
          className="text-xs text-sand/35 hover:text-desert-sky transition-colors"
        >
          ← more like this
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-24">

        {/* embed */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black mb-8 shadow-2xl ring-1 ring-periwinkle/10">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>

        {/* metadata */}
        <div className="flex flex-col gap-5">

          <div className="flex flex-col gap-1.5">
            <h1 className="text-xl sm:text-2xl font-medium text-white leading-snug">
              {video.title}
            </h1>
            <p className="text-sand/40 text-sm">
              {video.channelName}{date ? ` · ${date}` : ''}
            </p>
          </div>

          {showRationale && (
            <p className="text-white/60 text-base leading-relaxed">
              {video.scoreRationale}
            </p>
          )}

          {video.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {video.tags.map(tag => (
                <Link
                  key={tag}
                  href={`/?tag=${tag}`}
                  className="text-xs text-desert-sky/70 bg-periwinkle/10 border border-periwinkle/20 rounded-full px-3 py-1 hover:border-periwinkle/40 hover:text-desert-sky transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
