'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { upload } from '@vercel/blob/client'
import { useAuth } from '@/context/AuthContext'

interface VideoOption {
  id: string
  title: string
  channelTitle: string
  thumbnailUrl: string
  amplifiedAnalysis?: {
    sections?: Array<{
      label: string
      items: Array<{ text: string; ts?: string }>
    }>
  }
}

const SLIDE_W = 1080
const SLIDE_H = 1920
const FPS = 30
const SPLASH_DURATION_S = 3
const CARD_DURATION_S = 4

function getThumbnailProxyUrl(url: string): string {
  return `/api/proxy-image?url=${encodeURIComponent(url)}`
}

function getTopPoints(video: VideoOption): string[] {
  if (!video.amplifiedAnalysis?.sections) return []
  for (const section of video.amplifiedAnalysis.sections) {
    if (section.items?.length > 0) return section.items.slice(0, 2).map(i => i.text)
  }
  return []
}

// ── Canvas Drawing ────────────────────────────────────────────────────────────

function wrapText(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) { lines.push(current); current = word }
    else current = test
  }
  if (current) lines.push(current)
  return lines
}

function drawSplashOpen(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
  const grad = ctx.createLinearGradient(0, 0, 0, SLIDE_H)
  grad.addColorStop(0, '#1a1430'); grad.addColorStop(1, '#0d0a1a')
  ctx.fillStyle = grad; ctx.fillRect(0, 0, SLIDE_W, SLIDE_H)
  ctx.fillStyle = '#a89fc8'; ctx.font = 'bold 96px system-ui, sans-serif'; ctx.textAlign = 'center'
  ctx.fillText('CLEAR', SLIDE_W / 2, SLIDE_H / 2 - 60)
  ctx.fillText('THE SIGNAL', SLIDE_W / 2, SLIDE_H / 2 + 60)
  ctx.fillStyle = '#7d7a9a'; ctx.font = '36px system-ui, sans-serif'
  ctx.fillText('daily curated insights', SLIDE_W / 2, SLIDE_H / 2 + 150)
}

function drawSplashClose(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D) {
  const grad = ctx.createLinearGradient(0, 0, 0, SLIDE_H)
  grad.addColorStop(0, '#1a1430'); grad.addColorStop(1, '#0d0a1a')
  ctx.fillStyle = grad; ctx.fillRect(0, 0, SLIDE_W, SLIDE_H)
  ctx.fillStyle = '#a89fc8'; ctx.font = 'bold 72px system-ui, sans-serif'; ctx.textAlign = 'center'
  ctx.fillText('follow for daily signal', SLIDE_W / 2, SLIDE_H / 2 - 40)
  ctx.fillStyle = '#7d7a9a'; ctx.font = '48px system-ui, sans-serif'
  ctx.fillText('@clearthesignal', SLIDE_W / 2, SLIDE_H / 2 + 60)
}

function drawVideoCard(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  video: VideoOption,
  thumb: HTMLImageElement | ImageBitmap | null
) {
  const grad = ctx.createLinearGradient(0, 0, 0, SLIDE_H)
  grad.addColorStop(0, '#120f22'); grad.addColorStop(1, '#0a0815')
  ctx.fillStyle = grad; ctx.fillRect(0, 0, SLIDE_W, SLIDE_H)

  const thumbH = 600, thumbY = 200
  if (thumb) {
    ctx.drawImage(thumb as CanvasImageSource, 0, thumbY, SLIDE_W, thumbH)
    const overlay = ctx.createLinearGradient(0, thumbY + thumbH * 0.5, 0, thumbY + thumbH)
    overlay.addColorStop(0, 'rgba(10,8,21,0)'); overlay.addColorStop(1, 'rgba(10,8,21,0.95)')
    ctx.fillStyle = overlay; ctx.fillRect(0, thumbY, SLIDE_W, thumbH)
  }

  ctx.fillStyle = '#7d7a9a'; ctx.font = '40px system-ui, sans-serif'; ctx.textAlign = 'center'
  ctx.fillText(video.channelTitle, SLIDE_W / 2, thumbY + thumbH + 70)

  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 56px system-ui, sans-serif'
  const titleLines = wrapText(ctx, video.title, SLIDE_W - 120)
  titleLines.slice(0, 3).forEach((line, i) => ctx.fillText(line, SLIDE_W / 2, thumbY + thumbH + 150 + i * 72))

  const points = getTopPoints(video)
  const pointsY = thumbY + thumbH + 150 + Math.min(titleLines.length, 3) * 72 + 80
  ctx.fillStyle = '#a89fc8'; ctx.font = '42px system-ui, sans-serif'
  points.forEach((point, i) => {
    wrapText(ctx, `· ${point}`, SLIDE_W - 120).slice(0, 2).forEach((line, j) => {
      ctx.fillText(line, SLIDE_W / 2, pointsY + i * 130 + j * 56)
    })
  })

  ctx.fillStyle = '#a89fc8'; ctx.font = 'bold 38px system-ui, sans-serif'; ctx.textAlign = 'left'
  ctx.fillText('CTS', 60, 100)
  ctx.fillStyle = '#7d7a9a'; ctx.font = '32px system-ui, sans-serif'
  ctx.fillText('clear the signal', 120, 100)
  ctx.textAlign = 'center'
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SocialTab() {
  const { user } = useAuth()
  const [videos, setVideos] = useState<VideoOption[]>([])
  const [loadingVideos, setLoadingVideos] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [rendering, setRendering] = useState(false)
  const [renderProgress, setRenderProgress] = useState('')
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [posting, setPosting] = useState(false)
  const [postedUrl, setPostedUrl] = useState<string | null>(null)
  const [postError, setPostError] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [refreshResult, setRefreshResult] = useState<string | null>(null)
  const [uploadedBlobUrl, setUploadedBlobUrl] = useState<string | null>(null)
  const previewRef = useRef<HTMLCanvasElement>(null)

  const getToken = useCallback(async () => user ? await user.getIdToken() : null, [user])

  useEffect(() => {
    fetch('/api/videos?limit=30')
      .then(r => r.json())
      .then((data: unknown[]) => {
        const vids: VideoOption[] = (Array.isArray(data) ? data : []).map((v: unknown) => {
          const vid = v as Record<string, unknown>
          return {
            id: vid.id as string,
            title: vid.title as string,
            channelTitle: (vid.channelTitle ?? vid.channel ?? '') as string,
            thumbnailUrl: vid.thumbnailUrl as string,
            amplifiedAnalysis: vid.amplifiedAnalysis as VideoOption['amplifiedAnalysis'],
          }
        })
        setVideos(vids)
      })
      .catch(() => {})
      .finally(() => setLoadingVideos(false))
  }, [])

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < 5) next.add(id)
      return next
    })
  }

  useEffect(() => {
    const canvas = previewRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const selectedVideos = videos.filter(v => selected.has(v.id))
    if (selectedVideos.length === 0) { ctx.clearRect(0, 0, canvas.width, canvas.height); return }
    const first = selectedVideos[0]
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    const draw = (thumb: HTMLImageElement | null) => {
      ctx.save(); ctx.scale(canvas.width / SLIDE_W, canvas.height / SLIDE_H)
      drawVideoCard(ctx, first, thumb); ctx.restore()
    }
    img.onload = () => draw(img)
    img.onerror = () => draw(null)
    img.src = getThumbnailProxyUrl(first.thumbnailUrl)
  }, [selected, videos])

  async function handleGenerate() {
    if (selected.size < 3) return
    const selectedVideos = videos.filter(v => selected.has(v.id))
    setRendering(true); setVideoBlob(null); setPostedUrl(null); setPostError(null)
    try {
      setRenderProgress('loading thumbnails...')
      const thumbImages = await Promise.all(
        selectedVideos.map(async v => {
          try {
            const res = await fetch(getThumbnailProxyUrl(v.thumbnailUrl))
            if (!res.ok) return null
            return await createImageBitmap(await res.blob())
          } catch { return null }
        })
      )

      setRenderProgress('initializing encoder...')

      type Slide = { type: 'splash-open' } | { type: 'video-card'; video: VideoOption; thumb: ImageBitmap | null } | { type: 'splash-close' }
      const slides: Slide[] = [
        { type: 'splash-open' },
        ...selectedVideos.map((video, i): Slide => ({ type: 'video-card', video, thumb: thumbImages[i] })),
        { type: 'splash-close' },
      ]
      const slideDurations = slides.map(s => s.type === 'video-card' ? CARD_DURATION_S : SPLASH_DURATION_S)

      const { Muxer, ArrayBufferTarget } = await import('mp4-muxer')
      const target = new ArrayBufferTarget()
      const AUDIO_SAMPLE_RATE = 48000
      const AUDIO_CHANNELS = 2
      const muxer = new Muxer({
        target,
        video: { codec: 'avc', width: SLIDE_W, height: SLIDE_H, frameRate: FPS },
        audio: { codec: 'aac', sampleRate: AUDIO_SAMPLE_RATE, numberOfChannels: AUDIO_CHANNELS },
        fastStart: 'in-memory',
      })

      const offscreen = new OffscreenCanvas(SLIDE_W, SLIDE_H)
      const octx = offscreen.getContext('2d')!
      let encoderError: Error | null = null
      const encoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (e) => { encoderError = e },
      })
      encoder.configure({ codec: 'avc1.640028', width: SLIDE_W, height: SLIDE_H, bitrate: 4_000_000, framerate: FPS })

      const audioEncoder = new AudioEncoder({
        output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
        error: (e) => { encoderError = e },
      })
      audioEncoder.configure({ codec: 'mp4a.40.2', sampleRate: AUDIO_SAMPLE_RATE, numberOfChannels: AUDIO_CHANNELS, bitrate: 128_000 })

      let frameIndex = 0, currentUs = 0
      for (let s = 0; s < slides.length; s++) {
        const slide = slides[s]
        const durationFrames = slideDurations[s] * FPS
        for (let f = 0; f < durationFrames; f++) {
          if (f === 0) setRenderProgress(`rendering slide ${s + 1} of ${slides.length}...`)
          if (slide.type === 'splash-open') drawSplashOpen(octx)
          else if (slide.type === 'splash-close') drawSplashClose(octx)
          else drawVideoCard(octx, slide.video, slide.thumb)
          const frame = new VideoFrame(offscreen, { timestamp: currentUs })
          encoder.encode(frame, { keyFrame: f === 0 }); frame.close()
          currentUs += 1_000_000 / FPS; frameIndex++
          if (encoderError) throw encoderError
          if (frameIndex % 10 === 0) await new Promise(r => setTimeout(r, 0))
        }
      }

      // Encode silent audio track for full video duration
      const totalSamples = Math.ceil(AUDIO_SAMPLE_RATE * (currentUs / 1_000_000))
      const CHUNK = 1024
      const silence = new Float32Array(CHUNK * AUDIO_CHANNELS)
      for (let offset = 0; offset < totalSamples; offset += CHUNK) {
        const frames = Math.min(CHUNK, totalSamples - offset)
        const audioData = new AudioData({
          format: 'f32-planar',
          sampleRate: AUDIO_SAMPLE_RATE,
          numberOfFrames: frames,
          numberOfChannels: AUDIO_CHANNELS,
          timestamp: Math.round((offset / AUDIO_SAMPLE_RATE) * 1_000_000),
          data: silence.slice(0, frames * AUDIO_CHANNELS),
        })
        audioEncoder.encode(audioData)
        audioData.close()
      }

      setRenderProgress('finalizing...')
      await encoder.flush(); encoder.close()
      await audioEncoder.flush(); audioEncoder.close()
      muxer.finalize()
      setVideoBlob(new Blob([target.buffer], { type: 'video/mp4' }))
      setRenderProgress('')
    } catch (e) {
      setPostError(`Render failed: ${String(e)}`); setRenderProgress('')
    } finally {
      setRendering(false)
    }
  }

  async function handlePost() {
    if (!videoBlob) return
    setPosting(true); setPostError(null)
    try {
      const token = await getToken()
      if (!token) throw new Error('not authenticated')

      // Upload directly from browser to Vercel Blob (bypasses 4.5MB API limit)
      const blob = await upload(`reels/reel-${Date.now()}.mp4`, videoBlob, {
        access: 'public',
        handleUploadUrl: '/api/admin/instagram/upload-reel',
        clientPayload: token,
      })
      setUploadedBlobUrl(blob.url)

      const res = await fetch('/api/admin/instagram/post-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ videoUrl: blob.url, caption }),
      })
      let data: Record<string, unknown> = {}
      try { data = await res.json() } catch { /* empty body */ }
      if (!res.ok) throw new Error((data.error as string) ?? `post failed (${res.status})`)
      setPostedUrl((data.permalink as string) ?? null)
      setVideoBlob(null)
    } catch (e) {
      setPostError(String(e))
    } finally {
      setPosting(false)
    }
  }

  async function handleRefreshToken() {
    setRefreshing(true); setRefreshResult(null)
    try {
      const token = await getToken()
      if (!token) throw new Error('not authenticated')
      const res = await fetch('/api/admin/instagram/refresh-token', {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'refresh failed')
      setRefreshResult(`Token refreshed — expires ${new Date(data.expiresAt).toLocaleDateString()}`)
    } catch (e) {
      setRefreshResult(`Failed: ${String(e)}`)
    } finally {
      setRefreshing(false)
    }
  }

  const selectedVideos = videos.filter(v => selected.has(v.id))

  return (
    <div className="flex flex-col gap-8">

      {/* Video Selection */}
      <div className="bg-mesa-light/60 border border-periwinkle/15 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-sand/40 tracking-widest">select 3–5 videos for the reel</p>
          <span className="text-xs text-sand/40">{selected.size} / 5</span>
        </div>
        {loadingVideos ? (
          <div className="w-5 h-5 border-2 border-periwinkle border-t-transparent rounded-full animate-spin" />
        ) : (
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
            {videos.map(v => {
              const isSelected = selected.has(v.id)
              const disabled = !isSelected && selected.size >= 5
              return (
                <button key={v.id} onClick={() => !disabled && toggleSelect(v.id)} disabled={disabled}
                  className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all border ${
                    isSelected ? 'border-periwinkle/40 bg-periwinkle/15'
                    : disabled ? 'border-transparent bg-mesa-light/30 opacity-40 cursor-not-allowed'
                    : 'border-periwinkle/10 bg-mesa-light/40 hover:border-periwinkle/25 hover:bg-mesa-light/60'
                  }`}
                >
                  <img src={v.thumbnailUrl} alt="" className="w-16 h-10 object-cover rounded-lg flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{v.title}</p>
                    <p className="text-xs text-sand/40 truncate">{v.channelTitle}</p>
                  </div>
                  {isSelected && <span className="ml-auto text-periwinkle-light text-sm flex-shrink-0">✓</span>}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Preview + Generate */}
      {selected.size > 0 && (
        <div className="bg-mesa-light/60 border border-periwinkle/15 rounded-xl p-6">
          <p className="text-xs text-sand/40 tracking-widest mb-4">reel preview</p>
          <div className="flex gap-6 items-start">
            <canvas ref={previewRef} width={180} height={320}
              className="rounded-xl border border-periwinkle/20 flex-shrink-0 bg-[#0d0a1a]" />
            <div className="flex flex-col gap-3 flex-1">
              <p className="text-sm text-sand/60">
                {selectedVideos.length} video{selectedVideos.length !== 1 ? 's' : ''}
                <span className="text-sand/40 text-xs ml-2">
                  ~{SPLASH_DURATION_S + selectedVideos.length * CARD_DURATION_S + SPLASH_DURATION_S}s
                </span>
              </p>
              <button onClick={handleGenerate} disabled={rendering || selected.size < 3}
                className="px-5 py-2.5 bg-periwinkle/20 border border-periwinkle/35 rounded-xl text-sm text-periwinkle-light hover:bg-periwinkle/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {rendering ? renderProgress || 'rendering...' : 'generate reel'}
              </button>
              {selected.size < 3 && <p className="text-xs text-sand/40">select at least 3 videos</p>}
            </div>
          </div>
        </div>
      )}

      {/* Download (debug) */}
      {videoBlob && (
        <a href={URL.createObjectURL(videoBlob)} download="reel.mp4"
          className="text-xs text-sand/40 hover:text-sand/70 underline self-start">
          download reel for inspection
        </a>
      )}

      {/* Post */}
      {videoBlob && (
        <div className="bg-mesa-light/60 border border-periwinkle/15 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-sand/40 tracking-widest">post to instagram</p>
            <span className="text-xs text-desert-sky/80">{(videoBlob.size / 1024 / 1024).toFixed(1)} MB ready</span>
          </div>
          <textarea value={caption} onChange={e => setCaption(e.target.value)}
            placeholder="caption (optional)..." rows={3}
            className="w-full bg-mesa-light/40 border border-periwinkle/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-sand/30 resize-none focus:outline-none focus:border-periwinkle/40" />
          <button onClick={handlePost} disabled={posting}
            className="px-5 py-2.5 bg-desert-sky/20 border border-desert-sky/35 rounded-xl text-sm text-desert-sky hover:bg-desert-sky/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {posting ? 'posting...' : 'post to instagram →'}
          </button>
        </div>
      )}

      {/* Result */}
      {postedUrl && (
        <div className="bg-desert-sky/10 border border-desert-sky/25 rounded-xl p-6">
          <p className="text-sm text-desert-sky font-medium mb-2">posted ✓</p>
          <a href={postedUrl} target="_blank" rel="noreferrer" className="text-sm text-periwinkle-light hover:underline">
            view on instagram ↗
          </a>
        </div>
      )}

      {/* Error */}
      {postError && (
        <div className="bg-red-rock/10 border border-red-rock/25 rounded-xl p-4 flex flex-col gap-2">
          <p className="text-sm text-red-rock/80">{postError}</p>
          {uploadedBlobUrl && (
            <div className="flex flex-col gap-1">
              <p className="text-xs text-sand/40">blob url (test in Graph API Explorer):</p>
              <p className="text-xs text-sand/60 break-all font-mono">{uploadedBlobUrl}</p>
            </div>
          )}
        </div>
      )}

      {/* Token refresh */}
      <div className="bg-mesa-light/40 border border-periwinkle/10 rounded-xl p-5">
        <p className="text-xs text-sand/40 tracking-widest mb-3">instagram token</p>
        <div className="flex items-center gap-3">
          <button onClick={handleRefreshToken} disabled={refreshing}
            className="text-xs px-4 py-2 bg-mesa-light/60 border border-periwinkle/20 rounded-lg text-sand/60 hover:text-sand/90 hover:border-periwinkle/35 transition-all disabled:opacity-40">
            {refreshing ? 'refreshing...' : 'refresh token (60 days)'}
          </button>
          {refreshResult && <span className="text-xs text-sand/50">{refreshResult}</span>}
        </div>
      </div>
    </div>
  )
}
