'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { getClientAuth } from '@/lib/firebase/client'
import { getUserProfile, UserProfile } from '@/lib/firebase/users'

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  profileLoading: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  profileLoading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getClientAuth(), async (u) => {
      setUser(u)
      setLoading(false)
      if (u) {
        setProfileLoading(true)
        const p = await getUserProfile(u.uid)
        setProfile(p)
        setProfileLoading(false)
      } else {
        setProfile(null)
        setProfileLoading(false)
      }
    })
    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading, profileLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
