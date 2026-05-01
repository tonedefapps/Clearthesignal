import { NextRequest, NextResponse } from 'next/server'
import { YoutubeTranscript } from 'youtube-transcript'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const anthropic = new Anthropic()

async function verifyAdminToken(token: string): Promise<boolean> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!

  // Verify the ID token and get UID
  const lookupRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    }
  )
  if (!lookupRes.ok) return false
  const lookupData = await lookupRes.json()
  const uid: string | undefined = lookupData.users?.[0]?.localId
  if (!uid) return false

  // Read user role from Firestore using the user's own token (rules allow uid == userId)
  const userRes = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!userRes.ok) return false
  const userData = await userRes.json()
  const role: string | undefined = userData.fields?.role?.stringValue
  return role === 'admin' || role === 'mod'
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const isAdmin = await verifyAdminToken(token)
  if (!isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const { videoId } = await req.json()
  if (!videoId) return NextResponse.json({ error: 'videoId required' }, { status: 400 })

  let transcriptText: string
  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId)
    transcriptText = segments.map(s => s.text).join(' ').slice(0, 40000)
  } catch {
    // Fall back to YouTube video description
    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
    )
    if (!ytRes.ok) return NextResponse.json({ error: 'no_transcript' }, { status: 422 })
    const ytData = await ytRes.json()
    const description: string | undefined = ytData.items?.[0]?.snippet?.description
    if (!description?.trim()) return NextResponse.json({ error: 'no_transcript' }, { status: 422 })
    transcriptText = description.slice(0, 40000)
  }

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages: [
      {
        role: 'user',
        content: `You are analyzing a YouTube video transcript to surface its most striking, specific claims.

Return a JSON object with exactly two fields:
- "label": a short 2–4 word phrase describing the theme (e.g. "wildest claims", "key accusations", "shocking admissions")
- "claims": an array of 8–10 punchy, specific strings — each a single claim verbatim or closely paraphrased from the transcript. Each claim should stand alone and be under 20 words.

Respond with only the JSON object, no other text.

Transcript:
${transcriptText}`,
      },
    ],
  })

  let label: string
  let claims: string[]
  try {
    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = JSON.parse(raw)
    label = parsed.label
    claims = parsed.claims
    if (!label || !Array.isArray(claims)) throw new Error('invalid shape')
  } catch {
    return NextResponse.json({ error: 'parse_failed' }, { status: 500 })
  }

  return NextResponse.json({ label, claims })
}
