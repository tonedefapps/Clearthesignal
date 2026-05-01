export const runtime = 'edge'

const INNERTUBE_API = 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false'
const INNERTUBE_CLIENT_VERSION = '20.10.38'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const videoId = searchParams.get('videoId')
  if (!videoId) return Response.json({ error: 'videoId required' }, { status: 400 })

  try {
    const resp = await fetch(INNERTUBE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `com.google.android.youtube/${INNERTUBE_CLIENT_VERSION} (Linux; U; Android 14)`,
        'X-Goog-Api-Format-Version': '2',
      },
      body: JSON.stringify({
        context: { client: { clientName: 'ANDROID', clientVersion: INNERTUBE_CLIENT_VERSION } },
        videoId,
      }),
    })

    if (!resp.ok) {
      return Response.json({ transcript: null, source: 'none', debug: `innertube ${resp.status}` })
    }

    const data = await resp.json()
    const tracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks
    if (!Array.isArray(tracks) || tracks.length === 0) {
      return Response.json({ transcript: null, source: 'none', debug: 'no_tracks' })
    }

    const track = tracks.find((t: { languageCode: string }) => t.languageCode === 'en') ?? tracks[0]
    const xmlResp = await fetch(track.baseUrl)
    if (!xmlResp.ok) {
      return Response.json({ transcript: null, source: 'none', debug: `xml ${xmlResp.status}` })
    }

    const xml = await xmlResp.text()
    const segments: Array<{ offset: number; text: string }> = []
    const isFormat3 = xml.includes('<p t="')

    if (isFormat3) {
      const re = /<p t="(\d+)"[^>]*>([\s\S]*?)<\/p>/g
      let match
      while ((match = re.exec(xml)) !== null) {
        const raw = match[2].replace(/<[^>]*>/g, '')
          .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim()
        if (raw) segments.push({ offset: parseInt(match[1], 10), text: raw })
      }
    } else {
      const re = /<text start="([^"]*)"[^>]*>([^<]*)<\/text>/g
      let match
      while ((match = re.exec(xml)) !== null) {
        const text = match[2]
          .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim()
        if (text) segments.push({ offset: Math.round(parseFloat(match[1]) * 1000), text })
      }
    }

    if (segments.length === 0) {
      return Response.json({ transcript: null, source: 'none', debug: 'empty_xml' })
    }

    const formatted = segments.map(s => {
      const sec = Math.floor(s.offset / 1000)
      const h = Math.floor(sec / 3600)
      const m = Math.floor((sec % 3600) / 60)
      const ss = sec % 60
      const ts = h > 0
        ? `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
        : `${m}:${String(ss).padStart(2, '0')}`
      return `[${ts}] ${s.text}`
    }).join(' ').slice(0, 40000)

    return Response.json({ transcript: formatted, source: 'transcript', segments: segments.length })
  } catch (e) {
    return Response.json({ transcript: null, source: 'none', debug: String(e) })
  }
}
