import { getDb, doc, getDoc } from '@/lib/firebase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import SiteNav from '@/components/SiteNav'
import Footer from '@/components/Footer'
import CommentSection from '@/components/CommentSection'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const db = getDb()
  const snap = await getDoc(doc(db, 'signal_posts', id))
  if (!snap.exists()) return {}
  const post = snap.data()!
  return {
    title: `${post.headline} — clear the signal dispatch`,
    description: post.note || `signal from ${post.source}`,
    openGraph: {
      title: post.headline,
      description: post.note || `signal from ${post.source}`,
    },
  }
}

export default async function SignalPostPage({ params }: PageProps) {
  const { id } = await params
  const db = getDb()
  const snap = await getDoc(doc(db, 'signal_posts', id))
  if (!snap.exists()) notFound()

  const post = snap.data()!
  const publishedAt = post.publishedAt as { seconds: number } | null
  const date = publishedAt
    ? new Date(publishedAt.seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : ''

  return (
    <main className="min-h-screen text-white">
      <SiteNav />

      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* breadcrumb */}
        <Link
          href="/signal"
          className="text-xs text-sand/35 hover:text-sand/60 transition-colors flex items-center gap-1 mb-10"
        >
          ← dispatch
        </Link>

        {/* post */}
        <article className="mb-12">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xs text-desert-sky/70 font-medium tracking-wide">{post.source}</span>
            {date && <span className="text-xs text-sand/30">· {date}</span>}
          </div>

          <h1 className="text-2xl font-medium text-white leading-snug mb-5">{post.headline}</h1>

          {post.note && (
            <p className="text-sand/70 leading-relaxed mb-6 border-l-2 border-periwinkle/30 pl-4 italic text-sm">
              {post.note}
            </p>
          )}

          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-periwinkle-light hover:text-desert-sky transition-colors"
          >
            read the source →
          </a>

          {post.tags?.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-8">
              {post.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href="/signal"
                  className="text-xs text-sky-desert/80 bg-periwinkle/10 border border-periwinkle/20 rounded-full px-3 py-1 hover:bg-periwinkle/20 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </article>

        <div className="border-t border-periwinkle/15 mb-10" />

        <CommentSection postId={id} />

      </div>

      <Footer />
    </main>
  )
}
