'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { createSignalPost, deleteSignalPost, getSignalPosts, type SignalPost } from '@/lib/firebase/signal'
import { getRecentVideos, removeVideo, getVideoStats, type VideoSummary } from '@/lib/firebase/videos'
import { getUserByEmail, setUserRole, getTeamMembers, type UserProfile } from '@/lib/firebase/users'
import { CANONICAL_TAGS } from '@/lib/constants/tags'
import { getDb, doc, setDoc, serverTimestamp } from '@/lib/firebase/server'
import SiteNav from '@/components/SiteNav'

type Tab = 'overview' | 'dispatch' | 'feed' | 'team'

const EMPTY_POST = { headline: '', url: '', source: '', note: '', tags: [] as string[] }

export default function AdminPage() {
  const router = useRouter()
  const { user, profile, loading, profileLoading } = useAuth()
  const [tab, setTab] = useState<Tab>('overview')
  const isAuthorized = profile?.role === 'admin' || profile?.role === 'mod'

  useEffect(() => {
    if (!loading && !user) { router.replace('/auth'); return }
    if (!profileLoading && profile && !isAuthorized) { router.replace('/'); return }
  }, [user, profile, loading, profileLoading, isAuthorized, router])

  if (loading || profileLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-periwinkle border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'overview' },
    { id: 'dispatch', label: 'dispatch' },
    { id: 'feed', label: 'feed' },
    ...(profile?.role === 'admin' ? [{ id: 'team' as Tab, label: 'team' }] : []),
  ]

  return (
    <main className="min-h-screen text-white">
      <SiteNav />

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-white">admin panel</h1>
            <p className="text-xs text-sand/40 tracking-widest mt-1">clear the signal</p>
          </div>
          <span className="text-xs px-3 py-1.5 rounded-full bg-periwinkle/20 border border-periwinkle/35 text-periwinkle-light tracking-widest">
            {profile?.role}
          </span>
        </div>

        {/* tabs */}
        <div className="flex gap-1 bg-mesa-light/60 border border-periwinkle/15 rounded-xl p-1 mb-8">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 text-sm py-2 px-3 rounded-lg transition-all ${
                tab === t.id
                  ? 'bg-periwinkle/25 text-periwinkle-light font-medium'
                  : 'text-sand/50 hover:text-sand/80'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && <OverviewTab onNavigate={setTab} />}
        {tab === 'dispatch' && <DispatchTab user={user} profile={profile} />}
        {tab === 'feed' && <FeedTab user={user} profile={profile} />}
        {tab === 'team' && profile?.role === 'admin' && <TeamTab />}
      </div>
    </main>
  )
}

// ── Overview ─────────────────────────────────────────────────────────────────

function OverviewTab({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const [stats, setStats] = useState<{ passed: number; total: number } | null>(null)
  const [postCount, setPostCount] = useState<number | null>(null)

  useEffect(() => {
    getVideoStats().then(setStats).catch(() => {})
    getSignalPosts(undefined, 200).then(posts => setPostCount(posts.length)).catch(() => {})
  }, [])

  const statCards = [
    { label: 'videos in feed', value: stats?.passed ?? '...', sub: 'passed threshold' },
    { label: 'total scored', value: stats?.total ?? '...', sub: 'by pipeline' },
    { label: 'dispatch posts', value: postCount ?? '...', sub: 'published' },
    { label: 'filter rate', value: stats ? `${Math.round((1 - stats.passed / Math.max(stats.total, 1)) * 100)}%` : '...', sub: 'noise removed' },
  ]

  const actions: { label: string; href?: string; tab?: Tab }[] = [
    { label: 'post to the dispatch', tab: 'dispatch' },
    { label: 'add a video to the feed', tab: 'feed' },
    { label: 'view the feed', href: '/' },
    { label: 'view the dispatch', href: '/signal' },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map(s => (
          <div key={s.label} className="bg-mesa-light/60 border border-periwinkle/15 rounded-xl p-4">
            <p className="text-2xl font-medium text-periwinkle-light">{String(s.value)}</p>
            <p className="text-xs text-white/70 mt-1">{s.label}</p>
            <p className="text-xs text-sand/30 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs text-sand/40 tracking-widest mb-1">quick actions</p>
        {actions.map(action =>
          action.href ? (
            <Link key={action.label} href={action.href}
              className="flex items-center justify-between bg-mesa-light/40 border border-periwinkle/10 rounded-xl px-5 py-3.5 hover:border-periwinkle/30 hover:bg-mesa-light/70 transition-all group">
              <span className="text-sm text-sand/70 group-hover:text-white transition-colors">{action.label}</span>
              <span className="text-sand/30 group-hover:text-periwinkle transition-colors">→</span>
            </Link>
          ) : (
            <button key={action.label} onClick={() => action.tab && onNavigate(action.tab)}
              className="flex items-center justify-between bg-mesa-light/40 border border-periwinkle/10 rounded-xl px-5 py-3.5 hover:border-periwinkle/30 hover:bg-mesa-light/70 transition-all group text-left">
              <span className="text-sm text-sand/70 group-hover:text-white transition-colors">{action.label}</span>
              <span className="text-sand/30 group-hover:text-periwinkle transition-colors">→</span>
            </button>
          )
        )}
      </div>
    </div>
  )
}

// ── Dispatch ──────────────────────────────────────────────────────────────────

function DispatchTab({ user, profile }: { user: any; profile: any }) {
  const [posts, setPosts] = useState<SignalPost[]>([])
  const [form, setForm] = useState(EMPTY_POST)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    getSignalPosts(undefined, 50).then(setPosts).catch(() => {})
  }, [])

  function toggleTag(tag: string) {
    setForm(f => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag] }))
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !profile) return
    if (!form.headline.trim() || !form.url.trim() || !form.source.trim()) {
      setError('headline, url, and source are required')
      return
    }
    setError(''); setPosting(true)
    try {
      const id = await createSignalPost({
        headline: form.headline.trim(), url: form.url.trim(),
        source: form.source.trim(), note: form.note.trim(),
        tags: form.tags, authorUid: user.uid, authorName: profile.displayName,
      })
      setPosts(prev => [{ id, ...form, headline: form.headline.trim(), url: form.url.trim(),
        source: form.source.trim(), note: form.note.trim(),
        authorUid: user.uid, authorName: profile.displayName,
        publishedAt: { seconds: Date.now() / 1000 } }, ...prev])
      setForm(EMPTY_POST)
      setSuccess('posted.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'something went wrong')
    } finally { setPosting(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('delete this post?')) return
    await deleteSignalPost(id)
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="text-lg font-medium text-periwinkle-light mb-6">new post</h2>
        {error && <div className="bg-red-rock/15 border border-red-rock/35 rounded-xl px-4 py-3 text-sm text-red-rock-light mb-5">{error}</div>}
        {success && <div className="bg-periwinkle/15 border border-periwinkle/35 rounded-xl px-4 py-3 text-sm text-periwinkle-light mb-5">{success}</div>}
        <form onSubmit={handlePost} className="flex flex-col gap-4">
          <Field label="url *">
            <input type="url" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              placeholder="https://" required className={inputCls} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="headline *">
              <input type="text" value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))}
                placeholder="article or story headline" required className={inputCls} />
            </Field>
            <Field label="source *">
              <input type="text" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                placeholder="e.g. NewsNation, The Guardian" required className={inputCls} />
            </Field>
          </div>
          <Field label="editorial note">
            <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="why this is signal..." rows={3} className={`${inputCls} resize-none`} />
          </Field>
          <TagPicker selected={form.tags} onToggle={toggleTag} />
          <button type="submit" disabled={posting}
            className="self-start bg-periwinkle hover:bg-periwinkle-light text-white font-medium px-8 py-3 rounded-xl transition-colors text-sm disabled:opacity-50">
            {posting ? 'posting...' : 'post to dispatch'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-medium text-periwinkle-light mb-5">published <span className="text-sand/30 text-sm font-normal">({posts.length})</span></h2>
        {posts.length === 0 ? <p className="text-sand/30 text-sm">no posts yet.</p> : (
          <div className="flex flex-col gap-3">
            {posts.map(post => {
              const date = post.publishedAt
                ? new Date((post.publishedAt as { seconds: number }).seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : ''
              return (
                <div key={post.id} className="flex items-start justify-between gap-4 bg-mesa-light/60 border border-periwinkle/10 rounded-xl px-5 py-4">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-xs text-desert-sky/60">{post.source} · {date}</span>
                    <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-sm text-white/80 hover:text-desert-sky transition-colors truncate">{post.headline}</a>
                    {post.tags.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mt-1">
                        {post.tags.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-periwinkle/10 border border-periwinkle/20 text-periwinkle-light/60">{t}</span>)}
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleDelete(post.id)} className="text-xs text-red-rock/40 hover:text-red-rock transition-colors shrink-0 pt-0.5">delete</button>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

// ── Feed ──────────────────────────────────────────────────────────────────────

function FeedTab({ user, profile }: { user: any; profile: any }) {
  const [videoUrl, setVideoUrl] = useState('')
  const [videoMeta, setVideoMeta] = useState<any>(null)
  const [videoTags, setVideoTags] = useState<string[]>([])
  const [fetching, setFetching] = useState(false)
  const [adding, setAdding] = useState(false)
  const [videoError, setVideoError] = useState('')
  const [videoSuccess, setVideoSuccess] = useState('')
  const [videos, setVideos] = useState<VideoSummary[]>([])
  const [videosLoading, setVideosLoading] = useState(true)

  useEffect(() => {
    getRecentVideos(30).then(setVideos).catch(() => {}).finally(() => setVideosLoading(false))
  }, [])

  async function handleFetchVideo(e: React.FormEvent) {
    e.preventDefault()
    setVideoError(''); setVideoMeta(null); setVideoTags([])
    setFetching(true)
    try {
      const res = await fetch('/api/admin/add-video', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl }),
      })
      const data = await res.json()
      if (!res.ok) { setVideoError(data.error || 'fetch failed'); return }
      setVideoMeta(data)
    } catch { setVideoError('could not reach server') }
    finally { setFetching(false) }
  }

  async function handleAddVideo(e: React.FormEvent) {
    e.preventDefault()
    if (!videoMeta) return
    setAdding(true); setVideoError('')
    try {
      const db = getDb()
      await setDoc(doc(db, 'videos', videoMeta.videoId), {
        ...videoMeta,
        scores: { novelty: 5, credibility: 5, toneAlignment: 5, signalDensity: 5, timingRelevance: 5, overall: 5 },
        scoreRationale: 'Manually curated by the team.',
        passed: true, tags: videoTags, scoredAt: serverTimestamp(), manuallyAdded: true,
      })
      setVideoSuccess('added to feed.')
      setVideoUrl(''); setVideoMeta(null); setVideoTags([])
      setTimeout(() => setVideoSuccess(''), 4000)
      getRecentVideos(30).then(setVideos).catch(() => {})
    } catch (err: unknown) {
      setVideoError(err instanceof Error ? err.message : 'write failed')
    } finally { setAdding(false) }
  }

  async function handleRemove(videoId: string, title: string) {
    if (!confirm(`remove "${title}" from the feed?`)) return
    await removeVideo(videoId)
    setVideos(prev => prev.filter(v => v.id !== videoId))
  }

  return (
    <div className="flex flex-col gap-10">

      {/* add video */}
      <section>
        <h2 className="text-lg font-medium text-periwinkle-light mb-6">add video</h2>
        {videoError && <div className="bg-red-rock/15 border border-red-rock/35 rounded-xl px-4 py-3 text-sm text-red-rock-light mb-5">{videoError}</div>}
        {videoSuccess && <div className="bg-periwinkle/15 border border-periwinkle/35 rounded-xl px-4 py-3 text-sm text-periwinkle-light mb-5">{videoSuccess}</div>}
        <form onSubmit={handleFetchVideo} className="flex gap-3 mb-6">
          <input type="url" value={videoUrl}
            onChange={e => { setVideoUrl(e.target.value); setVideoMeta(null); setVideoTags([]) }}
            placeholder="paste a YouTube URL" required className={`flex-1 ${inputCls}`} />
          <button type="submit" disabled={fetching || !videoUrl.trim()}
            className="bg-mesa-light border border-periwinkle/30 hover:border-periwinkle/60 text-periwinkle-light font-medium px-6 py-3 rounded-xl transition-colors text-sm disabled:opacity-40">
            {fetching ? 'fetching...' : 'fetch'}
          </button>
        </form>
        {videoMeta && (
          <form onSubmit={handleAddVideo} className="flex flex-col gap-5">
            <div className="flex gap-4 bg-mesa-light/60 border border-periwinkle/15 rounded-xl p-4">
              {videoMeta.thumbnailUrl && <img src={videoMeta.thumbnailUrl} alt="" className="w-32 rounded-lg object-cover shrink-0" />}
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-xs text-desert-sky/60">{videoMeta.channelName}</p>
                <p className="text-sm text-white/90 leading-snug">{videoMeta.title}</p>
                <a href={videoMeta.youtubeUrl} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-periwinkle/50 hover:text-periwinkle transition-colors mt-1">{videoMeta.youtubeUrl}</a>
              </div>
            </div>
            <TagPicker selected={videoTags} onToggle={t => setVideoTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])} />
            <button type="submit" disabled={adding}
              className="self-start bg-periwinkle hover:bg-periwinkle-light text-white font-medium px-8 py-3 rounded-xl transition-colors text-sm disabled:opacity-50">
              {adding ? 'adding...' : 'add to feed'}
            </button>
          </form>
        )}
      </section>

      {/* video list */}
      <section>
        <h2 className="text-lg font-medium text-periwinkle-light mb-5">
          recent videos <span className="text-sand/30 text-sm font-normal">({videos.length})</span>
        </h2>
        {videosLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-mesa-light/40 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <p className="text-sand/30 text-sm">no videos scored yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {videos.map(v => (
              <div key={v.id} className="flex items-center gap-3 bg-mesa-light/50 border border-periwinkle/10 rounded-xl px-4 py-3 hover:border-periwinkle/20 transition-colors">
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${v.passed ? 'bg-desert-sky/70' : 'bg-red-rock/50'}`} />
                    <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-white/80 hover:text-desert-sky truncate transition-colors">{v.title}</a>
                  </div>
                  <div className="flex items-center gap-3 pl-3.5">
                    <span className="text-xs text-sand/40">{v.channelName}</span>
                    <span className="text-xs text-periwinkle/50">{v.scores?.overall.toFixed(1)}</span>
                    {v.manuallyAdded && <span className="text-xs text-desert-sky/40">manual</span>}
                  </div>
                </div>
                <button onClick={() => handleRemove(v.id, v.title)}
                  className="text-xs text-red-rock/30 hover:text-red-rock transition-colors shrink-0 px-2 py-1 rounded-lg hover:bg-red-rock/10">
                  remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// ── Team ──────────────────────────────────────────────────────────────────────

function TeamTab() {
  const [searchEmail, setSearchEmail] = useState('')
  const [found, setFound] = useState<UserProfile | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [updating, setUpdating] = useState(false)
  const [updateMsg, setUpdateMsg] = useState('')
  const [team, setTeam] = useState<UserProfile[]>([])

  useEffect(() => {
    getTeamMembers().then(setTeam).catch(() => {})
  }, [])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSearchError(''); setFound(null); setUpdateMsg('')
    setSearching(true)
    try {
      const user = await getUserByEmail(searchEmail.trim().toLowerCase())
      if (!user) { setSearchError('no account found for that email'); return }
      setFound(user)
    } catch { setSearchError('search failed') }
    finally { setSearching(false) }
  }

  async function handleSetRole(uid: string, role: 'user' | 'mod' | 'admin') {
    setUpdating(true)
    try {
      await setUserRole(uid, role)
      setFound(prev => prev ? { ...prev, role } : prev)
      setTeam(prev => {
        const updated = prev.map(m => m.uid === uid ? { ...m, role } : m)
        if (role === 'user') return updated.filter(m => m.uid !== uid)
        if (!prev.find(m => m.uid === uid) && found) return [...prev, { ...found, role }]
        return updated
      })
      setUpdateMsg(`role updated to ${role}.`)
      setTimeout(() => setUpdateMsg(''), 3000)
    } catch { setUpdateMsg('update failed') }
    finally { setUpdating(false) }
  }

  return (
    <div className="flex flex-col gap-10">

      {/* current team */}
      <section>
        <h2 className="text-lg font-medium text-periwinkle-light mb-5">team members</h2>
        {team.length === 0 ? <p className="text-sand/30 text-sm">no team members found.</p> : (
          <div className="flex flex-col gap-2">
            {team.map(m => (
              <div key={m.uid} className="flex items-center justify-between gap-4 bg-mesa-light/50 border border-periwinkle/10 rounded-xl px-5 py-3.5">
                <div>
                  <p className="text-sm text-white/80">{m.displayName || 'unnamed'}</p>
                  <p className="text-xs text-sand/40">{m.email}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${
                  m.role === 'admin'
                    ? 'bg-periwinkle/20 border-periwinkle/40 text-periwinkle-light'
                    : 'bg-desert-sky/10 border-desert-sky/30 text-desert-sky/70'
                }`}>
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* promote / demote */}
      <section>
        <h2 className="text-lg font-medium text-periwinkle-light mb-6">manage access</h2>
        <form onSubmit={handleSearch} className="flex gap-3 mb-4">
          <input type="email" value={searchEmail} onChange={e => setSearchEmail(e.target.value)}
            placeholder="user email address" required className={`flex-1 ${inputCls}`} />
          <button type="submit" disabled={searching || !searchEmail.trim()}
            className="bg-mesa-light border border-periwinkle/30 hover:border-periwinkle/60 text-periwinkle-light font-medium px-6 py-3 rounded-xl transition-colors text-sm disabled:opacity-40">
            {searching ? 'searching...' : 'find user'}
          </button>
        </form>

        {searchError && <p className="text-sm text-red-rock/70 mb-4">{searchError}</p>}
        {updateMsg && <p className="text-sm text-periwinkle-light/70 mb-4">{updateMsg}</p>}

        {found && (
          <div className="bg-mesa-light/60 border border-periwinkle/20 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-sm text-white font-medium">{found.displayName || 'unnamed'}</p>
                <p className="text-xs text-sand/50">{found.email}</p>
                <p className="text-xs text-sand/30 mt-1">current role: <span className="text-periwinkle/70">{found.role || 'user'}</span></p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['user', 'mod', 'admin'] as const).map(role => (
                <button key={role} disabled={updating || found.role === role}
                  onClick={() => handleSetRole(found.uid, role)}
                  className={`text-sm px-4 py-2 rounded-xl border transition-all disabled:opacity-40 ${
                    found.role === role
                      ? 'bg-periwinkle/20 border-periwinkle/40 text-periwinkle-light cursor-default'
                      : 'bg-mesa-light border-periwinkle/20 text-sand/60 hover:border-periwinkle/50 hover:text-white'
                  }`}>
                  {role === found.role ? `${role} (current)` : `set ${role}`}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

// ── Shared UI helpers ─────────────────────────────────────────────────────────

const inputCls = 'bg-mesa-light border border-periwinkle/20 rounded-xl px-4 py-3 text-white placeholder:text-sand/25 text-sm outline-none focus:border-periwinkle/50 transition-colors w-full'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-sand/50 tracking-widest">{label}</label>
      {children}
    </div>
  )
}

function TagPicker({ selected, onToggle }: { selected: string[]; onToggle: (tag: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-sand/50 tracking-widest">tags</label>
      <div className="flex flex-wrap gap-2">
        {CANONICAL_TAGS.map(tag => (
          <button key={tag} type="button" onClick={() => onToggle(tag)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              selected.includes(tag)
                ? 'bg-periwinkle/25 border-periwinkle/60 text-periwinkle-light'
                : 'bg-mesa-light border-periwinkle/20 text-sand/40 hover:border-periwinkle/35'
            }`}>
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}
