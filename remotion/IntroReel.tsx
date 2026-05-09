import React from 'react'
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion'
import { getLength, getPointAtLength } from '@remotion/paths'
import {
  COLORS, TAIL_PATH, SPIRAL_PATH,
  JUNCTION_NODE, SPIRAL_NODES, AMBIENT_STARS,
  FPS, FRAMES,
} from './constants'

const tailLen   = getLength(TAIL_PATH)
const spiralLen = getLength(SPIRAL_PATH)

// Portrait version (1080×1920) of the Intro composition for Instagram Reels.
// Same animation logic; layout stacks SVG + wordmark vertically in the tall frame.
export function IntroReel() {
  const frame = useCurrentFrame()

  // ── Progress values ─────────────────────────────────────────────────────────
  const originOpacity  = interpolate(frame, FRAMES.ORIGIN_FADE,  [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const tailProgress   = interpolate(frame, FRAMES.TAIL_DRAW,    [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const tailDrawn      = tailLen * tailProgress
  const tailOffset     = tailLen - tailDrawn
  const spiralProgress = interpolate(frame, FRAMES.SPIRAL_DRAW,  [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const spiralDrawn    = spiralLen * spiralProgress
  const spiralOffset   = spiralLen - spiralDrawn
  const wordmarkOpacity = interpolate(frame, FRAMES.WORDMARK_FADE, [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const wordmarkY       = interpolate(frame, FRAMES.WORDMARK_FADE, [10, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Zoom-out: scale 1.5→1 at center-glow moment
  const zoomProg  = interpolate(frame, [FRAMES.CENTER_GLOW[0], FRAMES.WORDMARK_FADE[1]], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const zoomScale = 1.5 - zoomProg * 0.5

  // ── Orb position ─────────────────────────────────────────────────────────────
  let orbX = 116, orbY = 14
  let orbInTail = true
  if (frame >= FRAMES.TAIL_DRAW[0]) {
    if (tailProgress < 1) {
      const pt = getPointAtLength(TAIL_PATH, tailDrawn)
      orbX = pt.x; orbY = pt.y; orbInTail = true
    } else if (frame < FRAMES.SPIRAL_DRAW[1] + 6) {
      const pt = getPointAtLength(SPIRAL_PATH, spiralDrawn)
      orbX = pt.x; orbY = pt.y; orbInTail = false
    }
  }
  const orbVisible = frame >= FRAMES.TAIL_DRAW[0] && frame < FRAMES.SPIRAL_DRAW[1] + 6

  // ── Center glow ──────────────────────────────────────────────────────────────
  const centerGlow = frame >= FRAMES.CENTER_GLOW[0]
    ? spring({ frame: frame - FRAMES.CENTER_GLOW[0], fps: FPS, config: { stiffness: 55, damping: 14 } })
    : 0

  // ── Junction node ─────────────────────────────────────────────────────────────
  const junctionScale = tailProgress >= 1
    ? spring({ frame: Math.max(0, frame - FRAMES.TAIL_DRAW[1]), fps: FPS, config: { stiffness: 280, damping: 16 } })
    : 0

  const fadeIn = interpolate(frame, [0, 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ background: COLORS.bg, opacity: fadeIn }}>

      {/* Column layout: SVG above wordmark, both centered in the tall frame */}
      <AbsoluteFill style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 80,
      }}>
        {/* Main SVG */}
        <svg
          viewBox="0 0 120 120"
          width={480}
          height={480}
          style={{ overflow: 'visible', transform: `scale(${zoomScale})`, transformOrigin: 'center center', flexShrink: 0 }}
        >
          <defs>
            <radialGradient id="orbGlowBlueR" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#ffffff"  stopOpacity="0.95" />
              <stop offset="25%"  stopColor="#c8dff0"  stopOpacity="0.80" />
              <stop offset="100%" stopColor="#6b6fad"  stopOpacity="0" />
            </radialGradient>
            <radialGradient id="orbGlowOrangeR" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#ffffff"  stopOpacity="0.95" />
              <stop offset="25%"  stopColor="#f0c4a0"  stopOpacity="0.80" />
              <stop offset="100%" stopColor="#c4673a"  stopOpacity="0" />
            </radialGradient>
            <radialGradient id="centerPulseR" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#a8c4e0"  stopOpacity="0.95" />
              <stop offset="55%"  stopColor="#6b6fad"  stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6b6fad"  stopOpacity="0" />
            </radialGradient>
            <filter id="glowR" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="1.8" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="softGlowR" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {AMBIENT_STARS.map((s, i) => (
            <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={COLORS.ambient} opacity={s.opacity * fadeIn} />
          ))}

          <path d={TAIL_PATH} fill="none" stroke={COLORS.tail} strokeWidth="2.4" strokeLinecap="round"
            opacity={0.95} strokeDasharray={tailLen} strokeDashoffset={tailOffset} />

          <path d={SPIRAL_PATH} fill="none" stroke={COLORS.spiral} strokeWidth="2.2" strokeLinecap="round"
            opacity={0.88} strokeDasharray={spiralLen} strokeDashoffset={spiralOffset} />

          <circle cx={116} cy={14} r={3} fill={COLORS.tail} opacity={originOpacity * 0.95} filter="url(#glowR)" />

          <circle
            cx={JUNCTION_NODE.cx} cy={JUNCTION_NODE.cy}
            r={JUNCTION_NODE.r * junctionScale}
            fill={COLORS.node}
            opacity={JUNCTION_NODE.opacity}
            filter="url(#glowR)"
          />

          {SPIRAL_NODES.map((node, i) => {
            const triggerFrame = FRAMES.SPIRAL_DRAW[0] + node.t * (FRAMES.SPIRAL_DRAW[1] - FRAMES.SPIRAL_DRAW[0])
            const nodeScale = frame >= triggerFrame
              ? spring({ frame: Math.max(0, frame - Math.round(triggerFrame)), fps: FPS, config: { stiffness: 280, damping: 16 } })
              : 0
            return (
              <circle key={i} cx={node.cx} cy={node.cy} r={node.r * nodeScale}
                fill={COLORS.node} opacity={node.opacity} filter="url(#glowR)" />
            )
          })}

          {orbVisible && (
            <>
              <circle cx={orbX} cy={orbY} r={11} fill={orbInTail ? 'url(#orbGlowOrangeR)' : 'url(#orbGlowBlueR)'} opacity={0.55} />
              <circle cx={orbX} cy={orbY} r={2.8} fill={orbInTail ? '#ffddc0' : '#e8f2ff'} opacity={0.98} filter="url(#glowR)" />
            </>
          )}

          {centerGlow > 0 && (
            <>
              <circle cx="60" cy="60" r={16 * centerGlow} fill="url(#centerPulseR)" opacity={0.45} filter="url(#softGlowR)" />
              <circle cx="60" cy="60" r={12 * centerGlow} fill={COLORS.bg} />
              <circle cx="60" cy="60" r={9   * centerGlow} fill={COLORS.spiral}    opacity={0.18} />
              <circle cx="60" cy="60" r={5.5 * centerGlow} fill={COLORS.centerMid} opacity={0.55} />
              <circle cx="60" cy="60" r={2.5 * centerGlow} fill={COLORS.node}      opacity={0.98} filter="url(#glowR)" />
            </>
          )}
        </svg>

        {/* Wordmark */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          opacity: wordmarkOpacity,
          transform: `translateY(${wordmarkY}px)`,
          fontFamily: "'DM Sans', system-ui, sans-serif",
          letterSpacing: '0.35em',
          userSelect: 'none',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 22, color: COLORS.node, fontWeight: 400, marginBottom: 8 }}>
            CLEAR THE
          </div>
          <div style={{ fontSize: 64, color: COLORS.tail, fontWeight: 500, letterSpacing: '0.15em' }}>
            SIGNAL
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
