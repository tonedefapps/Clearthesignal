import {
  collection, query, orderBy, getDocs,
  doc, updateDoc, setDoc, serverTimestamp,
} from 'firebase/firestore'
import { getClientDb } from './client'

export type ChannelTier = 'trusted' | 'watch' | 'noise'

export interface ChannelRecord {
  channelId: string
  channelName: string
  tier: ChannelTier
  addedBy: 'auto' | 'admin'
  avgScore: number
  passRate: number
  videoCount: number
  lastSeen?: { seconds: number }
  notes: string
}

export async function getChannels(): Promise<ChannelRecord[]> {
  const db = getClientDb()
  const q = query(collection(db, 'channels'), orderBy('videoCount', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ channelId: d.id, ...d.data() } as ChannelRecord))
}

export async function setChannelTier(channelId: string, tier: ChannelTier): Promise<void> {
  const db = getClientDb()
  await updateDoc(doc(db, 'channels', channelId), { tier, addedBy: 'admin' })
}

export async function addChannel(channel: Pick<ChannelRecord, 'channelId' | 'channelName' | 'tier'>): Promise<void> {
  const db = getClientDb()
  await setDoc(doc(db, 'channels', channel.channelId), {
    channelId: channel.channelId,
    channelName: channel.channelName,
    tier: channel.tier,
    addedBy: 'admin',
    avgScore: 0,
    passRate: 0,
    videoCount: 0,
    lastSeen: serverTimestamp(),
    notes: '',
  })
}
