'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { createSignalPost, deleteSignalPost, getSignalPosts, type SignalPost } from '@/lib/firebase/signal'
import { CANONICAL_TAGS } from '@/lib/constants/tags'
import { HorizontalLockup } from '@/components/SpiralIcon'
import AuthStatus from '@/components/AuthStatus'

const EMPTY_FORM = { headline: '', url: '', source: '', note: '', tags: [] as string[] }

export default function AdminPage() {
  const router = useRouter()
  const { user, profile, loading, profileLoading } = useAuth()
  const [posts, setPosts] = useState<SignalPost[]>([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isAuthorized = profile?.role === 'admin' || profile?.role === 'mod'

  useEffect(() => {
    if (!loading && !user) { router.replace('/auth'); return }
    if (!profileLoading && profile && !isAuthorized) { router.replace('/'); return }
  }, [user, profile, loading, profileLoading, isAuthorized, router])

  useEffect(() => {
    if (isAuthorized) {
      getSignalPosts(undefined, 50).then(setPosts).catch(() => {})
    }
  }, [isAuthorized])

  function toggleTag(tag: string) {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }))
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !profile) return
    if (!form.headline.trim() || !form.url.trim() || !form.source.trim()) {
      setError('headline, url, and source are required')
      return
    }
    setError('')
    setPosting(true)
    try {
      const id = await createSignalPost({
        headline: form.headline.trim(),
        url: form.url.trim(),
        source: form.source.trim(),
        note: form.note.trim(),
        tags: form.tags,
        authorUid: user.uid,
        authorName: profile.displayName,
      })
      setPosts(prev => [{
        id,
        ...form,
        headline: form.headline.trim(),
        url: form.url.trim(),
        source: form.source.trim(),
        note: form.note.trim(),
        authorUid: user.uid,
        authorName: profile.displayName,
        publishedAt: { seconds: Date.now() / 1000 },
      }, ...prev])
      setForm(EMPTY_FORM)
      setSuccess('posted.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'something went wrong')
    } finally {
      setPosting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('delete this post?')) return
    await deleteSignalPost(id)
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  if (loading || profileLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-periwinkle border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen text-white">

      <nav className="border-b border-periwinkle/20 px-6 py-3 flex items-center justify-between backdrop-blur-sm bg-mesa/80 sticky top-0 z-10">
        <Link href="/"><HorizontalLockup height={72} /></Link>
        <div className="flex items-center gap-4">
          <Link href="/signal" className="text-sm text-sand/50 hover:text-desert-sky transition-colors">dispatch</Link>
          <Link href="/" className="text-sm text-sand/50 hover:text-desert-sky transition-colors">feed</Link>
          <span className="text-xs px-2 py-1 rounded-full bg-periwinkle/20 border border-periwinkle/30 text-periwinkle-light">
            {profile?.role}
          </span>
          <AuthStatus />
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12 flex flex-col gap-12">

        {/* composer */}
        <section>
          <h1 className="text-2xl font-medium text-periwinkle-light mb-8">post to the dispatch</h1>

          {error && (
            <div className="bg-red-rock/15 border border-red-rock/35 rounded-xl px-4 py-3 text-sm text-red-rock-light mb-6">{error}</div>
          )}
          {success && (
            <div className="bg-periwinkle/15 border border-periwinkle/35 rounded-xl px-4 py-3 text-sm text-periwinkle-light mb-6">{success}</div>
          )}

          <form onSubmit={handlePost} className="flex flex-col gap-5">

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-sand/50 tracking-widest">url *</label>
              <input
                type="url"
                value={form.url}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                placeholder="https://"
                required
                className="w-full bg-mesa-light border border-periwinkle/20 rounded-xl px-4 py-3 text-white placeholder:text-sand/25 text-sm outline-none focus:border-periwinkle/50 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-sand/50 tracking-widest">headline *</label>
                <input
                  type="text"
                  value={form.headline}
                  onChange={e => setForm(f => ({ ...f, headline: e.target.value }))}
                  placeholder="article or story headline"
                  required
                  className="w-full bg-mesa-light border border-periwinkle/20 rounded-xl px-4 py-3 text-white placeholder:text-sand/25 text-sm outline-none focus:border-periwinkle/50 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-sand/50 tracking-widest">source *</label>
                <input
                  type="text"
                  value={form.source}
                  onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                  placeholder="e.g. NewsNation, The Guardian"
                  required
                  className="w-full bg-mesa-light border border-periwinkle/20 rounded-xl px-4 py-3 text-white placeholder:text-sand/25 text-sm outline-none focus:border-periwinkle/50 transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-sand/50 tracking-widest">editorial note <span className="text-sand/30 normal-case ml-1">why this is signal</span></label>
              <textarea
                value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                placeholder="2–3 sentences on why this matters to the community…"
                rows={3}
                className="w-full bg-mesa-light border border-periwinkle/20 rounded-xl px-4 py-3 text-white placeholder:text-sand/25 text-sm outline-none focus:border-periwinkle/50 transition-colors resize-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-sand/50 tracking-widest">tags</label>
              <div className="flex flex-wrap gap-2">
                {CANONICAL_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                      form.tags.includes(tag)
                        ? 'bg-periwinkle/25 border-periwinkle/60 text-periwinkle-light'
                        : 'bg-mesa-light border-periwinkle/20 text-sand/40 hover:border-periwinkle/35'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={posting}
              className="self-start bg-periwinkle hover:bg-periwinkle-light text-white font-medium px-8 py-3 rounded-xl transition-colors text-sm disabled:opacity-50"
            >
              {posting ? 'posting…' : 'post to dispatch'}
            </button>
          </form>
        </section>

        {/* published posts */}
        <section>
          <h2 className="text-lg font-medium text-periwinkle-light mb-6">published posts</h2>
          {posts.length === 0 ? (
            <p className="text-sand/30 text-sm">no posts yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {posts.map(post => {
                const date = post.publishedAt
                  ? new Date((post.publishedAt as { seconds: number }).seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : ''
                return (
                  <div key={post.id} className="flex items-start justify-between gap-4 bg-mesa-light/60 border border-periwinkle/10 rounded-xl px-5 py-4">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-xs text-desert-sky/60">{post.source} · {date}</span>
                      <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-sm text-white/80 hover:text-desert-sky transition-colors truncate">
                        {post.headline}
                      </a>
                      {post.tags.length > 0 && (
                        <div className="flex gap-1.5 flex-wrap mt-1">
                          {post.tags.map(t => (
                            <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-periwinkle/10 border border-periwinkle/20 text-periwinkle-light/60">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-xs text-red-rock/40 hover:text-red-rock transition-colors shrink-0 pt-0.5"
                    >
                      delete
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}
