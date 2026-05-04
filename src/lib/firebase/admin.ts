import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0]

  // Vercel: base64-encoded service account JSON in FIREBASE_ADMIN_CREDENTIAL
  const credential = process.env.FIREBASE_ADMIN_CREDENTIAL
  if (credential) {
    const serviceAccount = JSON.parse(Buffer.from(credential, 'base64').toString('utf8'))
    return initializeApp({ credential: cert(serviceAccount) })
  }

  // Local dev / GitHub Actions: uses GOOGLE_APPLICATION_CREDENTIALS
  return initializeApp({ credential: applicationDefault() })
}

export const adminDb = () => getFirestore(getAdminApp())
export const adminAuth = () => getAuth(getAdminApp())
