import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
  collection, query, where, getDocs, limit, orderBy,
} from 'firebase/firestore'
import { getClientDb } from './client'

const ADMIN_EMAILS = [
  'beacon@clearthesignal.com',
  'jcable@gmail.com',
  'scott.fowler@gmail.com',
  'scott@tonedefapps.com',
  'jon.e.rock@gmail.com',
]

export interface UserProfile {
  uid: string
  displayName: string
  email: string | null
  photoURL: string | null
  interests: string[]
  joinedAt: unknown
  profileComplete: boolean
  role?: 'user' | 'mod' | 'admin'
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(getClientDb(), 'users', uid)
  const snap = await getDoc(ref)
  return snap.exists() ? (snap.data() as UserProfile) : null
}

export async function updateUserProfile(
  uid: string,
  data: { displayName?: string; interests?: string[] }
): Promise<void> {
  const ref = doc(getClientDb(), 'users', uid)
  await updateDoc(ref, { ...data })
}

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  const db = getClientDb()
  const q = query(collection(db, 'users'), where('email', '==', email), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null
  return snap.docs[0].data() as UserProfile
}

export async function setUserRole(uid: string, role: 'user' | 'mod' | 'admin'): Promise<void> {
  const db = getClientDb()
  await updateDoc(doc(db, 'users', uid), { role })
}

export async function getTeamMembers(): Promise<UserProfile[]> {
  const db = getClientDb()
  const q = query(
    collection(db, 'users'),
    where('role', 'in', ['admin', 'mod']),
    orderBy('role'),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as UserProfile)
}

export async function createUserProfile(
  uid: string,
  data: { displayName: string; email: string | null; photoURL: string | null; interests: string[] }
): Promise<void> {
  const ref = doc(getClientDb(), 'users', uid)
  const role = data.email && ADMIN_EMAILS.includes(data.email) ? 'admin' : 'user'

  await setDoc(ref, {
    uid,
    displayName: data.displayName,
    email: data.email,
    photoURL: data.photoURL,
    interests: data.interests,
    joinedAt: serverTimestamp(),
    profileComplete: true,
    role,
  })
}
