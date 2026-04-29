import {
  collection, query, where, orderBy, limit,
  getDocs, deleteDoc, doc, getCountFromServer,
} from 'firebase/firestore'
import { getClientDb } from './client'

export interface VideoSummary {
  id: string
  title: string
  channelName: string
  thumbnailUrl: string
  youtubeUrl: string
  publishedAt: string
  passed: boolean
  manuallyAdded?: boolean
  tags: string[]
  scores: { overall: number }
  scoredAt?: { seconds: number }
}

export async function getRecentVideos(count = 30): Promise<VideoSummary[]> {
  const db = getClientDb()
  const q = query(
    collection(db, 'videos'),
    orderBy('scoredAt', 'desc'),
    limit(count)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as VideoSummary))
}

export async function removeVideo(videoId: string): Promise<void> {
  const db = getClientDb()
  await deleteDoc(doc(db, 'videos', videoId))
}

export async function getVideoStats(): Promise<{ passed: number; total: number }> {
  const db = getClientDb()
  const [passedSnap, totalSnap] = await Promise.all([
    getCountFromServer(query(collection(db, 'videos'), where('passed', '==', true))),
    getCountFromServer(collection(db, 'videos')),
  ])
  return {
    passed: passedSnap.data().count,
    total: totalSnap.data().count,
  }
}
