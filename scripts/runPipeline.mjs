import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { google } from 'googleapis'
import Anthropic from '@anthropic-ai/sdk'

// ── Firebase Admin ────────────────────────────────────────────────────────────
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  initializeApp({ credential: cert(serviceAccount) })
}

const db = getFirestore()

// ── API clients ───────────────────────────────────────────────────────────────
const youtube = google.youtube({ version: 'v3', auth: process.env.YOUTUBE_API_KEY })
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Search queries ────────────────────────────────────────────────────────────
const DEFAULT_SEARCH_QUERIES = [
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
  // Neuro / Psychology
  'Mayim Bialik neuroscience consciousness',
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

// ── YouTube fetch ─────────────────────────────────────────────────────────────
async function fetchRecentVideos(queries = DEFAULT_SEARCH_QUERIES, maxPerQuery = 5) {
  const results = []
  const seen = new Set()

  for (const query of queries) {
    try {
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
    } catch (err) {
      console.error(`YouTube search failed for "${query}": ${err.message}`)
    }
  }

  return results
}

// ── Scoring ───────────────────────────────────────────────────────────────────
async function scoreVideo(title, description, channelName, publishedAt) {
  const prompt = `
You are the curation engine for Clear the Signal — a platform dedicated to positive consciousness expansion, synchronicity, manifestation, collective evolution, and credible exploration of energy, awareness, and human potential.

Your job is to score YouTube videos on whether they belong in our curated feed. We filter noise and strengthen signal. We are NOT a conspiracy platform. We DO NOT amplify fear, doom, division, or unfalsifiable claims. We lean into positivity, credibility, and genuine new insight.

Score this video on each dimension from 1-5:

VIDEO DETAILS:
Title: ${title}
Channel: ${channelName}
Published: ${publishedAt}
Description: ${description}

SCORING DIMENSIONS:
1. NOVELTY (1-5): Is this genuinely new information/perspective, or a rehash of widely covered content?
2. CREDIBILITY (1-5): Is the source/channel credible? Does it cite evidence or experience?
3. TONE ALIGNMENT (1-5): Is the tone positive, expansive, and constructive? (1=fear/doom/division, 5=uplifting/expansive)
4. SIGNAL DENSITY (1-5): How much genuine substance vs filler/clickbait?
5. TIMING RELEVANCE (1-5): Is this timely and relevant to current community interests?

Also provide:
- OVERALL: weighted average (tone alignment counts double)
- RATIONALE: 2-3 sentences explaining the score
- TAGS: 3-5 relevant topic tags from: [consciousness, synchronicity, manifestation, energy, UAP, contact, healing, evolution, quantum, meditation, community, field-research, skinwalker, disclosure]
- PASSED: true if overall >= 3.5, false otherwise

Respond ONLY in this exact JSON format:
{
  "novelty": 0,
  "credibility": 0,
  "toneAlignment": 0,
  "signalDensity": 0,
  "timingRelevance": 0,
  "overall": 0,
  "rationale": "",
  "passed": false,
  "tags": []
}
`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}

// ── Pipeline ──────────────────────────────────────────────────────────────────
async function runPipeline() {
  console.log('Fetching recent videos...')
  const videos = await fetchRecentVideos()
  console.log(`Found ${videos.length} videos to score`)

  let passed = 0
  let failed = 0
  let skipped = 0

  for (const video of videos) {
    const ref = db.collection('videos').doc(video.videoId)
    const existing = await ref.get()

    if (existing.exists) {
      console.log(`Skipping already scored: ${video.title}`)
      skipped++
      continue
    }

    try {
      console.log(`Scoring: ${video.title}`)
      const scorecard = await scoreVideo(
        video.title,
        video.description,
        video.channelName,
        video.publishedAt
      )

      await ref.set({
        ...video,
        scores: {
          novelty: scorecard.novelty,
          credibility: scorecard.credibility,
          toneAlignment: scorecard.toneAlignment,
          signalDensity: scorecard.signalDensity,
          timingRelevance: scorecard.timingRelevance,
          overall: scorecard.overall,
        },
        scoreRationale: scorecard.rationale,
        passed: scorecard.passed,
        tags: scorecard.tags,
        scoredAt: FieldValue.serverTimestamp(),
      })

      scorecard.passed ? passed++ : failed++
      console.log(`Score: ${scorecard.overall} — ${scorecard.passed ? 'PASSED' : 'FILTERED'} — ${video.title}`)
    } catch (err) {
      console.error(`Failed to score "${video.title}": ${err.message}`)
    }

    await new Promise(r => setTimeout(r, 500))
  }

  console.log(`\nPipeline complete — ${passed} passed, ${failed} filtered, ${skipped} skipped`)
}

runPipeline().catch(err => {
  console.error('Pipeline failed:', err)
  process.exit(1)
})
