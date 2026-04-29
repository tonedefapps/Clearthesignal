import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

const youtube = google.youtube({ version: 'v3', auth: process.env.YOUTUBE_API_KEY })

function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0]
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/shorts/')[1].split('?')[0]
      if (u.pathname.startsWith('/embed/')) return u.pathname.split('/embed/')[1].split('?')[0]
      return u.searchParams.get('v')
    }
    return null
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 })

  const videoId = extractVideoId(url)
  if (!videoId) return NextResponse.json({ error: 'could not extract video ID from URL' }, { status: 400 })

  const response = await youtube.videos.list({
    part: ['snippet'],
    id: [videoId],
  })

  const item = response.data.items?.[0]
  if (!item) return NextResponse.json({ error: 'video not found' }, { status: 404 })

  return NextResponse.json({
    videoId,
    title: item.snippet?.title || '',
    description: item.snippet?.description || '',
    channelName: item.snippet?.channelTitle || '',
    channelId: item.snippet?.channelId || '',
    publishedAt: item.snippet?.publishedAt || '',
    thumbnailUrl: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || '',
    youtubeUrl: `https://youtube.com/watch?v=${videoId}`,
  })
}
