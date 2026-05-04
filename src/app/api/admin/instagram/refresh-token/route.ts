import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

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

  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!accessToken) return NextResponse.json({ error: 'no token configured' }, { status: 500 })

  const res = await fetch(
    `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`
  )
  const data = await res.json()

  if (!data.access_token) {
    return NextResponse.json({ error: 'refresh failed', detail: data }, { status: 500 })
  }

  // Return new token and expiry — admin must update the env var manually
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString()
  return NextResponse.json({ access_token: data.access_token, expires_in: data.expires_in, expiresAt })
}
