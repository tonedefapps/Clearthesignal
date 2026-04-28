import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { getClientDb } from './client'

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

export async function createUserProfile(
  uid: string,
  data: { displayName: string; email: string | null; photoURL: string | null; interests: string[] }
): Promise<void> {
  const ref = doc(getClientDb(), 'users', uid)
  await setDoc(ref, {
    uid,
    displayName: data.displayName,
    email: data.email,
    photoURL: data.photoURL,
    interests: data.interests,
    joinedAt: serverTimestamp(),
    profileComplete: true,
  })
}
