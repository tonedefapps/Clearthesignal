import { fetchRecentVideos } from '@/lib/youtube/fetchVideos'
import { scoreVideo } from '@/lib/scoring/scoreVideo'
import { getDb, doc, getDoc, setDoc, serverTimestamp } from '@/lib/firebase/server'

export async function runCurationPipeline() {
  const db = getDb()
  console.log('Fetching recent videos...')
  const videos = await fetchRecentVideos()
  console.log(`Found ${videos.length} videos to score`)

  let passed = 0
  let failed = 0

  for (const video of videos) {
    const ref = doc(db, 'videos', video.videoId)
    const existing = await getDoc(ref)
    if (existing.exists()) {
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

    await setDoc(ref, {
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
      scoredAt: serverTimestamp(),
    })

    scorecard.passed ? passed++ : failed++
    console.log(`Score: ${scorecard.overall} — ${video.title} — ${scorecard.passed ? 'PASSED' : 'FILTERED'}`)

    await new Promise(r => setTimeout(r, 500))
  }

  console.log(`Pipeline complete — ${passed} passed, ${failed} filtered`)
  return { passed, failed, total: videos.length }
}
