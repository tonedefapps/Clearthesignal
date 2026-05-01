import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { getClientDb } from './client'

export interface SignalPost {
  id: string
  headline: string
  url: string
  source: string
  note: string
  tags: string[]
  publishedAt: unknown
  authorUid: string
  authorName: string
  commentCount?: number
}

export async function getSignalPosts(tag?: string, limitCount = 20): Promise<SignalPost[]> {
  const db = getClientDb()
  const ref = collection(db, 'signal_posts')
  const q = tag
    ? query(ref, where('tags', 'array-contains', tag), orderBy('publishedAt', 'desc'), limit(limitCount))
    : query(ref, orderBy('publishedAt', 'desc'), limit(limitCount))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as SignalPost))
}

export async function createSignalPost(
  data: Omit<SignalPost, 'id' | 'publishedAt'>
): Promise<string> {
  const db = getClientDb()
  const ref = await addDoc(collection(db, 'signal_posts'), {
    ...data,
    publishedAt: serverTimestamp(),
  })
  return ref.id
}

export async function deleteSignalPost(id: string): Promise<void> {
  const db = getClientDb()
  await deleteDoc(doc(db, 'signal_posts', id))
}
