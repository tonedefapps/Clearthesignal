'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { upload } from '@vercel/blob/client'
import { useAuth } from '@/context/AuthContext'

interface VideoOption {
  id: string
  title: string
  channelTitle: string
  thumbnailUrl: string
  youtubeUrl?: string
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

// ── Intro Animation (Canvas port of Remotion IntroReel) ──────────────────────
const INTRO_TOTAL_FRAMES = 208
const _S = 4, _OX = 300, _OY = 590  // 120-unit SVG → 480px block, centered in 1080

function _ic(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)) }
function _ii(f: number, f0: number, f1: number, v0: number, v1: number) {
  return v0 + (v1 - v0) * _ic((f - f0) / (f1 - f0), 0, 1)
}
function _isp(f: number, k: number, d: number) {
  if (f <= 0) return 0
  let x = 0, v = 0
  for (let i = 0; i < Math.min(f, 120); i++) { const a = k * (1 - x) - d * v; v += a / 30; x += v / 30 }
  return _ic(x, 0, 1.5)
}
function _ilen(pts: [number, number][]) {
  let n = 0
  for (let i = 1; i < pts.length; i++) { const dx = pts[i][0]-pts[i-1][0], dy = pts[i][1]-pts[i-1][1]; n += Math.sqrt(dx*dx+dy*dy) }
  return n
}
function _ipt(pts: [number, number][], d: number): [number, number] {
  let r = d
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0]-pts[i-1][0], dy = pts[i][1]-pts[i-1][1], s = Math.sqrt(dx*dx+dy*dy)
    if (r <= s) { const t = r/s; return [pts[i-1][0]+dx*t, pts[i-1][1]+dy*t] }
    r -= s
  }
  return pts[pts.length-1]
}
const _px = (x: number) => _OX + x * _S
const _py = (y: number) => _OY + y * _S

const _TP: [number, number][] = [[116,14],[104,60]]
const _SP: [number, number][] = [[104,60],[96,39],[80,25],[60,22],[42,29],[31,43],[28,60],[34,75],[46,84],[60,86],[72,81],[79,71],[80,60],[76,51],[68,46],[60,60]]
const _TL = _ilen(_TP)
const _SL = _ilen(_SP)

const _ND = [
  {cx:96,cy:39,r:1.7,t:0.10,o:0.95},{cx:80,cy:25,r:1.6,t:0.19,o:0.93},
  {cx:60,cy:22,r:1.6,t:0.27,o:0.92},{cx:42,cy:29,r:1.5,t:0.35,o:0.91},
  {cx:31,cy:43,r:1.5,t:0.43,o:0.89},{cx:28,cy:60,r:1.4,t:0.50,o:0.88},
  {cx:34,cy:75,r:1.4,t:0.57,o:0.87},{cx:46,cy:84,r:1.3,t:0.64,o:0.85},
  {cx:60,cy:86,r:1.3,t:0.70,o:0.84},{cx:72,cy:81,r:1.2,t:0.75,o:0.81},
  {cx:79,cy:71,r:1.2,t:0.80,o:0.78},{cx:80,cy:60,r:1.1,t:0.85,o:0.75},
  {cx:76,cy:51,r:1.1,t:0.89,o:0.72},{cx:68,cy:46,r:1.0,t:0.93,o:0.68},
]

const _ST = [
  {cx:0,cy:4,r:.70,o:.26},{cx:13,cy:1,r:.55,o:.19},{cx:27,cy:6,r:.82,o:.28},
  {cx:41,cy:2,r:.48,o:.16},{cx:57,cy:7,r:.64,o:.22},{cx:71,cy:1,r:.44,o:.15},
  {cx:85,cy:5,r:.76,o:.26},{cx:99,cy:3,r:.52,o:.18},{cx:112,cy:7,r:.68,o:.23},
  {cx:120,cy:2,r:.60,o:.20},{cx:0,cy:117,r:.72,o:.25},{cx:15,cy:120,r:.50,o:.17},
  {cx:31,cy:114,r:.66,o:.22},{cx:47,cy:119,r:.42,o:.14},{cx:62,cy:116,r:.78,o:.26},
  {cx:77,cy:120,r:.46,o:.16},{cx:91,cy:115,r:.60,o:.20},{cx:106,cy:119,r:.54,o:.18},
  {cx:119,cy:113,r:.74,o:.25},{cx:2,cy:17,r:.68,o:.23},{cx:0,cy:31,r:.58,o:.20},
  {cx:3,cy:46,r:.80,o:.27},{cx:1,cy:60,r:.52,o:.18},{cx:4,cy:74,r:.74,o:.25},
  {cx:0,cy:88,r:.60,o:.20},{cx:3,cy:102,r:.66,o:.22},{cx:118,cy:21,r:.62,o:.21},
  {cx:120,cy:35,r:.76,o:.26},{cx:117,cy:49,r:.50,o:.17},{cx:120,cy:63,r:.70,o:.24},
  {cx:118,cy:77,r:.44,o:.15},{cx:120,cy:91,r:.80,o:.27},{cx:117,cy:105,r:.56,o:.19},
  {cx:18,cy:14,r:.86,o:.29},{cx:44,cy:11,r:.44,o:.15},{cx:68,cy:15,r:.60,o:.20},
  {cx:95,cy:12,r:.38,o:.12},{cx:9,cy:27,r:.52,o:.17},{cx:33,cy:22,r:.74,o:.25},
  {cx:58,cy:29,r:.40,o:.13},{cx:81,cy:24,r:.88,o:.30},{cx:107,cy:28,r:.46,o:.15},
  {cx:21,cy:38,r:.92,o:.31},{cx:48,cy:35,r:.36,o:.12},{cx:73,cy:42,r:.62,o:.21},
  {cx:97,cy:36,r:.48,o:.16},{cx:12,cy:51,r:.58,o:.19},{cx:38,cy:47,r:.42,o:.14},
  {cx:64,cy:53,r:.34,o:.11},{cx:88,cy:48,r:.80,o:.27},{cx:108,cy:54,r:.50,o:.17},
  {cx:25,cy:63,r:.76,o:.26},{cx:50,cy:68,r:.38,o:.13},{cx:72,cy:61,r:.54,o:.18},
  {cx:94,cy:66,r:.34,o:.11},{cx:110,cy:62,r:.66,o:.22},{cx:11,cy:76,r:.44,o:.15},
  {cx:36,cy:71,r:.84,o:.28},{cx:57,cy:77,r:.36,o:.12},{cx:81,cy:73,r:.60,o:.20},
  {cx:103,cy:79,r:.46,o:.15},{cx:18,cy:87,r:.70,o:.24},{cx:43,cy:83,r:.32,o:.10},
  {cx:66,cy:90,r:.54,o:.18},{cx:90,cy:85,r:.78,o:.26},{cx:109,cy:91,r:.40,o:.13},
  {cx:13,cy:100,r:.86,o:.29},{cx:38,cy:96,r:.40,o:.13},{cx:62,cy:102,r:.62,o:.21},
  {cx:84,cy:98,r:.34,o:.11},{cx:105,cy:103,r:.72,o:.24},
]

// Full-canvas starfield in pixel space (covers entire 1080×1920 frame)
const _CST = (() => {
  const out: {cx:number,cy:number,r:number,o:number}[] = []
  let sd = 314159
  const rng = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 0x100000000 }
  for (let i = 0; i < 180; i++) out.push({cx:rng()*SLIDE_W, cy:rng()*SLIDE_H, r:0.5+rng()*2.5, o:0.06+rng()*0.28})
  return out
})()

function drawIntroFrame(ctx: OffscreenCanvasRenderingContext2D, frame: number) {
  ctx.fillStyle = '#1e1e35'; ctx.fillRect(0, 0, SLIDE_W, SLIDE_H)
  ctx.globalAlpha = 1

  const fadeIn        = _ii(frame, 0, 4, 0, 1)
  const tailProg      = _ii(frame, 8, 22, 0, 1)
  const spiralProg    = _ii(frame, 22, 68, 0, 1)
  const tailDrawn     = _TL * tailProg
  const spiralDrawn   = _SL * spiralProg
  const originOp      = _ii(frame, 0, 8, 0, 1)
  const wordmarkOp    = _ii(frame, 76, 88, 0, 1)
  const wordmarkDY    = _ii(frame, 76, 88, 10, 0)
  const zoomScale     = 1.5 - _ic((frame - 68) / (88 - 68), 0, 1) * 0.5
  const centerGlow    = frame >= 68 ? _isp(frame - 68, 55, 14) : 0
  const junctionScale = tailProg >= 1 ? _isp(Math.max(0, frame - 22), 280, 16) : 0

  let orbX = 116, orbY = 14, orbInTail = true
  const orbVisible = frame >= 8 && frame < 74
  if (frame >= 8) {
    if (tailProg < 1) {
      const [px, py] = _ipt(_TP, tailDrawn); orbX=px; orbY=py; orbInTail=true
    } else if (frame < 74) {
      const [px, py] = _ipt(_SP, spiralDrawn); orbX=px; orbY=py; orbInTail=false
    }
  }

  // Full-canvas starfield (outside zoom, covers entire frame)
  for (const s of _CST) {
    ctx.beginPath(); ctx.arc(s.cx, s.cy, s.r, 0, Math.PI*2)
    ctx.fillStyle = '#d4c4a8'; ctx.globalAlpha = s.o * fadeIn; ctx.fill()
  }

  const pivX = _px(60), pivY = _py(60)
  ctx.save()
  ctx.translate(pivX, pivY); ctx.scale(zoomScale, zoomScale); ctx.translate(-pivX, -pivY)

  for (const s of _ST) {
    ctx.beginPath(); ctx.arc(_px(s.cx), _py(s.cy), Math.max(0.5, s.r * _S * 0.5), 0, Math.PI*2)
    ctx.fillStyle = '#d4c4a8'; ctx.globalAlpha = s.o * fadeIn; ctx.fill()
  }

  if (tailDrawn > 0) {
    ctx.beginPath(); ctx.moveTo(_px(116), _py(14)); ctx.lineTo(_px(104), _py(60))
    ctx.strokeStyle='#c4673a'; ctx.lineWidth=2.4*_S; ctx.lineCap='round'
    ctx.setLineDash([tailDrawn*_S, _TL*_S]); ctx.globalAlpha=0.95*fadeIn; ctx.stroke(); ctx.setLineDash([])
  }

  if (spiralDrawn > 0) {
    ctx.beginPath(); ctx.moveTo(_px(104), _py(60))
    for (let i = 1; i < _SP.length; i++) ctx.lineTo(_px(_SP[i][0]), _py(_SP[i][1]))
    ctx.strokeStyle='#6b6fad'; ctx.lineWidth=2.2*_S; ctx.lineCap='round'
    ctx.setLineDash([spiralDrawn*_S, _SL*_S]); ctx.globalAlpha=0.88*fadeIn; ctx.stroke(); ctx.setLineDash([])
  }

  ctx.shadowColor='#c4673a'; ctx.shadowBlur=8*_S
  ctx.beginPath(); ctx.arc(_px(116), _py(14), 3*_S, 0, Math.PI*2)
  ctx.fillStyle='#c4673a'; ctx.globalAlpha=originOp*0.95*fadeIn; ctx.fill(); ctx.shadowBlur=0

  if (junctionScale > 0) {
    ctx.shadowColor='#a8c4e0'; ctx.shadowBlur=6*_S
    ctx.beginPath(); ctx.arc(_px(104), _py(60), 1.8*_S*junctionScale, 0, Math.PI*2)
    ctx.fillStyle='#a8c4e0'; ctx.globalAlpha=0.96*fadeIn; ctx.fill(); ctx.shadowBlur=0
  }

  for (const nd of _ND) {
    const trigF = 22 + nd.t * (68 - 22)
    const ns = frame >= trigF ? _isp(Math.max(0, frame - Math.round(trigF)), 280, 16) : 0
    if (ns > 0) {
      ctx.shadowColor='#a8c4e0'; ctx.shadowBlur=5*_S
      ctx.beginPath(); ctx.arc(_px(nd.cx), _py(nd.cy), nd.r*_S*ns, 0, Math.PI*2)
      ctx.fillStyle='#a8c4e0'; ctx.globalAlpha=nd.o*fadeIn; ctx.fill(); ctx.shadowBlur=0
    }
  }

  if (orbVisible) {
    const ocx = _px(orbX), ocy = _py(orbY)
    const g1 = ctx.createRadialGradient(ocx, ocy, 0, ocx, ocy, 11*_S)
    if (orbInTail) {
      g1.addColorStop(0,'rgba(255,255,255,.95)'); g1.addColorStop(.25,'rgba(240,196,160,.8)'); g1.addColorStop(1,'rgba(196,103,58,0)')
    } else {
      g1.addColorStop(0,'rgba(255,255,255,.95)'); g1.addColorStop(.25,'rgba(200,223,240,.8)'); g1.addColorStop(1,'rgba(107,111,173,0)')
    }
    ctx.beginPath(); ctx.arc(ocx, ocy, 11*_S, 0, Math.PI*2)
    ctx.fillStyle=g1; ctx.globalAlpha=0.55*fadeIn; ctx.fill()
    ctx.shadowColor=orbInTail?'#ffddc0':'#e8f2ff'; ctx.shadowBlur=8*_S
    ctx.beginPath(); ctx.arc(ocx, ocy, 2.8*_S, 0, Math.PI*2)
    ctx.fillStyle=orbInTail?'#ffddc0':'#e8f2ff'; ctx.globalAlpha=0.98*fadeIn; ctx.fill(); ctx.shadowBlur=0
  }

  if (centerGlow > 0) {
    const cc = _px(60), ccy = _py(60)
    const g2 = ctx.createRadialGradient(cc, ccy, 0, cc, ccy, 16*_S*centerGlow)
    g2.addColorStop(0,'rgba(168,196,224,.95)'); g2.addColorStop(.55,'rgba(107,111,173,.25)'); g2.addColorStop(1,'rgba(107,111,173,0)')
    ctx.beginPath(); ctx.arc(cc, ccy, 16*_S*centerGlow, 0, Math.PI*2); ctx.fillStyle=g2; ctx.globalAlpha=0.45; ctx.fill()
    ctx.beginPath(); ctx.arc(cc, ccy, 9*_S*centerGlow, 0, Math.PI*2); ctx.fillStyle='#6b6fad'; ctx.globalAlpha=0.18; ctx.fill()
    ctx.beginPath(); ctx.arc(cc, ccy, 5.5*_S*centerGlow, 0, Math.PI*2); ctx.fillStyle='#8f93c9'; ctx.globalAlpha=0.55; ctx.fill()
    ctx.shadowColor='#a8c4e0'; ctx.shadowBlur=10*_S
    ctx.beginPath(); ctx.arc(cc, ccy, 2.5*_S*centerGlow, 0, Math.PI*2); ctx.fillStyle='#a8c4e0'; ctx.globalAlpha=0.98; ctx.fill()
    ctx.shadowBlur=0
  }

  ctx.restore()
  ctx.globalAlpha = 1

  if (wordmarkOp > 0) {
    const wY = _py(120) + 80 + wordmarkDY
    ctx.globalAlpha = wordmarkOp; ctx.textAlign = 'center'
    ctx.font = '300 44px system-ui, sans-serif'; ctx.fillStyle = '#a8c4e0'
    ctx.fillText('CLEAR THE', SLIDE_W / 2, wY + 44)
    ctx.font = '500 128px system-ui, sans-serif'; ctx.fillStyle = '#c4673a'
    ctx.fillText('SIGNAL', SLIDE_W / 2, wY + 44 + 8 + 128)
    ctx.globalAlpha = 1
  }
}

// ── Outro Animation (reverse of intro: orb departs center, flies off, wordmark lands) ──
const OUTRO_TOTAL_FRAMES = 120

const _RSP: [number,number][] = [[60,60],[68,46],[76,51],[80,60],[79,71],[72,81],[60,86],[46,84],[34,75],[28,60],[31,43],[42,29],[60,22],[80,25],[96,39],[104,60]]
const _RTP: [number,number][] = [[104,60],[116,14]]
const _RSL = _ilen(_RSP)
const _RTL = _ilen(_RTP)
const _FOX = 0.252, _FOY = -0.968  // fly-off direction (normalized)

function _outroNodeOp(spiralOutProg: number, frame: number, t: number): number {
  const tRev = 1 - t
  if (spiralOutProg < tRev) return 1
  return Math.max(0, 1 - _isp(Math.max(0, frame - Math.round(10 + tRev * 55)), 280, 16))
}

function drawOutroFrame(ctx: OffscreenCanvasRenderingContext2D, frame: number) {
  ctx.fillStyle = '#1e1e35'; ctx.fillRect(0, 0, SLIDE_W, SLIDE_H)
  ctx.globalAlpha = 1

  const spiralOutProg = _ii(frame, 10, 65, 0, 1)
  const tailOutProg   = _ii(frame, 65, 78, 0, 1)
  const spiralVisible = _SL * (1 - spiralOutProg)
  const centerGlow    = frame < 8 ? 1 : Math.max(0, 1 - _isp(frame - 8, 70, 12))
  const junctionOp    = frame < 65 ? 1 : _ii(frame, 65, 73, 1, 0)
  const tailOp        = frame < 76 ? 0.95 : _ii(frame, 76, 96, 0.95, 0)
  const originOp      = frame < 76 ? 0.95 : _ii(frame, 76, 82, 0.95, 0)
  const orbScale      = frame >= 78 ? _ii(frame, 78, 96, 1, 6) : 1
  const orbOpacity    = frame < 76 ? 1 : _ii(frame, 84, 96, 1, 0)
  const wordmarkOp    = _ii(frame, 90, 108, 0, 1) * _ii(frame, 110, 120, 1, 0)
  const wordmarkDY    = _ii(frame, 90, 108, 8, 0)

  let orbCX = _px(60), orbCY = _py(60), orbInTail = false, orbVisible = true
  if (frame < 10) {
    orbCX = _px(60); orbCY = _py(60)
  } else if (frame < 65) {
    const [px,py] = _ipt(_RSP, _RSL * spiralOutProg); orbCX=_px(px); orbCY=_py(py)
  } else if (frame < 78) {
    const [px,py] = _ipt(_RTP, _RTL * tailOutProg); orbCX=_px(px); orbCY=_py(py); orbInTail=true
  } else if (frame < 96) {
    const eased = Math.pow(_ii(frame, 78, 96, 0, 1), 2)
    orbCX=_px(116)+_FOX*eased*2200; orbCY=_py(14)+_FOY*eased*2200; orbInTail=true
  } else { orbVisible=false }

  // Full-canvas starfield
  for (const s of _CST) {
    ctx.beginPath(); ctx.arc(s.cx, s.cy, s.r, 0, Math.PI*2)
    ctx.fillStyle='#d4c4a8'; ctx.globalAlpha=s.o; ctx.fill()
  }
  // SVG-area starfield
  for (const s of _ST) {
    ctx.beginPath(); ctx.arc(_px(s.cx), _py(s.cy), Math.max(0.5, s.r*_S*0.5), 0, Math.PI*2)
    ctx.fillStyle='#d4c4a8'; ctx.globalAlpha=s.o; ctx.fill()
  }

  // Tail
  ctx.beginPath(); ctx.moveTo(_px(116),_py(14)); ctx.lineTo(_px(104),_py(60))
  ctx.strokeStyle='#c4673a'; ctx.lineWidth=2.4*_S; ctx.lineCap='round'
  ctx.setLineDash([]); ctx.globalAlpha=tailOp; ctx.stroke()

  // Spiral (retracts from center as orb moves outward)
  if (spiralVisible > 0) {
    ctx.beginPath(); ctx.moveTo(_px(104),_py(60))
    for (let i=1; i<_SP.length; i++) ctx.lineTo(_px(_SP[i][0]),_py(_SP[i][1]))
    ctx.strokeStyle='#6b6fad'; ctx.lineWidth=2.2*_S; ctx.lineCap='round'
    ctx.setLineDash([spiralVisible*_S, _SL*_S]); ctx.globalAlpha=0.88; ctx.stroke(); ctx.setLineDash([])
  }

  // Origin star
  ctx.shadowColor='#c4673a'; ctx.shadowBlur=8*_S
  ctx.beginPath(); ctx.arc(_px(116),_py(14),3*_S,0,Math.PI*2)
  ctx.fillStyle='#c4673a'; ctx.globalAlpha=originOp; ctx.fill(); ctx.shadowBlur=0

  // Junction node
  ctx.shadowColor='#a8c4e0'; ctx.shadowBlur=6*_S
  ctx.beginPath(); ctx.arc(_px(104),_py(60),1.8*_S,0,Math.PI*2)
  ctx.fillStyle='#a8c4e0'; ctx.globalAlpha=0.96*junctionOp; ctx.fill(); ctx.shadowBlur=0

  // Constellation nodes (pop off as orb passes outward)
  for (const nd of _ND) {
    const nodeOp = _outroNodeOp(spiralOutProg, frame, nd.t)
    if (nodeOp > 0) {
      ctx.shadowColor='#a8c4e0'; ctx.shadowBlur=5*_S
      ctx.beginPath(); ctx.arc(_px(nd.cx),_py(nd.cy),nd.r*_S,0,Math.PI*2)
      ctx.fillStyle='#a8c4e0'; ctx.globalAlpha=nd.o*nodeOp; ctx.fill(); ctx.shadowBlur=0
    }
  }

  // Orb
  if (orbVisible && orbOpacity > 0) {
    const g1 = ctx.createRadialGradient(orbCX,orbCY,0,orbCX,orbCY,18*_S*orbScale)
    if (orbInTail) { g1.addColorStop(0,'rgba(255,255,255,.95)');g1.addColorStop(.2,'rgba(240,196,160,.85)');g1.addColorStop(1,'rgba(196,103,58,0)') }
    else           { g1.addColorStop(0,'rgba(255,255,255,.95)');g1.addColorStop(.2,'rgba(200,223,240,.85)');g1.addColorStop(1,'rgba(107,111,173,0)') }
    ctx.beginPath(); ctx.arc(orbCX,orbCY,18*_S*orbScale,0,Math.PI*2)
    ctx.fillStyle=g1; ctx.globalAlpha=0.35*orbOpacity; ctx.fill()
    const g2 = ctx.createRadialGradient(orbCX,orbCY,0,orbCX,orbCY,11*_S*orbScale)
    if (orbInTail) { g2.addColorStop(0,'rgba(255,255,255,.95)');g2.addColorStop(.2,'rgba(240,196,160,.85)');g2.addColorStop(1,'rgba(196,103,58,0)') }
    else           { g2.addColorStop(0,'rgba(255,255,255,.95)');g2.addColorStop(.2,'rgba(200,223,240,.85)');g2.addColorStop(1,'rgba(107,111,173,0)') }
    ctx.beginPath(); ctx.arc(orbCX,orbCY,11*_S*orbScale,0,Math.PI*2)
    ctx.fillStyle=g2; ctx.globalAlpha=0.55*orbOpacity; ctx.fill()
    ctx.shadowColor=orbInTail?'#ffddc0':'#e8f2ff'; ctx.shadowBlur=8*_S*orbScale
    ctx.beginPath(); ctx.arc(orbCX,orbCY,2.8*_S*orbScale,0,Math.PI*2)
    ctx.fillStyle=orbInTail?'#ffddc0':'#e8f2ff'; ctx.globalAlpha=0.98*orbOpacity; ctx.fill(); ctx.shadowBlur=0
  }

  // Center glow (full at start, collapses as orb departs)
  if (centerGlow > 0) {
    const cc=_px(60), ccy=_py(60)
    const g3=ctx.createRadialGradient(cc,ccy,0,cc,ccy,16*_S*centerGlow)
    g3.addColorStop(0,'rgba(168,196,224,.95)');g3.addColorStop(.55,'rgba(107,111,173,.25)');g3.addColorStop(1,'rgba(107,111,173,0)')
    ctx.beginPath(); ctx.arc(cc,ccy,16*_S*centerGlow,0,Math.PI*2); ctx.fillStyle=g3; ctx.globalAlpha=0.45; ctx.fill()
    ctx.beginPath(); ctx.arc(cc,ccy,9*_S*centerGlow,0,Math.PI*2); ctx.fillStyle='#6b6fad'; ctx.globalAlpha=0.18; ctx.fill()
    ctx.beginPath(); ctx.arc(cc,ccy,5.5*_S*centerGlow,0,Math.PI*2); ctx.fillStyle='#8f93c9'; ctx.globalAlpha=0.55; ctx.fill()
    ctx.shadowColor='#a8c4e0'; ctx.shadowBlur=10*_S
    ctx.beginPath(); ctx.arc(cc,ccy,2.5*_S*centerGlow,0,Math.PI*2); ctx.fillStyle='#a8c4e0'; ctx.globalAlpha=0.98; ctx.fill()
    ctx.shadowBlur=0
  }

  ctx.globalAlpha = 1

  // Wordmark lands after orb flies off
  if (wordmarkOp > 0) {
    const wY = _py(120) + 80 + wordmarkDY
    ctx.globalAlpha=wordmarkOp; ctx.textAlign='center'
    ctx.font='300 44px system-ui, sans-serif'; ctx.fillStyle='#a8c4e0'
    ctx.fillText('CLEAR THE', SLIDE_W/2, wY+44)
    ctx.font='500 128px system-ui, sans-serif'; ctx.fillStyle='#c4673a'
    ctx.fillText('SIGNAL', SLIDE_W/2, wY+44+8+128)
    ctx.globalAlpha=1
  }

  // Fade to black
  const fadeOut = _ii(frame, 110, 120, 0, 1)
  if (fadeOut > 0) {
    ctx.globalAlpha=fadeOut; ctx.fillStyle='#1e1e35'; ctx.fillRect(0,0,SLIDE_W,SLIDE_H); ctx.globalAlpha=1
  }
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

// ── Audio Generation ─────────────────────────────────────────────────────────

async function generateAudioBuffer(
  totalS: number, introEndS: number, outroStartS: number
): Promise<[Float32Array, Float32Array]> {
  const SR = 48000
  const ctx = new OfflineAudioContext(2, Math.ceil(totalS * SR), SR)
  const master = ctx.createGain(); master.gain.value = 0.65; master.connect(ctx.destination)

  function addTone(freq: number, t: number, dur: number, gain: number, atk = 0.05) {
    const osc = ctx.createOscillator(), g = ctx.createGain()
    osc.type = 'sine'; osc.frequency.value = freq
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(gain, t + atk)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(g); g.connect(master); osc.start(t); osc.stop(t + dur + 0.05)
  }

  function addNoise(t: number, dur: number, gain: number, centerFreq: number, q = 0.5) {
    const sz = Math.ceil(dur * SR)
    const buf = ctx.createBuffer(1, sz, SR)
    const d = buf.getChannelData(0); for (let i = 0; i < sz; i++) d[i] = Math.random() * 2 - 1
    const src = ctx.createBufferSource(); src.buffer = buf
    const filt = ctx.createBiquadFilter(); filt.type = 'bandpass'
    filt.frequency.value = centerFreq; filt.Q.value = q
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + 0.03)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    src.connect(filt); filt.connect(g); g.connect(master); src.start(t); src.stop(t + dur)
  }

  // ── Intro ─────────────────────────────────────────────────────────────────
  addTone(110, 0, introEndS, 0.06, 1.2)           // deep space pad
  addTone(220, 0.5, introEndS - 0.5, 0.03, 1.8)   // octave shimmer
  addNoise(0.27, 0.6, 0.04, 1000)                  // tail trace
  // Node sparkles as constellation maps itself
  const ss = 22/30, se = 68/30
  const nodeData: [number, number][] = [
    [.10,523],[.19,587],[.27,659],[.35,740],[.43,830],[.50,932],
    [.57,1047],[.64,1175],[.70,1047],[.75,932],[.80,830],[.85,740],[.89,659],[.93,587],
  ]
  nodeData.forEach(([t, freq]) => addTone(freq, ss + t*(se-ss), 0.25, 0.012, 0.01))
  // Center glow ignition
  addTone(880, 2.27, 3.0, 0.09, 0.02)
  addTone(1320, 2.30, 2.2, 0.04, 0.02)
  addNoise(2.27, 0.35, 0.07, 2500, 0.4)
  // Wordmark resolves and holds
  addTone(440, 2.53, introEndS - 2.53, 0.07, 0.15)
  addTone(330, 2.65, introEndS - 2.65, 0.03, 0.20)

  // ── Outro ─────────────────────────────────────────────────────────────────
  const os = outroStartS
  addTone(110, os, 4.0, 0.05, 0.4)                // grounding pad
  addTone(880, os, 0.8, 0.06, 0.03)               // center glow resonance echo
  addTone(165, os + 0.33, 2.3, 0.04, 0.5)         // departure tension
  addTone(220, os + 0.80, 1.8, 0.02, 0.5)
  // Fly-off whoosh (layered low→mid→high)
  const fo = os + 78/30
  addNoise(fo,        1.10, 0.12, 300,  0.3)
  addNoise(fo + 0.15, 0.80, 0.08, 1200, 0.35)
  addNoise(fo + 0.25, 0.55, 0.05, 4500, 0.4)
  // Wordmark landing chime
  addTone(440, os + 3.0,  1.5, 0.06, 0.06)
  addTone(880, os + 3.07, 1.0, 0.03, 0.02)

  const rendered = await ctx.startRendering()
  return [rendered.getChannelData(0).slice(), rendered.getChannelData(1).slice()]
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
  const [cardDuration, setCardDuration] = useState(6)
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
            youtubeUrl: vid.youtubeUrl as string | undefined,
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
      const slideDurations = slides.map(s => {
        if (s.type === 'splash-open') return INTRO_TOTAL_FRAMES / FPS
        if (s.type === 'splash-close') return OUTRO_TOTAL_FRAMES / FPS
        if (s.type === 'video-card') return cardDuration
        return SPLASH_DURATION_S
      })

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
          if (slide.type === 'splash-open') drawIntroFrame(octx, f)
          else if (slide.type === 'splash-close') drawOutroFrame(octx, f)
          else drawVideoCard(octx, slide.video, slide.thumb)
          const frame = new VideoFrame(offscreen, { timestamp: currentUs })
          encoder.encode(frame, { keyFrame: f === 0 }); frame.close()
          currentUs += 1_000_000 / FPS; frameIndex++
          if (encoderError) throw encoderError
          if (frameIndex % 10 === 0) await new Promise(r => setTimeout(r, 0))
        }
      }

      // Generate and encode branded audio
      setRenderProgress('generating audio...')
      const totalDurationS = currentUs / 1_000_000
      const [leftCh, rightCh] = await generateAudioBuffer(
        totalDurationS,
        INTRO_TOTAL_FRAMES / FPS,
        totalDurationS - OUTRO_TOTAL_FRAMES / FPS
      )
      const totalSamples = leftCh.length
      const CHUNK = 1024
      for (let offset = 0; offset < totalSamples; offset += CHUNK) {
        const frames = Math.min(CHUNK, totalSamples - offset)
        const chunkData = new Float32Array(frames * 2)
        chunkData.set(leftCh.subarray(offset, offset + frames), 0)
        chunkData.set(rightCh.subarray(offset, offset + frames), frames)
        const audioData = new AudioData({
          format: 'f32-planar',
          sampleRate: AUDIO_SAMPLE_RATE,
          numberOfFrames: frames,
          numberOfChannels: AUDIO_CHANNELS,
          timestamp: Math.round((offset / AUDIO_SAMPLE_RATE) * 1_000_000),
          data: chunkData,
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

      // Auto-populate caption with CTS links for every featured video
      const renderedVideos = videos.filter(v => selected.has(v.id))
      const links = renderedVideos.map(v => `clearthesignal.com/v/${v.id}`).join('\n')
      setCaption(prev => {
        const base = prev.trim()
        return base ? `${base}\n\n${links}` : links
      })
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
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-sm text-sand/60">
                  {selectedVideos.length} video{selectedVideos.length !== 1 ? 's' : ''}
                  <span className="text-sand/40 text-xs ml-2">
                    ~{Math.round(INTRO_TOTAL_FRAMES / FPS + selectedVideos.length * cardDuration + OUTRO_TOTAL_FRAMES / FPS)}s
                  </span>
                </p>
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-xs text-sand/40">per video</span>
                  {[5, 6, 7].map(s => (
                    <button key={s} onClick={() => setCardDuration(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-all ${cardDuration === s ? 'bg-periwinkle/30 text-periwinkle-light border border-periwinkle/40' : 'text-sand/40 hover:text-sand/60 border border-transparent'}`}>
                      {s}s
                    </button>
                  ))}
                </div>
              </div>
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
