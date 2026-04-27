import { google } from 'googleapis'

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
})

export const DEFAULT_SEARCH_QUERIES = [
  'consciousness expansion 2025',
  'UAP disclosure latest',
  'synchronicity explained',
  'manifestation science',
  'skinwalker ranch investigation',
  'human evolution consciousness',
  'quantum consciousness',
  'contact experience',
  'Ross Coulthart UAP',
  'positive energy healing',
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
