import { NextRequest, NextResponse } from 'next/server'

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
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 })

    const videoId = extractVideoId(url)
    if (!videoId) return NextResponse.json({ error: 'could not extract video ID from URL' }, { status: 400 })

    // oEmbed — no API key, no quota
    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    )
    if (!oembedRes.ok) return NextResponse.json({ error: 'video not found or unavailable' }, { status: 404 })
    const oembed = await oembedRes.json()

    return NextResponse.json({
      videoId,
      title: oembed.title || '',
      description: '',
      channelName: oembed.author_name || '',
      channelId: '',
      publishedAt: '',
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      youtubeUrl: `https://youtube.com/watch?v=${videoId}`,
    })
  } catch (e) {
    console.error('[add-video] error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
