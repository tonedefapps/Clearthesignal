'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { createSignalPost, deleteSignalPost, getSignalPosts, type SignalPost } from '@/lib/firebase/signal'
import { getRecentVideos, removeVideo, getVideoStats, approveVideo, rejectVideo, setAmplified, getAmplifiedVideo, updateAmplifiedAnalysis, type VideoSummary } from '@/lib/firebase/videos'
import { getUserByEmail, setUserRole, getTeamMembers, type UserProfile } from '@/lib/firebase/users'
import { getChannels, setChannelTier, addChannel, type ChannelRecord, type ChannelTier } from '@/lib/firebase/channels'
import { CANONICAL_TAGS } from '@/lib/constants/tags'
import { getDb, doc, getDoc, setDoc, updateDoc, serverTimestamp } from '@/lib/firebase/server'
import SiteNav from '@/components/SiteNav'
import SocialTab from '@/components/admin/SocialTab'

type Tab = 'overview' | 'pipeline' | 'channels' | 'dispatch' | 'feed' | 'team' | 'social'

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
    { id: 'pipeline', label: 'pipeline' },
    { id: 'channels', label: 'channels' },
    { id: 'dispatch', label: 'dispatch' },
    { id: 'feed', label: 'feed' },
    ...(profile?.role === 'admin' ? [{ id: 'team' as Tab, label: 'team' }] : []),
    { id: 'social' as Tab, label: 'social' },
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
        <div className="flex gap-1 bg-mesa-light/60 border border-periwinkle/15 rounded-xl p-1 mb-8 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 text-sm py-2 px-3 rounded-lg transition-all whitespace-nowrap ${
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
        {tab === 'pipeline' && <PipelineTab />}
        {tab === 'channels' && <ChannelsTab />}
        {tab === 'dispatch' && <DispatchTab user={user} profile={profile} />}
        {tab === 'feed' && <FeedTab user={user} profile={profile} />}
        {tab === 'team' && profile?.role === 'admin' && <TeamTab />}
        {tab === 'social' && <SocialTab />}
      </div>
    </main>
  )
}

// ── Overview ─────────────────────────────────────────────────────────────────

function OverviewTab({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const [stats, setStats] = useState<{ passed: number; pending: number; total: number } | null>(null)
  const [postCount, setPostCount] = useState<number | null>(null)

  useEffect(() => {
    getVideoStats().then(setStats).catch(() => {})
    getSignalPosts(undefined, 200).then(posts => setPostCount(posts.length)).catch(() => {})
  }, [])

  const statCards = [
    { label: 'in feed', value: stats?.passed ?? '...', sub: 'approved & live' },
    { label: 'pending review', value: stats?.pending ?? '...', sub: 'awaiting approval', highlight: (stats?.pending ?? 0) > 0 },
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
          <div key={s.label} className={`border rounded-xl p-4 transition-colors ${
            'highlight' in s && s.highlight
              ? 'bg-desert-sky/10 border-desert-sky/30'
              : 'bg-mesa-light/60 border-periwinkle/15'
          }`}>
            <p className={`text-2xl font-medium ${'highlight' in s && s.highlight ? 'text-desert-sky' : 'text-periwinkle-light'}`}>{String(s.value)}</p>
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

// ── Pipeline ──────────────────────────────────────────────────────────────────

const SCORE_DIMS: { key: keyof VideoSummary['scores']; label: string }[] = [
  { key: 'novelty', label: 'novelty' },
  { key: 'credibility', label: 'credibility' },
  { key: 'toneAlignment', label: 'tone' },
  { key: 'signalDensity', label: 'signal' },
  { key: 'timingRelevance', label: 'timing' },
]

function ScorePip({ value }: { value: number }) {
  const color = value >= 4 ? 'bg-desert-sky' : value >= 3 ? 'bg-periwinkle/60' : 'bg-red-rock/60'
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= Math.round(value) ? color : 'bg-white/10'}`} />
        ))}
      </div>
      <span className="text-[10px] text-sand/40">{value.toFixed(1)}</span>
    </div>
  )
}

function getVideoStatus(v: VideoSummary): 'pending' | 'approved' | 'rejected' {
  if (v.status) return v.status
  if (v.manuallyAdded) return 'approved'
  return v.passed ? 'approved' : 'rejected'
}

function PipelineTab() {
  const [videos, setVideos] = useState<VideoSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [acting, setActing] = useState<string | null>(null)
  const [autoPublish, setAutoPublish] = useState(false)
  const [savingMode, setSavingMode] = useState(false)

  useEffect(() => {
    getRecentVideos(150).then(setVideos).catch(() => {}).finally(() => setLoading(false))
    getDoc(doc(getDb(), 'settings', 'pipeline'))
      .then(snap => { if (snap.exists()) setAutoPublish(snap.data().autoPublish ?? false) })
      .catch(() => {})
  }, [])

  const pipelineVideos = videos.filter(v => !v.manuallyAdded)
  const pendingCount  = pipelineVideos.filter(v => getVideoStatus(v) === 'pending').length
  const approvedCount = pipelineVideos.filter(v => getVideoStatus(v) === 'approved').length
  const rejectedCount = pipelineVideos.filter(v => getVideoStatus(v) === 'rejected').length
  const shown = filter === 'all' ? pipelineVideos : pipelineVideos.filter(v => getVideoStatus(v) === filter)

  async function handleApprove(videoId: string) {
    setActing(videoId)
    try {
      await approveVideo(videoId)
      setVideos(prev => prev.map(v => v.id === videoId ? { ...v, passed: true, status: 'approved' } : v))
    } finally { setActing(null) }
  }

  async function handleReject(videoId: string) {
    setActing(videoId)
    try {
      await rejectVideo(videoId)
      setVideos(prev => prev.map(v => v.id === videoId ? { ...v, passed: false, status: 'rejected' } : v))
    } finally { setActing(null) }
  }

  async function handleToggleAutoPublish() {
    const next = !autoPublish
    setSavingMode(true)
    try {
      await setDoc(doc(getDb(), 'settings', 'pipeline'), { autoPublish: next }, { merge: true })
      setAutoPublish(next)
    } finally { setSavingMode(false) }
  }

  return (
    <div className="flex flex-col gap-6">

      {/* pipeline mode toggle */}
      <div className="flex items-center justify-between bg-mesa-light/40 border border-periwinkle/15 rounded-xl px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-white/80">pipeline mode</span>
          <span className="text-xs text-sand/40">
            {autoPublish
              ? 'passing scores are auto-published to the feed'
              : 'passing scores go to pending review'}
          </span>
        </div>
        <button
          onClick={handleToggleAutoPublish}
          disabled={savingMode}
          className={`text-xs px-4 py-2 rounded-full border transition-all disabled:opacity-50 ${
            autoPublish
              ? 'bg-desert-sky/15 border-desert-sky/40 text-desert-sky hover:bg-desert-sky/25'
              : 'bg-periwinkle/10 border-periwinkle/30 text-periwinkle-light hover:bg-periwinkle/20'
          }`}
        >
          {autoPublish ? 'auto-publish' : 'queue'}
        </button>
      </div>

      {/* summary bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'pending', value: pendingCount, color: pendingCount > 0 ? 'text-desert-sky' : 'text-white' },
          { label: 'approved', value: approvedCount, color: 'text-periwinkle-light' },
          { label: 'rejected', value: rejectedCount, color: 'text-red-rock/80' },
          { label: 'total', value: pipelineVideos.length, color: 'text-white/50' },
        ].map(s => (
          <div key={s.label} className="bg-mesa-light/60 border border-periwinkle/15 rounded-xl p-4 text-center">
            <p className={`text-2xl font-medium ${s.color}`}>{s.value}</p>
            <p className="text-xs text-sand/40 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* filter pills */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-4 py-1.5 rounded-full border transition-all ${
              filter === f
                ? 'bg-periwinkle border-periwinkle text-white'
                : 'bg-mesa-light/60 border-periwinkle/20 text-sand/50 hover:border-periwinkle/40'
            }`}>
            {f}
          </button>
        ))}
        <span className="text-xs text-sand/30 self-center ml-2">threshold: 3.5 / 5</span>
      </div>

      {/* video list */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 bg-mesa-light/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <p className="text-sand/30 text-sm py-8 text-center">
          {filter === 'pending' ? 'no videos pending review.' : 'no pipeline results yet.'}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {shown.map(v => {
            const isOpen = expanded === v.id
            const vStatus = getVideoStatus(v)
            const date = v.scoredAt
              ? new Date(v.scoredAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : ''
            return (
              <div key={v.id}
                className={`border rounded-xl overflow-hidden transition-colors ${
                  vStatus === 'approved' ? 'border-desert-sky/20 bg-mesa-light/40' :
                  vStatus === 'pending'  ? 'border-periwinkle/30 bg-periwinkle/5' :
                                          'border-red-rock/15 bg-mesa-light/25'
                }`}>
                {/* row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : v.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    vStatus === 'approved' ? 'bg-desert-sky/80' :
                    vStatus === 'pending'  ? 'bg-periwinkle animate-pulse' :
                                            'bg-red-rock/60'
                  }`} />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className={`text-sm truncate ${vStatus !== 'rejected' ? 'text-white/85' : 'text-white/45'}`}>{v.title}</span>
                    <span className="text-xs text-sand/35">{v.channelName} · {date}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {vStatus === 'pending' && (
                      <span className="text-xs text-periwinkle/60 border border-periwinkle/30 rounded-full px-2 py-0.5">pending</span>
                    )}
                    <span className={`text-sm font-medium tabular-nums ${
                      v.scores.overall >= 4 ? 'text-desert-sky' :
                      v.scores.overall >= 3.5 ? 'text-periwinkle-light' :
                      'text-red-rock/70'
                    }`}>
                      {v.scores.overall.toFixed(1)}
                    </span>
                    <span className={`text-xs transition-transform duration-200 text-sand/30 ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                  </div>
                </button>

                {/* expanded detail */}
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-periwinkle/10 pt-3 flex flex-col gap-4">
                    {/* score breakdown */}
                    <div className="flex gap-6 flex-wrap">
                      {SCORE_DIMS.map(({ key, label }) => {
                        const val = v.scores[key]
                        return val !== undefined ? (
                          <div key={key} className="flex flex-col items-center gap-1.5">
                            <ScorePip value={val} />
                            <span className="text-[10px] text-sand/40 tracking-wide">{label}</span>
                          </div>
                        ) : null
                      })}
                    </div>

                    {v.scoreRationale && (
                      <p className="text-xs text-white/55 leading-relaxed border-l-2 border-periwinkle/20 pl-3">
                        {v.scoreRationale}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex gap-1.5 flex-wrap">
                        {v.tags.map(t => (
                          <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-periwinkle/10 border border-periwinkle/20 text-periwinkle-light/50">{t}</span>
                        ))}
                      </div>
                      <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-periwinkle/40 hover:text-periwinkle transition-colors shrink-0">
                        watch on youtube →
                      </a>
                    </div>

                    {/* approve / reject for pending videos */}
                    {vStatus === 'pending' && (
                      <div className="flex gap-3 pt-2 border-t border-periwinkle/10">
                        <button
                          onClick={() => handleApprove(v.id)}
                          disabled={acting === v.id}
                          className="flex-1 py-2 rounded-xl bg-desert-sky/15 border border-desert-sky/35 text-desert-sky text-sm hover:bg-desert-sky/25 transition-colors disabled:opacity-50"
                        >
                          approve → publish
                        </button>
                        <button
                          onClick={() => handleReject(v.id)}
                          disabled={acting === v.id}
                          className="flex-1 py-2 rounded-xl bg-red-rock/10 border border-red-rock/25 text-red-rock/70 text-sm hover:bg-red-rock/20 transition-colors disabled:opacity-50"
                        >
                          reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Channels ──────────────────────────────────────────────────────────────────

const TIER_META: Record<ChannelTier, { label: string; cls: string }> = {
  trusted: { label: 'trusted', cls: 'bg-desert-sky/15 border-desert-sky/40 text-desert-sky' },
  watch:   { label: 'watch',   cls: 'bg-periwinkle/10 border-periwinkle/30 text-periwinkle-light/70' },
  noise:   { label: 'noise',   cls: 'bg-red-rock/15 border-red-rock/35 text-red-rock/80' },
}

function parseChannelId(input: string): string {
  const trimmed = input.trim()
  // youtube.com/channel/UC...
  const channelMatch = trimmed.match(/youtube\.com\/channel\/(UC[\w-]+)/)
  if (channelMatch) return channelMatch[1]
  // youtube.com/@handle — can't resolve to ID client-side, return as-is
  // Raw ID: starts with UC, ~24 chars
  if (/^UC[\w-]{20,}$/.test(trimmed)) return trimmed
  return trimmed
}

function ChannelsTab() {
  const [channels, setChannels] = useState<ChannelRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<ChannelTier | 'all'>('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [addName, setAddName] = useState('')
  const [addId, setAddId] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')

  useEffect(() => {
    getChannels().then(setChannels).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function handleTier(channelId: string, tier: ChannelTier) {
    setUpdating(channelId)
    try {
      await setChannelTier(channelId, tier)
      setChannels(prev => prev.map(c => c.channelId === channelId ? { ...c, tier, addedBy: 'admin' } : c))
    } catch { /* ignore */ }
    finally { setUpdating(null) }
  }

  async function handleAddChannel(e: React.FormEvent) {
    e.preventDefault()
    setAddError(''); setAddSuccess('')
    const channelId = parseChannelId(addId)
    const channelName = addName.trim()
    if (!channelName || !channelId) { setAddError('channel name and ID are required'); return }
    if (channels.some(c => c.channelId === channelId)) {
      setAddError('channel already exists — use the tier buttons below to change it'); return
    }
    setAdding(true)
    try {
      await addChannel({ channelId, channelName, tier: 'trusted' })
      const newRecord: ChannelRecord = {
        channelId, channelName, tier: 'trusted', addedBy: 'admin',
        avgScore: 0, passRate: 0, videoCount: 0, notes: '',
      }
      setChannels(prev => [newRecord, ...prev])
      setAddName(''); setAddId('')
      setAddSuccess(`"${channelName}" added as trusted.`)
      setTimeout(() => setAddSuccess(''), 4000)
    } catch { setAddError('failed to add channel') }
    finally { setAdding(false) }
  }

  const shown = channels.filter(c => filter === 'all' || c.tier === filter)
  const counts = { trusted: 0, watch: 0, noise: 0 }
  channels.forEach(c => counts[c.tier]++)

  return (
    <div className="flex flex-col gap-6">

      {/* manual add */}
      <div className="bg-mesa-light/60 border border-periwinkle/15 rounded-xl p-5">
        <p className="text-xs text-sand/40 tracking-widest mb-4">add channel</p>
        {addError && <p className="text-sm text-red-rock/70 mb-3">{addError}</p>}
        {addSuccess && <p className="text-sm text-desert-sky/80 mb-3">{addSuccess}</p>}
        <form onSubmit={handleAddChannel} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="channel name"
            value={addName}
            onChange={e => setAddName(e.target.value)}
            className={inputCls + ' flex-1'}
          />
          <input
            type="text"
            placeholder="channel ID or youtube.com/channel/UC… URL"
            value={addId}
            onChange={e => setAddId(e.target.value)}
            className={inputCls + ' flex-1'}
          />
          <button
            type="submit"
            disabled={adding || !addName.trim() || !addId.trim()}
            className="shrink-0 bg-desert-sky/15 border border-desert-sky/40 text-desert-sky text-sm font-medium px-5 py-3 rounded-xl hover:bg-desert-sky/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {adding ? 'adding...' : '+ Add as Trusted'}
          </button>
        </form>
        <p className="text-xs text-sand/25 mt-2">
          channel ID: open the channel on YouTube → the URL contains <span className="font-mono">/channel/UC…</span>
        </p>
      </div>

      {/* summary */}
      <div className="grid grid-cols-3 gap-3">
        {(Object.entries(TIER_META) as [ChannelTier, typeof TIER_META[ChannelTier]][]).map(([tier, meta]) => (
          <div key={tier} className={`border rounded-xl p-4 text-center ${meta.cls}`}>
            <p className="text-2xl font-medium">{counts[tier]}</p>
            <p className="text-xs mt-1 opacity-70">{meta.label}</p>
          </div>
        ))}
      </div>

      {/* filter + legend */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {(['all', 'trusted', 'watch', 'noise'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs px-4 py-1.5 rounded-full border transition-all ${
                filter === f
                  ? 'bg-periwinkle border-periwinkle text-white'
                  : 'bg-mesa-light/60 border-periwinkle/20 text-sand/50 hover:border-periwinkle/40'
              }`}>
              {f}
            </button>
          ))}
        </div>
        <p className="text-xs text-sand/30">channels auto-populate as the pipeline runs</p>
      </div>

      {/* list */}
      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-mesa-light/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <p className="text-sand/30 text-sm py-8 text-center">
          {channels.length === 0
            ? 'no channels yet. run the pipeline and they will appear here automatically.'
            : 'no channels in this tier.'}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {shown.map(c => {
            const meta = TIER_META[c.tier]
            const passPercent = c.videoCount > 0 ? Math.round(c.passRate * 100) : null
            const lastSeen = c.lastSeen
              ? new Date(c.lastSeen.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : null
            return (
              <div key={c.channelId}
                className="flex items-center gap-4 bg-mesa-light/50 border border-periwinkle/10 rounded-xl px-5 py-3.5 hover:border-periwinkle/20 transition-colors">

                {/* name + stats */}
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white/80 truncate">{c.channelName}</span>
                    {c.addedBy === 'admin' && (
                      <span className="text-[10px] text-periwinkle/40 shrink-0">admin</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-sand/35">
                    <span>{c.videoCount} video{c.videoCount !== 1 ? 's' : ''}</span>
                    {c.videoCount > 0 && (
                      <>
                        <span>avg {c.avgScore.toFixed(1)}</span>
                        <span className={passPercent !== null && passPercent >= 50 ? 'text-desert-sky/50' : 'text-red-rock/50'}>
                          {passPercent}% pass
                        </span>
                      </>
                    )}
                    {lastSeen && <span>last seen {lastSeen}</span>}
                  </div>
                </div>

                {/* tier buttons */}
                <div className="flex gap-1.5 shrink-0">
                  {(Object.keys(TIER_META) as ChannelTier[]).map(tier => (
                    <button
                      key={tier}
                      disabled={updating === c.channelId || c.tier === tier}
                      onClick={() => handleTier(c.channelId, tier)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all disabled:cursor-default ${
                        c.tier === tier
                          ? TIER_META[tier].cls + ' font-medium'
                          : 'border-periwinkle/15 text-sand/30 hover:border-periwinkle/35 hover:text-sand/60'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
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
  const [videoRationale, setVideoRationale] = useState('')
  const [fetching, setFetching] = useState(false)
  const [adding, setAdding] = useState(false)
  const [videoError, setVideoError] = useState('')
  const [videoSuccess, setVideoSuccess] = useState('')
  const [videos, setVideos] = useState<VideoSummary[]>([])
  const [videosLoading, setVideosLoading] = useState(true)
  const [amplifiedId, setAmplifiedId] = useState<string | null>(null)
  const [amplifyingId, setAmplifyingId] = useState<string | null>(null)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [generateStatus, setGenerateStatus] = useState<Record<string, { label: string; count: number; date: string; source?: string; items: Array<{ text: string; ts?: string }> } | 'error' | 'no_transcript'>>({})
  const [editingAnalysis, setEditingAnalysis] = useState(false)
  const [editLabel, setEditLabel] = useState('')
  const [editItems, setEditItems] = useState<string[]>([])
  const [savingAnalysis, setSavingAnalysis] = useState(false)
  const [contextText, setContextText] = useState('')
  const [showContextInput, setShowContextInput] = useState(false)

  useEffect(() => {
    getRecentVideos(30).then(setVideos).catch(() => {}).finally(() => setVideosLoading(false))
    getAmplifiedVideo().then(v => { if (v) setAmplifiedId(v.id) }).catch(() => {})
  }, [])

  async function handleFetchVideo(e: React.FormEvent) {
    e.preventDefault()
    setVideoError(''); setVideoMeta(null); setVideoTags([]); setVideoRationale('')
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
        scoreRationale: videoRationale.trim() || 'Manually curated by the team.',
        passed: true, status: 'approved', tags: videoTags, scoredAt: serverTimestamp(), manuallyAdded: true,
      })
      setVideoSuccess('added to feed.')
      setVideoUrl(''); setVideoMeta(null); setVideoTags([]); setVideoRationale('')
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

  async function handleAmplify(videoId: string) {
    setAmplifyingId(videoId)
    try {
      await setAmplified(videoId)
      setAmplifiedId(videoId)
    } catch { /* ignore */ }
    finally { setAmplifyingId(null) }
  }

  function normalizeItems(items: Array<string | { text: string; ts?: string }>): string[] {
    return items.map(i => {
      if (typeof i === 'string') return i
      return i.ts ? `[${i.ts}] ${i.text}` : i.text
    })
  }

  function startEditAnalysis(analysis: { label: string; items: Array<string | { text: string; ts?: string }> }) {
    setEditLabel(analysis.label)
    setEditItems(normalizeItems(analysis.items))
    setEditingAnalysis(true)
  }

  async function saveAnalysis(videoId: string) {
    setSavingAnalysis(true)
    try {
      const items = editItems.map(i => i.trim()).filter(Boolean)
      await updateAmplifiedAnalysis(videoId, { label: editLabel.trim(), items })
      setVideos(prev => prev.map(v =>
        v.id === videoId && v.amplifiedAnalysis
          ? { ...v, amplifiedAnalysis: { ...v.amplifiedAnalysis, label: editLabel.trim(), items } }
          : v
      ))
      setGenerateStatus(prev => {
        const cur = prev[videoId]
        if (cur && typeof cur === 'object') {
          return { ...prev, [videoId]: { ...cur, label: editLabel.trim(), count: items.length } }
        }
        return prev
      })
      setEditingAnalysis(false)
    } catch { /* ignore */ }
    finally { setSavingAnalysis(false) }
  }

  async function handleGenerate(videoId: string) {
    if (!user) return
    setGeneratingId(videoId)
    setShowContextInput(false)
    try {
      const token = await user.getIdToken()

      // Fetch transcript from Edge route (Cloudflare IPs — bypasses YouTube's cloud IP blocks)
      let transcriptContext: string | undefined = contextText.trim() || undefined
      if (!transcriptContext) {
        const txRes = await fetch(`/api/youtube-transcript?videoId=${videoId}`)
        if (txRes.ok) {
          const txData = await txRes.json()
          if (txData.transcript) transcriptContext = txData.transcript
        }
      }

      const res = await fetch('/api/admin/generate-amplified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ videoId, context: transcriptContext }),
      })
      const data = await res.json()
      if (!res.ok) {
        setGenerateStatus(prev => ({ ...prev, [videoId]: data.error === 'no_content' ? 'no_transcript' : 'error' }))
        return
      }
      const items: Array<{ text: string; ts?: string }> = data.items ?? []
      setGenerateStatus(prev => ({
        ...prev,
        [videoId]: {
          label: data.label,
          count: items.length,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          source: data.source,
          items,
        },
      }))
      startEditAnalysis({ label: data.label, items })
    } catch {
      setGenerateStatus(prev => ({ ...prev, [videoId]: 'error' }))
    } finally {
      setGeneratingId(null)
    }
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
            <Field label="signal note">
              <textarea
                value={videoRationale}
                onChange={e => setVideoRationale(e.target.value)}
                placeholder="why does this belong in the signal? shown on the video page..."
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </Field>
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
            {videos.map(v => {
              const isAmplified = amplifiedId === v.id
              const genResult = generateStatus[v.id]
              return (
                <div key={v.id} className={`flex flex-col bg-mesa-light/50 border rounded-xl px-4 py-3 transition-colors ${
                  isAmplified ? 'border-sun/30 bg-sun/5' : 'border-periwinkle/10 hover:border-periwinkle/20'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${v.passed ? 'bg-desert-sky/70' : 'bg-red-rock/50'}`} />
                        <a href={v.youtubeUrl} target="_blank" rel="noopener noreferrer"
                          className="text-sm text-white/80 hover:text-desert-sky truncate transition-colors">{v.title}</a>
                        {isAmplified && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sun/20 border border-sun/40 text-sun shrink-0">amplified</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 pl-3.5">
                        <span className="text-xs text-sand/40">{v.channelName}</span>
                        <span className="text-xs text-periwinkle/50">{v.scores?.overall.toFixed(1)}</span>
                        {v.manuallyAdded && <span className="text-xs text-desert-sky/40">manual</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!isAmplified && (
                        <button
                          onClick={() => handleAmplify(v.id)}
                          disabled={amplifyingId === v.id}
                          className="text-xs text-sun/50 hover:text-sun transition-colors px-2 py-1 rounded-lg hover:bg-sun/10 disabled:opacity-40"
                        >
                          {amplifyingId === v.id ? 'setting...' : 'amplify'}
                        </button>
                      )}
                      <button onClick={() => handleRemove(v.id, v.title)}
                        className="text-xs text-red-rock/30 hover:text-red-rock transition-colors px-2 py-1 rounded-lg hover:bg-red-rock/10">
                        remove
                      </button>
                    </div>
                  </div>

                  {/* Amplified controls row */}
                  {isAmplified && (
                    <div className="mt-2 pt-2 border-t border-sun/15 pl-3.5 flex flex-col gap-3">
                      {/* status + action buttons */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {genResult && typeof genResult === 'object' ? (
                          <span className="text-xs text-sun/60">
                            ready · {genResult.date} · {genResult.count} items · "{genResult.label}"
                            {genResult.source === 'description' && <span className="text-sun/40"> · from description</span>}
                          </span>
                        ) : genResult === 'no_transcript' ? (
                          <span className="text-xs text-red-rock/60">no transcript or description available — try a different video</span>
                        ) : genResult === 'error' ? (
                          <span className="text-xs text-red-rock/60">generation failed</span>
                        ) : v.amplifiedAnalysis ? (
                          <span className="text-xs text-sun/50">
                            ready · {new Date((v.amplifiedAnalysis.generatedAt as { seconds: number }).seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {v.amplifiedAnalysis.items.length} items · "{v.amplifiedAnalysis.label}"
                          </span>
                        ) : null}

                        <button
                          onClick={() => handleGenerate(v.id)}
                          disabled={generatingId === v.id}
                          className="text-xs text-sun/60 hover:text-sun transition-colors px-2 py-1 rounded-lg hover:bg-sun/10 disabled:opacity-40"
                        >
                          {generatingId === v.id ? 'generating...' : (genResult || v.amplifiedAnalysis) ? 're-generate' : 'generate'}
                        </button>
                        <button
                          onClick={() => {
                            const opening = !showContextInput
                            setShowContextInput(opening)
                            if (opening) window.open(`https://www.youtube.com/watch?v=${v.id}`, '_blank')
                          }}
                          className="text-xs text-periwinkle/40 hover:text-periwinkle-light transition-colors px-2 py-1 rounded-lg hover:bg-periwinkle/10"
                        >
                          {showContextInput ? 'hide context' : 'add context'}
                        </button>

                        {/* edit button — only when analysis exists */}
                        {(v.amplifiedAnalysis || (genResult && typeof genResult === 'object')) && !editingAnalysis && (
                          <button
                            onClick={() => {
                              const src = genResult && typeof genResult === 'object'
                                ? { label: genResult.label, items: genResult.items.length > 0 ? genResult.items : (v.amplifiedAnalysis?.items ?? []) }
                                : { label: v.amplifiedAnalysis!.label, items: v.amplifiedAnalysis!.items }
                              startEditAnalysis(src)
                            }}
                            className="text-xs text-periwinkle/50 hover:text-periwinkle-light transition-colors px-2 py-1 rounded-lg hover:bg-periwinkle/10"
                          >
                            edit
                          </button>
                        )}
                      </div>

                      {/* context paste field */}
                      {showContextInput && !editingAnalysis && (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] text-sand/40 tracking-widest">paste transcript or notes for claude</label>
                            <a
                              href={`https://youtube.com/watch?v=${v.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-periwinkle/50 hover:text-periwinkle-light transition-colors"
                              title="Open video on YouTube — click ··· → Show transcript, then copy all"
                            >
                              open transcript on youtube ↗
                            </a>
                          </div>
                          <textarea
                            value={contextText}
                            onChange={e => setContextText(e.target.value)}
                            placeholder="paste the video transcript here (include timestamps for best results)..."
                            rows={5}
                            className="bg-mesa-light border border-periwinkle/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-sand/20 outline-none focus:border-periwinkle/50 transition-colors resize-none"
                          />
                          <p className="text-[10px] text-sand/30">on youtube: click ··· → show transcript → toggle timestamps on → copy all</p>
                        </div>
                      )}

                      {/* inline edit form */}
                      {editingAnalysis && (
                        <div className="flex flex-col gap-3 bg-mesa/60 border border-sun/15 rounded-xl p-4">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-sand/40 tracking-widest">label</label>
                            <input
                              type="text"
                              value={editLabel}
                              onChange={e => setEditLabel(e.target.value)}
                              className="bg-mesa-light border border-periwinkle/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-sand/25 outline-none focus:border-periwinkle/50 transition-colors"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] text-sand/40 tracking-widest">items</label>
                            {editItems.map((item, i) => (
                              <div key={i} className="flex gap-2 items-start">
                                <span className="text-xs text-periwinkle/30 tabular-nums pt-2.5 w-5 shrink-0">{i + 1}.</span>
                                <textarea
                                  value={item}
                                  onChange={e => setEditItems(prev => prev.map((x, j) => j === i ? e.target.value : x))}
                                  rows={2}
                                  className="flex-1 bg-mesa-light border border-periwinkle/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-sand/25 outline-none focus:border-periwinkle/50 transition-colors resize-none"
                                />
                                <button
                                  onClick={() => setEditItems(prev => prev.filter((_, j) => j !== i))}
                                  className="text-xs text-red-rock/30 hover:text-red-rock transition-colors pt-2"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => setEditItems(prev => [...prev, ''])}
                              className="text-xs text-periwinkle/40 hover:text-periwinkle-light transition-colors self-start mt-1"
                            >
                              + add item
                            </button>
                          </div>
                          <div className="flex gap-3 pt-1">
                            <button
                              onClick={() => saveAnalysis(v.id)}
                              disabled={savingAnalysis}
                              className="text-xs bg-periwinkle/20 border border-periwinkle/40 text-periwinkle-light px-4 py-2 rounded-lg hover:bg-periwinkle/30 transition-colors disabled:opacity-40"
                            >
                              {savingAnalysis ? 'saving...' : 'save'}
                            </button>
                            <button
                              onClick={() => setEditingAnalysis(false)}
                              className="text-xs text-sand/40 hover:text-sand/70 transition-colors px-4 py-2"
                            >
                              cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
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
