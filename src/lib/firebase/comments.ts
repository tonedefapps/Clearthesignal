import {
  collection, doc, addDoc, updateDoc, increment,
  getDocs, query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { getClientDb } from './client'

export interface Comment {
  id: string
  uid: string
  displayName: string
  body: string
  createdAt: { seconds: number } | null
  parentId: string | null
  deleted: boolean
}

export async function getComments(postId: string, parentCollection = 'signal_posts'): Promise<Comment[]> {
  const db = getClientDb()
  const q = query(
    collection(db, parentCollection, postId, 'comments'),
    orderBy('createdAt', 'asc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Comment))
}

export async function addComment(
  postId: string,
  data: { uid: string; displayName: string; body: string; parentId: string | null },
  parentCollection = 'signal_posts',
): Promise<string> {
  const db = getClientDb()
  const ref = await addDoc(collection(db, parentCollection, postId, 'comments'), {
    ...data,
    createdAt: serverTimestamp(),
    deleted: false,
  })
  await updateDoc(doc(db, parentCollection, postId), { commentCount: increment(1) })
  return ref.id
}

export async function softDeleteComment(postId: string, commentId: string, parentCollection = 'signal_posts'): Promise<void> {
  const db = getClientDb()
  await updateDoc(doc(db, parentCollection, postId, 'comments', commentId), { deleted: true })
  await updateDoc(doc(db, parentCollection, postId), { commentCount: increment(-1) })
}
