import {
  collection, query, where, orderBy, limit,
  getDocs, deleteDoc, doc, getCountFromServer, updateDoc,
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
  status?: 'pending' | 'approved' | 'rejected'
  manuallyAdded?: boolean
  tags: string[]
  scores: {
    overall: number
    novelty?: number
    credibility?: number
    toneAlignment?: number
    signalDensity?: number
    timingRelevance?: number
  }
  scoreRationale?: string
  scoredAt?: { seconds: number }
  spotlight?: boolean
  spotlightAnalysis?: {
    label: string
    claims: string[]
    generatedAt: { seconds: number }
  }
  spotlightDraft?: {
    label: string
    claims: string[]
    generatedAt: { seconds: number }
  }
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

export async function approveVideo(videoId: string): Promise<void> {
  const db = getClientDb()
  await updateDoc(doc(db, 'videos', videoId), { passed: true, status: 'approved' })
}

export async function rejectVideo(videoId: string): Promise<void> {
  const db = getClientDb()
  await updateDoc(doc(db, 'videos', videoId), { passed: false, status: 'rejected' })
}

export async function removeVideo(videoId: string): Promise<void> {
  const db = getClientDb()
  await deleteDoc(doc(db, 'videos', videoId))
}

export async function getVideoStats(): Promise<{ passed: number; pending: number; total: number }> {
  const db = getClientDb()
  const [passedSnap, pendingSnap, totalSnap] = await Promise.all([
    getCountFromServer(query(collection(db, 'videos'), where('passed', '==', true))),
    getCountFromServer(query(collection(db, 'videos'), where('status', '==', 'pending'))),
    getCountFromServer(collection(db, 'videos')),
  ])
  return {
    passed: passedSnap.data().count,
    pending: pendingSnap.data().count,
    total: totalSnap.data().count,
  }
}

export async function setSpotlight(videoId: string): Promise<void> {
  const db = getClientDb()
  const existing = await getDocs(query(collection(db, 'videos'), where('spotlight', '==', true)))
  await Promise.all(existing.docs.map(d => updateDoc(doc(db, 'videos', d.id), { spotlight: false })))
  await updateDoc(doc(db, 'videos', videoId), { spotlight: true })
}

export async function clearSpotlight(): Promise<void> {
  const db = getClientDb()
  const existing = await getDocs(query(collection(db, 'videos'), where('spotlight', '==', true)))
  await Promise.all(existing.docs.map(d => updateDoc(doc(db, 'videos', d.id), { spotlight: false })))
}

export async function getSpotlightVideo(): Promise<VideoSummary | null> {
  const db = getClientDb()
  const snap = await getDocs(query(collection(db, 'videos'), where('spotlight', '==', true), limit(1)))
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as VideoSummary
}
