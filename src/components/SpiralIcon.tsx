interface SpiralIconProps {
  size?: number
  className?: string
}

export function SpiralIcon({ size = 24, className }: SpiralIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      fill="none"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <circle cx="18" cy="22" r="1"   fill="#d4c4a8" opacity="0.18"/>
      <circle cx="95" cy="18" r="0.8" fill="#d4c4a8" opacity="0.14"/>
      <circle cx="104" cy="88" r="1"  fill="#d4c4a8" opacity="0.16"/>
      <circle cx="14" cy="96" r="0.8" fill="#d4c4a8" opacity="0.14"/>
      <circle cx="108" cy="48" r="0.7" fill="#d4c4a8" opacity="0.12"/>
      <circle cx="22" cy="58" r="0.7" fill="#d4c4a8" opacity="0.12"/>

      <path
        d="M 71 60 C 71 53 60 46 52 50 C 41 55 38 67 43 77 C 48 88 61 91 71 86 C 85 79 88 63 82 50 C 75 35 59 30 44 36 C 26 43 20 62 27 80 C 35 100 57 107 78 100 C 102 91 110 66 101 44"
        stroke="#6b6fad" strokeWidth="2.2" strokeLinecap="round" opacity="0.88"
      />

      <path
        d="M 101 44 C 108 34 113 24 116 14"
        stroke="#c4673a" strokeWidth="2" strokeLinecap="round" opacity="0.95"
      />
      <circle cx="116" cy="14" r="3" fill="#c4673a" opacity="0.95"/>

      <circle cx="71"  cy="60"  r="2.8" fill="#a8c4e0" opacity="0.95"/>
      <circle cx="60"  cy="50"  r="2.5" fill="#a8c4e0" opacity="0.88"/>
      <circle cx="43"  cy="77"  r="2.8" fill="#a8c4e0" opacity="0.95"/>
      <circle cx="60"  cy="87"  r="2.5" fill="#a8c4e0" opacity="0.88"/>
      <circle cx="80"  cy="60"  r="2.8" fill="#a8c4e0" opacity="0.95"/>
      <circle cx="60"  cy="34"  r="2.5" fill="#a8c4e0" opacity="0.85"/>
      <circle cx="30"  cy="60"  r="2.8" fill="#a8c4e0" opacity="0.92"/>
      <circle cx="60"  cy="100" r="2.5" fill="#a8c4e0" opacity="0.82"/>
      <circle cx="100" cy="60"  r="2.5" fill="#a8c4e0" opacity="0.88"/>
      <circle cx="101" cy="44"  r="2.5" fill="#a8c4e0" opacity="0.85"/>

      <circle cx="60" cy="60" r="12"  fill="#1e1e35"/>
      <circle cx="60" cy="60" r="9"   fill="#c8a84b" opacity="0.22"/>
      <circle cx="60" cy="60" r="5.5" fill="#d4b85a" opacity="0.65"/>
      <circle cx="60" cy="60" r="2.5" fill="#e8d090" opacity="0.98"/>
    </svg>
  )
}

export function HorizontalLockup({ height = 48, className }: { height?: number; className?: string }) {
  const scale = height / 80
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 380 80"
      fill="none"
      height={height}
      width={380 * scale}
      className={className}
      aria-label="clear the signal"
    >
      <g transform="translate(0,0) scale(0.667)">
        <path
          d="M 71 60 C 71 53 60 46 52 50 C 41 55 38 67 43 77 C 48 88 61 91 71 86 C 85 79 88 63 82 50 C 75 35 59 30 44 36 C 26 43 20 62 27 80 C 35 100 57 107 78 100 C 102 91 110 66 101 44"
          stroke="#6b6fad" strokeWidth="2.6" strokeLinecap="round" opacity="0.88"
        />
        <path d="M 101 44 C 108 34 113 24 116 14" stroke="#c4673a" strokeWidth="2.4" strokeLinecap="round"/>
        <circle cx="116" cy="14" r="3.5" fill="#c4673a"/>
        <circle cx="71"  cy="60"  r="3"   fill="#a8c4e0" opacity="0.95"/>
        <circle cx="60"  cy="50"  r="2.6" fill="#a8c4e0" opacity="0.88"/>
        <circle cx="43"  cy="77"  r="3"   fill="#a8c4e0" opacity="0.95"/>
        <circle cx="60"  cy="87"  r="2.6" fill="#a8c4e0" opacity="0.88"/>
        <circle cx="80"  cy="60"  r="3"   fill="#a8c4e0" opacity="0.95"/>
        <circle cx="60"  cy="34"  r="2.6" fill="#a8c4e0" opacity="0.85"/>
        <circle cx="30"  cy="60"  r="3"   fill="#a8c4e0" opacity="0.92"/>
        <circle cx="101" cy="44"  r="2.6" fill="#a8c4e0" opacity="0.85"/>
        <circle cx="60"  cy="60"  r="13"  fill="#1e1e35"/>
        <circle cx="60"  cy="60"  r="10"  fill="#c8a84b" opacity="0.22"/>
        <circle cx="60"  cy="60"  r="6"   fill="#d4b85a" opacity="0.65"/>
        <circle cx="60"  cy="60"  r="2.8" fill="#e8d090" opacity="0.98"/>
        <circle cx="18"  cy="22"  r="1.2" fill="#d4c4a8" opacity="0.16"/>
        <circle cx="95"  cy="18"  r="1"   fill="#d4c4a8" opacity="0.13"/>
        <circle cx="104" cy="88"  r="1.2" fill="#d4c4a8" opacity="0.14"/>
        <circle cx="14"  cy="96"  r="1"   fill="#d4c4a8" opacity="0.13"/>
      </g>
      <line x1="92" y1="16" x2="92" y2="64" stroke="#6b6fad" strokeWidth="0.5" opacity="0.35"/>
      <text x="108" y="36" fontFamily="'DM Sans', system-ui, sans-serif" fontSize="13" fontWeight="400" fill="#a8c4e0" letterSpacing="5">clear the</text>
      <text x="105" y="62" fontFamily="'DM Sans', system-ui, sans-serif" fontSize="30" fontWeight="500" fill="#c4673a" letterSpacing="2">signal</text>
    </svg>
  )
}
