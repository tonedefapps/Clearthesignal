import { getClientAuth } from './client'
import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  ActionCodeSettings,
} from 'firebase/auth'

const googleProvider = new GoogleAuthProvider()
const appleProvider = new OAuthProvider('apple.com')

export async function signInWithGoogle() {
  return signInWithPopup(getClientAuth(), googleProvider)
}

export async function signInWithApple() {
  return signInWithPopup(getClientAuth(), appleProvider)
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(getClientAuth(), email, password)
}

export async function signUpWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(getClientAuth(), email, password)
}

const actionCodeSettings: ActionCodeSettings = {
  url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://clearthesignal.com'}/auth/verify`,
  handleCodeInApp: true,
}

export async function sendMagicLink(email: string) {
  await sendSignInLinkToEmail(getClientAuth(), email, actionCodeSettings)
  window.localStorage.setItem('emailForSignIn', email)
}

export async function completeMagicLinkSignIn(url: string) {
  const auth = getClientAuth()
  if (!isSignInWithEmailLink(auth, url)) return null
  let email = window.localStorage.getItem('emailForSignIn')
  if (!email) throw new Error('EMAIL_NOT_FOUND')
  const result = await signInWithEmailLink(auth, email, url)
  window.localStorage.removeItem('emailForSignIn')
  return result
}

export async function signOut() {
  return firebaseSignOut(getClientAuth())
}
