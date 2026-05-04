import { NextRequest, NextResponse } from 'next/server'
import { del } from '@vercel/blob'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`


async function verifyToken(idToken: string): Promise<string | null> {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) }
  )
  if (!res.ok) return null
  const data = await res.json()
  return data.users?.[0]?.localId ?? null
}

async function getUserRole(uid: string, idToken: string): Promise<string | null> {
  const res = await fetch(`${FIRESTORE_BASE}/users/${uid}`, {
    headers: { Authorization: `Bearer ${idToken}` },
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.fields?.role?.stringValue ?? null
}

function getIgCredentials(): { accessToken: string; userId: string } | null {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
  const userId = process.env.INSTAGRAM_USER_ID
  if (!accessToken || !userId) return null
  return { accessToken, userId }
}

async function pollContainer(containerId: string, accessToken: string): Promise<boolean> {
  const deadline = Date.now() + 110_000
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 5000))
    const res = await fetch(
      `https://graph.instagram.com/v21.0/${containerId}?fields=status_code&access_token=${accessToken}`
    )
    if (!res.ok) continue
    const data = await res.json()
    if (data.status_code === 'FINISHED') return true
    if (data.status_code === 'ERROR') return false
  }
  return false
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || ''
  const idToken = authHeader.replace('Bearer ', '').trim()
  if (!idToken) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const uid = await verifyToken(idToken)
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const role = await getUserRole(uid, idToken)
  if (!role || !['admin', 'mod'].includes(role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const ig = getIgCredentials()
  if (!ig) return NextResponse.json({ error: 'instagram not connected' }, { status: 400 })

  let body: { videoUrl: string; caption: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  if (!body.videoUrl) return NextResponse.json({ error: 'videoUrl required' }, { status: 400 })
  const videoUrl = body.videoUrl

  try {
    // Create IG media container
    const containerRes = await fetch(
      `https://graph.instagram.com/v21.0/${ig.userId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_type: 'REELS',
          video_url: videoUrl,
          caption: body.caption ?? '',
          access_token: ig.accessToken,
        }),
      }
    )
    const containerData = await containerRes.json()
    if (!containerData.id) {
      throw new Error('no container id: ' + JSON.stringify(containerData))
    }

    // Poll until ready
    const ready = await pollContainer(containerData.id, ig.accessToken)
    if (!ready) throw new Error('container processing timed out or errored')

    // Publish
    const publishRes = await fetch(
      `https://graph.instagram.com/v21.0/${ig.userId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerData.id,
          access_token: ig.accessToken,
        }),
      }
    )
    const publishData = await publishRes.json()
    if (!publishData.id) throw new Error('publish failed: ' + JSON.stringify(publishData))

    // Get permalink
    const permalinkRes = await fetch(
      `https://graph.instagram.com/v21.0/${publishData.id}?fields=permalink&access_token=${ig.accessToken}`
    )
    const permalinkData = await permalinkRes.json()

    return NextResponse.json({
      postId: publishData.id,
      permalink: permalinkData.permalink ?? null,
    })
  } finally {
    // Always clean up blob
    await del(videoUrl).catch(() => {})
  }
}
