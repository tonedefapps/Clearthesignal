import { fetchRecentVideos } from '@/lib/youtube/fetchVideos'
import { scoreVideo } from '@/lib/scoring/scoreVideo'
import { adminDb } from '@/lib/firebase/admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function runCurationPipeline() {
  console.log('Fetching recent videos...')
  const videos = await fetchRecentVideos()
  console.log(`Found ${videos.length} videos to score`)

  let passed = 0
  let failed = 0

  for (const video of videos) {
    const existing = await adminDb.collection('videos').doc(video.videoId).get()
    if (existing.exists) {
      console.log(`Skipping already scored: ${video.title}`)
      continue
    }

    console.log(`Scoring: ${video.title}`)
    const scorecard = await scoreVideo(
      video.title,
      video.description,
      video.channelName,
      video.publishedAt
    )

    await adminDb.collection('videos').doc(video.videoId).set({
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
    console.log(`Score: ${scorecard.overall} — ${video.title} — ${scorecard.passed ? 'PASSED' : 'FILTERED'}`)

    await new Promise(r => setTimeout(r, 500))
  }

  console.log(`Pipeline complete — ${passed} passed, ${failed} filtered`)
  return { passed, failed, total: videos.length }
}
