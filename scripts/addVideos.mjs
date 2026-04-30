/**
 * Manually curate 15 videos into the feed using YouTube API + Firestore REST API.
 * Uses Firebase CLI's stored OAuth token so no service account needed.
 */
import { google } from 'googleapis'
import { readFileSync } from 'fs'
import { homedir } from 'os'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const PROJECT_ID = 'clearthesignal'
const TARGET = 3

// ── Auth ──────────────────────────────────────────────────────────────────────

function getAccessToken() {
  const path = `${homedir()}/.config/configstore/firebase-tools.json`
  const cfg = JSON.parse(readFileSync(path, 'utf8'))
  return cfg.tokens.access_token
}

// ── Firestore REST helpers ────────────────────────────────────────────────────

const FS_REST = `https://firestore.googleapis.com/v1`
const FS_DOCS = `projects/${PROJECT_ID}/databases/(default)/documents`

async function docExists(videoId, token) {
  const r = await fetch(`${FS_REST}/${FS_DOCS}/videos/${videoId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return r.status === 200
}

function toFsValue(v) {
  if (v === null || v === undefined) return { nullValue: null }
  if (typeof v === 'boolean') return { booleanValue: v }
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v }
  if (typeof v === 'string') return { stringValue: v }
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toFsValue) } }
  if (typeof v === 'object') {
    return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, val]) => [k, toFsValue(val)])) } }
  }
  return { stringValue: String(v) }
}

async function writeVideo(videoId, data, token) {
  const fields = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, toFsValue(v)]))
  const body = {
    writes: [{
      update: { name: `${FS_DOCS}/videos/${videoId}`, fields },
      updateTransforms: [{ fieldPath: 'scoredAt', setToServerValue: 'REQUEST_TIME' }],
    }]
  }
  const r = await fetch(`${FS_REST}/${FS_DOCS}:batchWrite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
  if (!r.ok) {
    const text = await r.text()
    throw new Error(`Firestore write failed ${r.status}: ${text}`)
  }
}

// ── YouTube helpers ───────────────────────────────────────────────────────────

const youtube = google.youtube({ version: 'v3', auth: YOUTUBE_API_KEY })

async function searchOne(query) {
  const res = await youtube.search.list({
    part: ['snippet'], q: query, type: ['video'], maxResults: 5,
    order: 'relevance', videoDuration: 'medium', relevanceLanguage: 'en',
    safeSearch: 'strict',
  })
  const items = res.data.items ?? []
  // skip shorts (duration check not in search API; filter by title heuristic)
  return items.map(i => i.id?.videoId).filter(Boolean)
}

async function getVideoMeta(videoIds) {
  const res = await youtube.videos.list({
    part: ['snippet', 'contentDetails', 'statistics'],
    id: videoIds,
  })
  return (res.data.items ?? []).filter(v => {
    // filter out very short videos (< 5 min) — likely clips/shorts
    const dur = v.contentDetails?.duration ?? ''
    const match = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return false
    const totalSec = (parseInt(match[1] ?? 0) * 3600) + (parseInt(match[2] ?? 0) * 60) + parseInt(match[3] ?? 0)
    return totalSec >= 300
  })
}

// ── Queries to hunt ───────────────────────────────────────────────────────────

const QUERIES = [
  { q: 'Elizabeth April awakening consciousness 2024', tags: ['consciousness', 'synchronicity'] },
  { q: 'Elizabeth April galactic awakening ET contact', tags: ['consciousness', 'uap', 'synchronicity'] },
  { q: 'Elizabeth April channeling consciousness shift', tags: ['consciousness', 'synchronicity'] },
  { q: 'Lue Elizondo interview 2025 UAP disclosure', tags: ['uap', 'disclosure'] },
  { q: 'Ross Coulthart UAP investigation 2025', tags: ['uap', 'disclosure'] },
  { q: 'Garry Nolan UAP materials science Stanford', tags: ['uap', 'science'] },
  { q: 'David Grusch UAP whistleblower interview 2024', tags: ['uap', 'disclosure'] },
  { q: 'Donald Hoffman consciousness reality interview 2024', tags: ['consciousness', 'science'] },
  { q: 'Bernardo Kastrup idealism consciousness interview 2024', tags: ['consciousness', 'philosophy'] },
  { q: 'Tom Campbell My Big TOE consciousness physics 2024', tags: ['consciousness', 'science'] },
  { q: 'Dean Radin psi consciousness research IONS 2024', tags: ['consciousness', 'science'] },
  { q: 'Joe Dispenza breaking habit being yourself meditation 2024', tags: ['consciousness', 'manifestation'] },
  { q: 'Rupert Sheldrake morphic resonance consciousness 2024', tags: ['consciousness', 'science'] },
  { q: 'Graham Hancock consciousness ancient mysteries 2024', tags: ['consciousness', 'synchronicity'] },
  { q: 'Eben Alexander near death experience consciousness 2024', tags: ['consciousness', 'nde'] },
  { q: 'The Why Files UAP episode 2024', tags: ['uap', 'disclosure'] },
  { q: 'Paul Wallis 5th Kind ancient contact consciousness', tags: ['consciousness', 'uap'] },
  { q: 'Nassim Haramein unified field consciousness physics 2024', tags: ['consciousness', 'science', 'energy'] },
  { q: 'Ryan Graves UAP pilot testimony 2024', tags: ['uap', 'disclosure'] },
  { q: 'Matias De Stefano consciousness universe 2024', tags: ['consciousness', 'synchronicity'] },
  { q: 'Sadhguru consciousness inner engineering 2024', tags: ['consciousness', 'energy'] },
  { q: 'Gregg Braden heart intelligence coherence 2024', tags: ['consciousness', 'energy', 'science'] },
  { q: 'NDE near death experience science research 2024', tags: ['consciousness', 'science'] },
]

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const token = getAccessToken()
  console.log('Token loaded, starting search...\n')

  const added = []
  const seen = new Set()

  for (const { q, tags } of QUERIES) {
    if (added.length >= TARGET) break

    console.log(`Searching: "${q}"`)
    let videoIds
    try { videoIds = await searchOne(q) } catch (e) { console.log(`  search error: ${e.message}`); continue }
    if (!videoIds.length) { console.log('  no results'); continue }

    // get metadata for candidates
    let metas
    try { metas = await getVideoMeta(videoIds.slice(0, 5)) } catch (e) { console.log(`  meta error: ${e.message}`); continue }

    for (const v of metas) {
      const vid = v.id
      if (!vid || seen.has(vid)) continue
      seen.add(vid)

      const exists = await docExists(vid, token)
      if (exists) { console.log(`  ${vid} already in feed, skipping`); continue }

      const sn = v.snippet
      const data = {
        videoId: vid,
        title: sn?.title ?? '',
        channelName: sn?.channelTitle ?? '',
        channelId: sn?.channelId ?? '',
        thumbnailUrl: sn?.thumbnails?.high?.url ?? sn?.thumbnails?.medium?.url ?? sn?.thumbnails?.default?.url ?? '',
        youtubeUrl: `https://www.youtube.com/watch?v=${vid}`,
        publishedAt: sn?.publishedAt ?? new Date().toISOString(),
        description: (sn?.description ?? '').slice(0, 500),
        tags,
        passed: true,
        manuallyAdded: true,
        scores: { novelty: 5, credibility: 5, toneAlignment: 5, signalDensity: 5, timingRelevance: 5, overall: 5 },
        scoreRationale: 'Manually curated by the team.',
      }

      try {
        await writeVideo(vid, data, token)
        added.push({ vid, title: data.title, channel: data.channelName })
        console.log(`  ADDED [${added.length}/${TARGET}]: ${data.title.slice(0, 60)}`)
        break // move to next query
      } catch (e) {
        console.log(`  write error: ${e.message}`)
      }
    }
  }

  console.log(`\nDone. Added ${added.length} videos:`)
  added.forEach((v, i) => console.log(`  ${i + 1}. ${v.title} — ${v.channel}`))
}

main().catch(err => { console.error(err); process.exit(1) })
