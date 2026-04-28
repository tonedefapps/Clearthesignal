import { NextRequest, NextResponse } from 'next/server'
import { getDb, collection, query, where, orderBy, limit, getDocs } from '@/lib/firebase/server'
import { SEED_VIDEOS } from '@/lib/seed/hardcodedVideos'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const db = getDb()
    const { searchParams } = new URL(req.url)
    const tag = searchParams.get('tag')
    const limitCount = parseInt(searchParams.get('limit') || '20')

    const videosRef = collection(db, 'videos')

    const q = tag
      ? query(videosRef, where('passed', '==', true), where('tags', 'array-contains', tag), orderBy('scoredAt', 'desc'), limit(limitCount))
      : query(videosRef, where('passed', '==', true), orderBy('scoredAt', 'desc'), limit(limitCount))

    const snapshot = await getDocs(q)
    const videos = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))

    if (videos.length === 0) {
      const seed = tag ? SEED_VIDEOS.filter(v => v.tags.includes(tag)) : SEED_VIDEOS
      return NextResponse.json(seed)
    }

    return NextResponse.json(videos)
  } catch (error) {
    console.error('Videos API error:', error)
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}
