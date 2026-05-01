import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const INNERTUBE_API = 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false'
const INNERTUBE_CLIENT_VERSION = '20.10.38'

async function fetchYoutubeTranscript(videoId: string): Promise<Array<{ offset: number; text: string }> | null> {
  try {
    const resp = await fetch(INNERTUBE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `com.google.android.youtube/${INNERTUBE_CLIENT_VERSION} (Linux; U; Android 14)`,
        'X-Goog-Api-Format-Version': '2',
      },
      body: JSON.stringify({
        context: { client: { clientName: 'ANDROID', clientVersion: INNERTUBE_CLIENT_VERSION } },
        videoId,
      }),
    })
    console.log('[amplified] innertube status:', resp.status)
    if (!resp.ok) return null

    const data = await resp.json()
    const tracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks
    if (!Array.isArray(tracks) || tracks.length === 0) {
      console.log('[amplified] no caption tracks found')
      return null
    }

    const track = tracks.find((t: { languageCode: string }) => t.languageCode === 'en') ?? tracks[0]
    console.log('[amplified] caption track lang:', track?.languageCode)

    const xmlResp = await fetch(track.baseUrl)
    console.log('[amplified] caption status:', xmlResp.status)
    if (!xmlResp.ok) return null

    const xml = await xmlResp.text()
    const segments: Array<{ offset: number; text: string }> = []
    // format=3: <p t="7205" d="2020" ...><s>word</s>...</p>  (t in ms)
    // legacy:   <text start="1.23" dur="0.5">word</text>     (start in s)
    const isFormat3 = xml.includes('<p t="')
    if (isFormat3) {
      const re = /<p t="(\d+)"[^>]*>([\s\S]*?)<\/p>/g
      let match
      while ((match = re.exec(xml)) !== null) {
        const raw = match[2].replace(/<[^>]*>/g, '')
          .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim()
        if (raw) segments.push({ offset: parseInt(match[1], 10), text: raw })
      }
    } else {
      const re = /<text start="([^"]*)"[^>]*>([^<]*)<\/text>/g
      let match
      while ((match = re.exec(xml)) !== null) {
        const text = match[2]
          .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim()
        if (text) segments.push({ offset: Math.round(parseFloat(match[1]) * 1000), text })
      }
    }
    console.log('[amplified] transcript segments:', segments.length)
    return segments.length > 0 ? segments : null
  } catch (e) {
    console.log('[amplified] transcript fetch exception:', String(e))
    return null
  }
}

const anthropic = new Anthropic()

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`

// Verify Firebase ID token and return UID
async function verifyToken(idToken: string): Promise<string | null> {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }
  )
  if (!res.ok) return null
  const data = await res.json()
  return data.users?.[0]?.localId ?? null
}

// Check user role via Firestore REST API using their own token
async function getUserRole(uid: string, idToken: string): Promise<string | null> {
  const res = await fetch(`${FIRESTORE_BASE}/users/${uid}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.fields?.role?.stringValue ?? null
}

// Fetch video doc via Firestore REST API
async function getVideoData(videoId: string, idToken: string): Promise<Record<string, string> | null> {
  const res = await fetch(`${FIRESTORE_BASE}/videos/${videoId}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  })
  if (!res.ok) return null
  const data = await res.json()
  const f = data.fields ?? {}
  return {
    title:       f.title?.stringValue ?? '',
    channelName: f.channelName?.stringValue ?? '',
    description: f.description?.stringValue ?? '',
  }
}

// Write amplifiedAnalysis back to Firestore using user's token
async function writeAnalysis(
  videoId: string,
  analysis: { label: string; contentType: string; items: Array<{ text: string; ts?: string }>; source: string },
  idToken: string
): Promise<void> {
  const res = await fetch(
    `${FIRESTORE_BASE}/videos/${videoId}?updateMask.fieldPaths=amplifiedAnalysis`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({
        fields: {
          amplifiedAnalysis: {
            mapValue: {
              fields: {
                label:       { stringValue: analysis.label },
                contentType: { stringValue: analysis.contentType },
                source:      { stringValue: analysis.source },
                items: {
                  arrayValue: {
                    values: analysis.items.map(item => ({
                      mapValue: {
                        fields: {
                          text: { stringValue: item.text },
                          ...(item.ts ? { ts: { stringValue: item.ts } } : {}),
                        },
                      },
                    })),
                  },
                },
                generatedAt: { timestampValue: new Date().toISOString() },
              },
            },
          },
        },
      }),
    }
  )
  if (!res.ok) {
    const body = await res.text()
    console.error('[amplified] firestore write failed:', res.status, body)
    throw new Error(`firestore write ${res.status}: ${body}`)
  }
  console.log('[amplified] firestore write ok, items:', analysis.items.length, 'sample ts:', analysis.items[0]?.ts)
}


export async function POST(req: NextRequest) {
  try {
    return await handlePost(req)
  } catch (e) {
    console.error('[amplified] unhandled error:', e)
    return NextResponse.json({ error: 'unhandled', detail: String(e) }, { status: 500 })
  }
}

async function handlePost(req: NextRequest) {
  // Verify Firebase ID token
  const authHeader = req.headers.get('authorization') || ''
  const idToken = authHeader.replace('Bearer ', '').trim()
  if (!idToken) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let uid: string | null
  try {
    uid = await verifyToken(idToken)
  } catch (e) {
    console.error('[amplified] token verify error:', e)
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  // Check admin/mod role
  let role: string | null
  try {
    role = await getUserRole(uid, idToken)
  } catch (e) {
    console.error('[amplified] role check error:', e)
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  if (!role || !['admin', 'mod'].includes(role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const { videoId, context } = await req.json()
  if (!videoId) return NextResponse.json({ error: 'videoId required' }, { status: 400 })

  // Fetch video metadata
  let videoData: Record<string, string> | null
  try {
    videoData = await getVideoData(videoId, idToken)
  } catch (e) {
    console.error('[amplified] video fetch error:', e)
    return NextResponse.json({ error: 'video not found' }, { status: 404 })
  }
  if (!videoData) return NextResponse.json({ error: 'video not found' }, { status: 404 })

  // Fetch transcript — admin-provided context wins, then transcript, then stored description, then knowledge
  let contentBlock: string
  if (context) {
    contentBlock = `CONTEXT (provided by editor — NO TIMESTAMPS AVAILABLE, omit timestamp prefix from items):\n${context.slice(0, 40000)}`
    console.log('[amplified] using admin-provided context')
  } else {
    const segments = await fetchYoutubeTranscript(videoId)
    if (segments && segments.length > 0) {
      const formatted = segments.map(s => {
        const sec = Math.floor(s.offset / 1000)
        const h = Math.floor(sec / 3600)
        const m = Math.floor((sec % 3600) / 60)
        const ss = sec % 60
        const ts = h > 0
          ? `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
          : `${m}:${String(ss).padStart(2, '0')}`
        return `[${ts}] ${s.text}`
      }).join(' ').slice(0, 40000)
      contentBlock = `TRANSCRIPT (with timestamps):\n${formatted}`
      console.log('[amplified] using transcript')
    } else {
      console.log('[amplified] no transcript available')
      const description = videoData.description
      if (description) {
        contentBlock = `VIDEO DESCRIPTION (no transcript available — NO TIMESTAMPS, omit timestamp prefix from items):\n${description}`
        console.log('[amplified] using stored description')
      } else {
        contentBlock = `NOTE: No transcript or description is available — NO TIMESTAMPS, omit timestamp prefix from items. Use your training knowledge of this specific video — its content, claims, and key moments — to complete the analysis. If you have no knowledge of this video, return your best inference from the title and channel alone.`
        console.log('[amplified] no content source, using Claude knowledge')
      }
    }
  }

  const prompt = `You are analyzing a YouTube video for Clear the Signal — a platform covering consciousness, UAP/disclosure, and human potential.

VIDEO: ${videoData.title}
CHANNEL: ${videoData.channelName}

${contentBlock}

Step 1 — determine content type:
- 'whistleblower': UAP/government/insider making direct claims
- 'researcher': scientist, academic, or investigator presenting findings
- 'teacher': meditation, consciousness, or spiritual teacher
- 'experiencer': NDE, contact, or anomalous experience account
- 'journalist': investigative reporter or documentary maker
- 'other': anything that doesn't fit above

Step 2 — choose a label (2–4 words, lowercase) that fits the content type:
- whistleblower → "key claims" / "key revelations" / "what she alleged"
- researcher → "key findings" / "research highlights"
- teacher → "core teachings" / "key insights"
- experiencer → "what she experienced" / "key moments"
- journalist → "what they uncovered" / "key findings"

Step 3 — extract only the points that genuinely earn their place. Quality over count — 5–8 is typical, but use fewer if the content warrants it. Each item:
- Is one punchy sentence, 20 words max. If you need more words, you have two points — split them or cut one.
- Leads with the specific claim or finding, not setup or context
- Is something a reader would find surprising or worth clicking for

Respond ONLY in this JSON format — no extra text:
{
  "contentType": "",
  "label": "",
  "items": [
    { "text": "point one", "ts": "4:32" },
    { "text": "point two", "ts": "12:05" }
  ]
}

If working from a timestamped transcript, set "ts" to the timestamp from the transcript where that point occurs. If no timestamps are available, omit the "ts" field entirely from each item.`

  let analysis: { contentType: string; label: string; items: Array<{ text: string; ts?: string }> }
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    })
    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('no JSON in response')
    analysis = JSON.parse(jsonMatch[0])
    console.log('[amplified] claude items sample:', JSON.stringify(analysis.items?.slice(0, 2)))
  } catch (err) {
    console.error('Claude error:', err)
    return NextResponse.json({ error: 'analysis_failed' }, { status: 500 })
  }

  // Write back to Firestore using user's token
  try {
    await writeAnalysis(videoId, { ...analysis, source: contentBlock.startsWith('TRANSCRIPT') ? 'transcript' : contentBlock.startsWith('VIDEO DESCRIPTION') ? 'description' : 'knowledge' }, idToken)
    console.log('[amplified] write success for', videoId)
  } catch (e) {
    console.error('[amplified] write error:', e)
    return NextResponse.json({ error: 'write_failed' }, { status: 500 })
  }

  const source = contentBlock.startsWith('TRANSCRIPT') ? 'transcript' : contentBlock.startsWith('VIDEO DESCRIPTION') ? 'description' : 'knowledge'
  return NextResponse.json({ ...analysis, source, _debug: { firstItem: analysis.items?.[0] } })
}
