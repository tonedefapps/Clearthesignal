export const runtime = 'edge'

const INNERTUBE_API = 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false'
const INNERTUBE_CLIENT_VERSION = '20.10.38'
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36'

function parseXmlSegments(xml: string): Array<{ offset: number; text: string }> {
  const segments: Array<{ offset: number; text: string }> = []
  const decode = (s: string) => s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim()

  if (xml.includes('<p t="')) {
    const re = /<p t="(\d+)"[^>]*>([\s\S]*?)<\/p>/g
    let m
    while ((m = re.exec(xml)) !== null) {
      const text = decode(m[2].replace(/<[^>]*>/g, ''))
      if (text) segments.push({ offset: parseInt(m[1], 10), text })
    }
  } else {
    const re = /<text start="([^"]*)"[^>]*>([^<]*)<\/text>/g
    let m
    while ((m = re.exec(xml)) !== null) {
      const text = decode(m[2])
      if (text) segments.push({ offset: Math.round(parseFloat(m[1]) * 1000), text })
    }
  }
  return segments
}

function formatSegments(segments: Array<{ offset: number; text: string }>): string {
  return segments.map(s => {
    const sec = Math.floor(s.offset / 1000)
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const ss = sec % 60
    const ts = h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
      : `${m}:${String(ss).padStart(2, '0')}`
    return `[${ts}] ${s.text}`
  }).join(' ').slice(0, 40000)
}

async function fetchCaptionXml(baseUrl: string): Promise<string | null> {
  const r = await fetch(baseUrl)
  if (!r.ok) return null
  return r.text()
}

async function tryInnerTube(videoId: string): Promise<string | null> {
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
  if (!resp.ok) return null
  const data = await resp.json()
  const tracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks
  if (!Array.isArray(tracks) || tracks.length === 0) return null
  const track = tracks.find((t: { languageCode: string }) => t.languageCode === 'en') ?? tracks[0]
  return track?.baseUrl ?? null
}

async function tryHtmlScrape(videoId: string): Promise<string | null> {
  const resp = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: { 'User-Agent': BROWSER_UA, 'Accept-Language': 'en-US,en;q=0.9' },
  })
  if (!resp.ok) return null
  const html = await resp.text()
  if (html.includes('class="g-recaptcha"')) return null

  // Extract captionTracks from ytInitialPlayerResponse
  const marker = '"captionTracks":'
  const idx = html.indexOf(marker)
  if (idx === -1) return null

  // Find the array start
  const arrStart = html.indexOf('[', idx)
  if (arrStart === -1) return null

  // Walk to find matching ]
  let depth = 0
  for (let i = arrStart; i < Math.min(arrStart + 20000, html.length); i++) {
    if (html[i] === '[' || html[i] === '{') depth++
    else if (html[i] === ']' || html[i] === '}') {
      depth--
      if (depth === 0) {
        try {
          const tracks = JSON.parse(html.slice(arrStart, i + 1))
          const track = tracks.find((t: { languageCode: string }) => t.languageCode === 'en') ?? tracks[0]
          // Decode unicode escapes in the URL
          const baseUrl = track?.baseUrl?.replace(/\\u0026/g, '&')
          return baseUrl ?? null
        } catch { return null }
      }
    }
  }
  return null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const videoId = searchParams.get('videoId')
  if (!videoId) return Response.json({ error: 'videoId required' }, { status: 400 })

  try {
    // Try InnerTube first (fast), then HTML scraping (more resilient to IP filtering)
    let baseUrl = await tryInnerTube(videoId)
    const method = baseUrl ? 'innertube' : 'html'
    if (!baseUrl) baseUrl = await tryHtmlScrape(videoId)

    if (!baseUrl) {
      return Response.json({ transcript: null, source: 'none', debug: 'no_tracks_either_method' })
    }

    const xml = await fetchCaptionXml(baseUrl)
    if (!xml) return Response.json({ transcript: null, source: 'none', debug: 'xml_fetch_failed' })

    const segments = parseXmlSegments(xml)
    if (segments.length === 0) {
      return Response.json({ transcript: null, source: 'none', debug: 'empty_xml' })
    }

    const transcript = formatSegments(segments)
    return Response.json({ transcript, source: 'transcript', segments: segments.length, method })
  } catch (e) {
    return Response.json({ transcript: null, source: 'none', debug: String(e) })
  }
}
