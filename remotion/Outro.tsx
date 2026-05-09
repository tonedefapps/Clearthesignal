import React from 'react'
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion'
import { getLength, getPointAtLength } from '@remotion/paths'
import {
  COLORS, SPIRAL_PATH, REVERSE_SPIRAL_PATH, REVERSE_TAIL_PATH,
  JUNCTION_NODE, SPIRAL_NODES, AMBIENT_STARS,
  FLY_OFF_DIR, FLY_OFF_DISTANCE, FLY_OFF_MAX_SCALE,
  FPS, FRAMES,
} from './constants'

const spiralLen        = getLength(SPIRAL_PATH)
const reverseSpiralLen = getLength(REVERSE_SPIRAL_PATH)
const reverseTailLen   = getLength(REVERSE_TAIL_PATH)

export function Outro() {
  const frame = useCurrentFrame()

  // ── Outward spiral traversal (center → junction) ──────────────────────────
  const spiralOutProgress = interpolate(frame, FRAMES.O_SPIRAL_OUT, [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // ── Outward tail traversal (junction → terminal star) ─────────────────────
  const tailOutProgress = interpolate(frame, FRAMES.O_TAIL_OUT, [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const tailDrawn = reverseTailLen * tailOutProgress

  // ── Orb position ──────────────────────────────────────────────────────────
  let orbX = 60, orbY = 60
  let orbInTail = false
  let orbVisible = true

  if (frame < FRAMES.O_SPIRAL_OUT[0]) {
    orbX = 60; orbY = 60
  } else if (frame < FRAMES.O_SPIRAL_OUT[1]) {
    const pt = getPointAtLength(REVERSE_SPIRAL_PATH, reverseSpiralLen * spiralOutProgress)
    orbX = pt.x; orbY = pt.y
  } else if (frame < FRAMES.O_TAIL_OUT[1]) {
    const pt = getPointAtLength(REVERSE_TAIL_PATH, tailDrawn)
    orbX = pt.x; orbY = pt.y; orbInTail = true
  } else if (frame < FRAMES.O_FLY_OFF[1]) {
    const flyProgress = interpolate(frame, FRAMES.O_FLY_OFF, [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    const eased = flyProgress * flyProgress
    orbX = 116 + FLY_OFF_DIR.x * eased * FLY_OFF_DISTANCE
    orbY = 14  + FLY_OFF_DIR.y * eased * FLY_OFF_DISTANCE
    orbInTail = true
  } else {
    orbVisible = false
  }

  // ── Orb opacity & scale during fly-off ────────────────────────────────────
  const orbOpacity = frame >= FRAMES.O_FLY_OFF[0]
    ? interpolate(frame, [
        FRAMES.O_FLY_OFF[0],
        FRAMES.O_FLY_OFF[0] + (FRAMES.O_FLY_OFF[1] - FRAMES.O_FLY_OFF[0]) * 0.4,
        FRAMES.O_FLY_OFF[1],
      ], [1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1

  const orbScale = frame >= FRAMES.O_FLY_OFF[0]
    ? interpolate(frame, FRAMES.O_FLY_OFF, [1, FLY_OFF_MAX_SCALE], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 1

  // ── Center glow: full during hold, collapses as orb departs ───────────────
  const centerGlow = frame < FRAMES.O_CENTER_OUT[0]
    ? 1
    : 1 - spring({ frame: frame - FRAMES.O_CENTER_OUT[0], fps: FPS, config: { stiffness: 70, damping: 12 } })

  // ── Junction node: fades when orb reaches the tail ────────────────────────
  const junctionOpacity = frame < FRAMES.O_TAIL_OUT[0]
    ? 1
    : interpolate(frame, [FRAMES.O_TAIL_OUT[0], FRAMES.O_TAIL_OUT[0] + 8], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // ── Constellation nodes: pop off as outward orb passes each one ───────────
  // t is fraction along original SPIRAL_PATH (0=junction, 1=center).
  // tReverse = 1-t is the fraction along REVERSE_SPIRAL_PATH at which the orb passes this node.
  function nodePopOff(t: number): number {
    const tRev = 1 - t
    if (spiralOutProgress < tRev) return 1  // orb hasn't reached this node yet
    const framePassed = FRAMES.O_SPIRAL_OUT[0] + tRev * (FRAMES.O_SPIRAL_OUT[1] - FRAMES.O_SPIRAL_OUT[0])
    const s = spring({ frame: Math.max(0, frame - Math.round(framePassed)), fps: FPS, config: { stiffness: 280, damping: 16 } })
    return Math.max(0, 1 - s)
  }

  // ── Spiral path: shrinks from center end as orb travels outward ───────────
  // Original SPIRAL_PATH goes junction→center. The orb departed from center,
  // so the center end retracts first. Visible = (1-spiralOutProgress) * spiralLen.
  const spiralVisible = spiralLen * (1 - spiralOutProgress)

  // ── Wordmark: fades in after orb flies off, then fades out ────────────────
  const wordmarkInOpacity  = interpolate(frame, FRAMES.O_WORDMARK_IN, [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const wordmarkOutOpacity = interpolate(frame, FRAMES.O_FADE_OUT,    [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const wordmarkOpacity    = wordmarkInOpacity * wordmarkOutOpacity
  const wordmarkY          = interpolate(frame, FRAMES.O_WORDMARK_IN, [8, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // ── Overall fade to black ─────────────────────────────────────────────────
  const fadeOut = interpolate(frame, FRAMES.O_FADE_OUT, [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ background: COLORS.bg, opacity: fadeOut }}>

      {/* Wordmark — fades in after the orb flies off, then fades to black */}
      <div style={{
        position: 'absolute',
        bottom: 200,
        left: 0, right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: wordmarkOpacity,
        transform: `translateY(${wordmarkY}px)`,
        fontFamily: "'DM Sans', system-ui, sans-serif",
        letterSpacing: '0.35em',
        userSelect: 'none',
      }}>
        <div style={{ fontSize: 22, color: COLORS.node, fontWeight: 400, letterSpacing: '0.5em', opacity: 0.85, marginBottom: 6 }}>
          CLEAR THE
        </div>
        <div style={{
          fontSize: 72,
          color: COLORS.tail,
          fontWeight: 600,
          letterSpacing: '0.18em',
          lineHeight: 1,
          textShadow: `0 0 60px ${COLORS.tail}66, 0 0 120px ${COLORS.tail}33`,
        }}>
          SIGNAL
        </div>
        <div style={{
          width: 1,
          height: 36,
          background: `linear-gradient(to bottom, transparent, ${COLORS.spiral}88, transparent)`,
          marginTop: 16,
        }} />
        <div style={{ fontSize: 13, color: COLORS.spiral, fontWeight: 400, letterSpacing: '0.4em', opacity: 0.6, marginTop: 8 }}>
          CLEARTHESIGNAL.COM
        </div>
      </div>

      {/* Main SVG */}
      <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 120 120" width={520} height={520} style={{ overflow: 'visible' }}>
          <defs>
            <radialGradient id="orbGlowBlueO" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#ffffff"  stopOpacity="0.95" />
              <stop offset="20%"  stopColor="#c8dff0"  stopOpacity="0.85" />
              <stop offset="100%" stopColor="#6b6fad"  stopOpacity="0" />
            </radialGradient>
            <radialGradient id="orbGlowOrangeO" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#ffffff"  stopOpacity="0.95" />
              <stop offset="20%"  stopColor="#f0c4a0"  stopOpacity="0.85" />
              <stop offset="100%" stopColor="#c4673a"  stopOpacity="0" />
            </radialGradient>
            <radialGradient id="centerPulseO" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#a8c4e0"  stopOpacity="0.95" />
              <stop offset="55%"  stopColor="#6b6fad"  stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6b6fad"  stopOpacity="0" />
            </radialGradient>
            <filter id="glowO" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="1.8" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="softGlowO" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="bigGlowO" x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Ambient stars */}
          {AMBIENT_STARS.map((s, i) => (
            <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={COLORS.ambient} opacity={s.opacity} />
          ))}

          {/* Original tail — fades as orb flies off */}
          <path
            d="M 116 14 L 104 60"
            fill="none"
            stroke={COLORS.tail}
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity={frame < FRAMES.O_FLY_OFF[0]
              ? 0.95
              : interpolate(frame, FRAMES.O_FLY_OFF, [0.95, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
          />

          {/* Original spiral — retracts from center end as orb travels outward */}
          <path
            d={SPIRAL_PATH}
            fill="none"
            stroke={COLORS.spiral}
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity={0.88}
            strokeDasharray={`${spiralVisible} ${spiralLen}`}
          />

          {/* Terminal star — fades as fly-off begins */}
          <circle cx={116} cy={14} r={3} fill={COLORS.tail}
            opacity={interpolate(frame, [FRAMES.O_FLY_OFF[0], FRAMES.O_FLY_OFF[0] + 6], [0.95, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
            filter="url(#glowO)"
          />

          {/* Junction node */}
          <circle
            cx={JUNCTION_NODE.cx} cy={JUNCTION_NODE.cy}
            r={JUNCTION_NODE.r}
            fill={COLORS.node}
            opacity={JUNCTION_NODE.opacity * junctionOpacity}
            filter="url(#glowO)"
          />

          {/* Constellation nodes — pop off as orb passes each one outward */}
          {SPIRAL_NODES.map((node, i) => (
            <circle
              key={i}
              cx={node.cx} cy={node.cy}
              r={node.r}
              fill={COLORS.node}
              opacity={node.opacity * nodePopOff(node.t)}
              filter="url(#glowO)"
            />
          ))}

          {/* Orb */}
          {orbVisible && (
            <>
              <circle
                cx={orbX} cy={orbY}
                r={18 * orbScale}
                fill={orbInTail ? 'url(#orbGlowOrangeO)' : 'url(#orbGlowBlueO)'}
                opacity={0.35 * orbOpacity}
                filter={orbScale > 2 ? 'url(#bigGlowO)' : undefined}
              />
              <circle
                cx={orbX} cy={orbY}
                r={11 * orbScale}
                fill={orbInTail ? 'url(#orbGlowOrangeO)' : 'url(#orbGlowBlueO)'}
                opacity={0.55 * orbOpacity}
              />
              <circle
                cx={orbX} cy={orbY}
                r={2.8 * orbScale}
                fill={orbInTail ? '#ffddc0' : '#e8f2ff'}
                opacity={0.98 * orbOpacity}
                filter="url(#glowO)"
              />
            </>
          )}

          {/* Center glow — full at start, collapses as orb departs */}
          {centerGlow > 0 && (
            <>
              <circle cx="60" cy="60" r={16 * centerGlow} fill="url(#centerPulseO)" opacity={0.45} filter="url(#softGlowO)" />
              <circle cx="60" cy="60" r={12 * centerGlow} fill={COLORS.bg} />
              <circle cx="60" cy="60" r={9   * centerGlow} fill={COLORS.spiral}     opacity={0.18} />
              <circle cx="60" cy="60" r={5.5  * centerGlow} fill={COLORS.centerMid} opacity={0.55} />
              <circle cx="60" cy="60" r={2.5  * centerGlow} fill={COLORS.node}      opacity={0.98} filter="url(#glowO)" />
            </>
          )}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  )
}
