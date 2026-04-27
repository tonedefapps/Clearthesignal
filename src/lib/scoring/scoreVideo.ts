import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export interface VideoScorecard {
  novelty: number
  credibility: number
  toneAlignment: number
  signalDensity: number
  timingRelevance: number
  overall: number
  rationale: string
  passed: boolean
  tags: string[]
}

export async function scoreVideo(
  title: string,
  description: string,
  channelName: string,
  publishedAt: string
): Promise<VideoScorecard> {
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

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}
