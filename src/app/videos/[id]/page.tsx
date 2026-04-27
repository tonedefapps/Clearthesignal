import { adminDb } from '@/lib/firebase/admin'
import ScoreDimension from '@/components/ScoreDimension'
import { Radio, ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function VideoDetailPage({ params }: PageProps) {
  const { id } = await params

  const doc = await adminDb.collection('videos').doc(id).get()
  if (!doc.exists) notFound()

  const video = doc.data()!

  const dimensions = [
    { key: 'novelty',         label: 'Novelty',          description: 'How fresh and original the perspective is' },
    { key: 'credibility',     label: 'Credibility',      description: 'Source quality and evidence backing' },
    { key: 'toneAlignment',   label: 'Tone Alignment',   description: 'Positive, expansive, and constructive framing' },
    { key: 'signalDensity',   label: 'Signal Density',   description: 'Substance vs filler ratio' },
    { key: 'timingRelevance', label: 'Timing Relevance', description: 'Timeliness to current community interests' },
  ]

  const date = video.publishedAt
    ? new Date(video.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''

  return (
    <main className="min-h-screen bg-mesa text-sand">
      <nav className="border-b border-white/8 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Radio size={20} className="text-periwinkle" />
          <span className="font-bold text-white tracking-tight">Clear the Signal</span>
        </div>
        <Link href="/" className="text-sm text-sand/50 hover:text-sand transition-colors flex items-center gap-1">
          <ArrowLeft size={14} /> feed
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* YouTube embed */}
        <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${id}`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: video info */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-bold leading-snug mb-2 text-white">{video.title}</h1>
              <div className="flex items-center gap-3 text-sm text-sand/50">
                <span>{video.channelName}</span>
                <span>·</span>
                <span>{date}</span>
                <a
                  href={video.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-periwinkle-light hover:text-periwinkle transition-colors"
                >
                  YouTube <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="bg-mesa-light border border-white/8 rounded-2xl p-5">
              <p className="text-xs text-periwinkle/70 font-bold tracking-widest mb-2 uppercase">Why this passed</p>
              <p className="text-sand/70 leading-relaxed text-sm">{video.scoreRationale}</p>
            </div>

            {video.tags?.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {video.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/?tag=${tag}`}
                    className="text-xs text-sky-desert/80 bg-periwinkle/10 border border-periwinkle/20 rounded-full px-3 py-1 hover:bg-periwinkle/20 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right: scorecard */}
          <div className="bg-mesa-light border border-white/8 rounded-2xl p-5 flex flex-col gap-5 h-fit">
            <div className="flex items-baseline justify-between">
              <p className="text-xs text-sand/40 font-bold tracking-widest uppercase">Signal Score</p>
              <p className="text-2xl font-bold text-periwinkle-light">{video.scores?.overall?.toFixed(1)}</p>
            </div>
            <div className="flex flex-col gap-4">
              {dimensions.map(d => (
                <ScoreDimension
                  key={d.key}
                  label={d.label}
                  score={video.scores?.[d.key] ?? 0}
                  description={d.description}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
