import { NextRequest, NextResponse } from 'next/server'
import { getDb, collection, query, where, orderBy, limit, getDocs } from '@/lib/firebase/server'
import { SEED_VIDEOS } from '@/lib/seed/hardcodedVideos'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const db = getDb()
    const { searchParams } = new URL(req.url)
    const amplified = searchParams.get('amplified') === 'true'
    const tag = searchParams.get('tag')
    const tagsParam = searchParams.get('tags')
    const tags = tagsParam ? tagsParam.split(',').filter(Boolean).slice(0, 10) : null
    const limitCount = parseInt(searchParams.get('limit') || '20')

    const videosRef = collection(db, 'videos')

    if (amplified) {
      const snap = await getDocs(query(videosRef, where('amplified', '==', true), limit(1)))
      if (snap.empty) return NextResponse.json(null)
      const d = snap.docs[0]
      return NextResponse.json({ id: d.id, ...d.data() })
    }

    const q = tags && tags.length > 0
      ? query(videosRef, where('passed', '==', true), where('tags', 'array-contains-any', tags), orderBy('scoredAt', 'desc'), limit(limitCount))
      : tag
        ? query(videosRef, where('passed', '==', true), where('tags', 'array-contains', tag), orderBy('scoredAt', 'desc'), limit(limitCount))
        : query(videosRef, where('passed', '==', true), orderBy('scoredAt', 'desc'), limit(limitCount))

    const snapshot = await getDocs(q)
    const videos = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))

    if (videos.length === 0) {
      let seed = SEED_VIDEOS
      if (tags && tags.length > 0) seed = SEED_VIDEOS.filter(v => v.tags.some(t => tags.includes(t)))
      else if (tag) seed = SEED_VIDEOS.filter(v => v.tags.includes(tag))
      return NextResponse.json(seed)
    }

    return NextResponse.json(videos.filter((v: Record<string, unknown>) => !v.amplified))
  } catch (error) {
    console.error('Videos API error:', error)
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}
