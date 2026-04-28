import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const ADMIN_EMAILS = [
  'beacon@clearthesignal.com',
  'jcable@gmail.com',
  'scott.fowler@gmail.com',
  'scott@tonedefapps.com',
  'jon.e.rock@gmail.com',
]

if (!getApps().length) {
  initializeApp({ projectId: 'clearthesignal' })
}

const auth = getAuth()
const db = getFirestore()

for (const email of ADMIN_EMAILS) {
  try {
    const user = await auth.getUserByEmail(email)
    await db.collection('users').doc(user.uid).set(
      { role: 'admin' },
      { merge: true }
    )
    console.log(`✓ ${email} → uid ${user.uid} → role: admin`)
  } catch (e) {
    if (e.code === 'auth/user-not-found') {
      console.log(`– ${email} → not signed up yet, skipping`)
    } else {
      console.error(`✗ ${email} → ${e.message}`)
    }
  }
}

console.log('\ndone.')
