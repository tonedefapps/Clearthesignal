import { google } from 'googleapis'

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
})

export const DEFAULT_SEARCH_QUERIES = [
  // UAP / Disclosure — people
  'Ross Coulthart UAP',
  'Jeremy Corbell UFO',
  'George Knapp UAP',
  'Lue Elizondo disclosure',
  'David Grusch whistleblower UAP',
  'Garry Nolan UAP science',
  'Tim Burchett UAP Congress',
  'Bob Lazar Area 51',
  'Chris Bledsoe ET contact',
  'Ryan Graves UAP pilot',
  'Jacques Vallee UFO',
  'Diana Pasulka UAP',
  'James Fox UFO documentary',
  'Nick Pope UAP',
  'Richard Dolan UAP',
  // Skinwalker Ranch
  'Skinwalker Ranch investigation',
  'Brandon Fugal Skinwalker Ranch',
  'Travis Taylor Skinwalker Ranch',
  // Consciousness / Science
  'Donald Hoffman consciousness',
  'Rupert Sheldrake morphic resonance',
  'Tom Campbell consciousness',
  'Dean Radin psi research',
  'Joe Dispenza meditation neuroscience',
  'Bruce Lipton biology of belief',
  'Gregg Braden heart intelligence',
  'Bernardo Kastrup idealism consciousness',
  'Nassim Haramein unified field',
  'Eben Alexander NDE near death',
  'Anita Moorjani healing NDE',
  'Stanislav Grof transpersonal',
  'Wim Hof breathwork',
  // Channelers / Experiencers / Contactees
  'Elizabeth April awakening',
  'Melisa Leslie ET contact',
  'Matias De Stefano consciousness',
  'Bashar Darryl Anka channeling',
  'Abraham Hicks manifestation',
  'Dolores Cannon QHHT',
  'Paul Selig channeling',
  // Spirituality / Awareness
  'Sadhguru consciousness',
  'Eckhart Tolle awakening presence',
  // Aggregator Podcasters / Channels
  'The Why Files UAP',
  'Paul Wallis 5th Kind ancient',
  'Graham Hancock consciousness ancient',
  'Aubrey Marcus consciousness',
  'Shawn Ryan Show UAP',
  'Theories of Everything Curt Jaimungal',
  'Coast to Coast AM UAP',
  'After Skool consciousness',
  // Thematic
  'UAP disclosure Congress 2025',
  'NDE near death experience science 2025',
  'Mandela effect quantum consciousness',
  'contact phenomenon experiencer',
  'ancient wisdom consciousness 2025',
  'synchronicity meaningful coincidence',
  'collective awakening humanity 2025',
  'disappeared scientists advanced technology',
]

export interface YouTubeVideoResult {
  videoId: string
  title: string
  description: string
  channelName: string
  channelId: string
  publishedAt: string
  thumbnailUrl: string
  youtubeUrl: string
}

export async function fetchRecentVideos(
  queries: string[] = DEFAULT_SEARCH_QUERIES,
  maxPerQuery = 5
): Promise<YouTubeVideoResult[]> {
  const results: YouTubeVideoResult[] = []
  const seen = new Set<string>()

  for (const query of queries) {
    const response = await youtube.search.list({
      part: ['snippet'],
      q: query,
      type: ['video'],
      order: 'date',
      publishedAfter: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxResults: maxPerQuery,
    })

    for (const item of response.data.items || []) {
      const videoId = item.id?.videoId
      if (!videoId || seen.has(videoId)) continue
      seen.add(videoId)

      results.push({
        videoId,
        title: item.snippet?.title || '',
        description: item.snippet?.description || '',
        channelName: item.snippet?.channelTitle || '',
        channelId: item.snippet?.channelId || '',
        publishedAt: item.snippet?.publishedAt || '',
        thumbnailUrl: item.snippet?.thumbnails?.high?.url || '',
        youtubeUrl: `https://youtube.com/watch?v=${videoId}`,
      })
    }
  }

  return results
}
