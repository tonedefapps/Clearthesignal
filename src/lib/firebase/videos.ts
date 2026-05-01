import {
  collection, query, where, orderBy, limit,
  getDocs, deleteDoc, doc, getCountFromServer, updateDoc, writeBatch,
} from 'firebase/firestore'
import { getClientDb } from './client'

export interface AmplifiedItem {
  text: string
  ts?: string
}

export interface AmplifiedAnalysis {
  label: string
  contentType: string
  items: string[] | AmplifiedItem[]
  generatedAt: { seconds: number }
}

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
  amplified?: boolean
  amplifiedAnalysis?: AmplifiedAnalysis
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

export async function setAmplified(videoId: string): Promise<void> {
  const db = getClientDb()
  const existing = await getDocs(query(collection(db, 'videos'), where('amplified', '==', true)))
  const batch = writeBatch(db)
  existing.docs.forEach(d => batch.update(d.ref, { amplified: false }))
  batch.update(doc(db, 'videos', videoId), { amplified: true })
  await batch.commit()
}

export async function clearAmplified(): Promise<void> {
  const db = getClientDb()
  const existing = await getDocs(query(collection(db, 'videos'), where('amplified', '==', true)))
  const batch = writeBatch(db)
  existing.docs.forEach(d => batch.update(d.ref, { amplified: false }))
  await batch.commit()
}

export async function getAmplifiedVideo(): Promise<VideoSummary | null> {
  const db = getClientDb()
  const snap = await getDocs(
    query(collection(db, 'videos'), where('amplified', '==', true), limit(1))
  )
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() } as VideoSummary
}

export async function updateAmplifiedAnalysis(
  videoId: string,
  patch: { label: string; items: string[] }
): Promise<void> {
  const db = getClientDb()
  await updateDoc(doc(db, 'videos', videoId), {
    'amplifiedAnalysis.label': patch.label,
    'amplifiedAnalysis.items': patch.items,
  })
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
