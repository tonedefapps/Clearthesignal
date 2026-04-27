import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const tag = searchParams.get('tag')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = adminDb
      .collection('videos')
      .where('passed', '==', true)
      .orderBy('scoredAt', 'desc')
      .limit(limit)

    if (tag) {
      query = adminDb
        .collection('videos')
        .where('passed', '==', true)
        .where('tags', 'array-contains', tag)
        .orderBy('scoredAt', 'desc')
        .limit(limit)
    }

    const snapshot = await query.get()
    const videos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    return NextResponse.json(videos)
  } catch (error) {
    console.error('Videos API error:', error)
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}
