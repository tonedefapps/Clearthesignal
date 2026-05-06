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
      {/* STARFIELD — edge-to-edge, drawn first */}
      <circle cx="0"   cy="4"   r="0.70" fill="#d4c4a8" opacity="0.26"/>
      <circle cx="13"  cy="1"   r="0.55" fill="#d4c4a8" opacity="0.19"/>
      <circle cx="27"  cy="6"   r="0.82" fill="#d4c4a8" opacity="0.28"/>
      <circle cx="41"  cy="2"   r="0.48" fill="#d4c4a8" opacity="0.16"/>
      <circle cx="57"  cy="7"   r="0.64" fill="#c8d4e8" opacity="0.22"/>
      <circle cx="71"  cy="1"   r="0.44" fill="#d4c4a8" opacity="0.15"/>
      <circle cx="85"  cy="5"   r="0.76" fill="#d4c4a8" opacity="0.26"/>
      <circle cx="99"  cy="3"   r="0.52" fill="#d4c4a8" opacity="0.18"/>
      <circle cx="112" cy="7"   r="0.68" fill="#d4c4a8" opacity="0.23"/>
      <circle cx="120" cy="2"   r="0.60" fill="#d4c4a8" opacity="0.20"/>
      <circle cx="0"   cy="117" r="0.72" fill="#d4c4a8" opacity="0.25"/>
      <circle cx="15"  cy="120" r="0.50" fill="#d4c4a8" opacity="0.17"/>
      <circle cx="31"  cy="114" r="0.66" fill="#d4c4a8" opacity="0.22"/>
      <circle cx="47"  cy="119" r="0.42" fill="#d4c4a8" opacity="0.14"/>
      <circle cx="62"  cy="116" r="0.78" fill="#d4c4a8" opacity="0.26"/>
      <circle cx="77"  cy="120" r="0.46" fill="#c8d4e8" opacity="0.16"/>
      <circle cx="91"  cy="115" r="0.60" fill="#d4c4a8" opacity="0.20"/>
      <circle cx="106" cy="119" r="0.54" fill="#d4c4a8" opacity="0.18"/>
      <circle cx="119" cy="113" r="0.74" fill="#d4c4a8" opacity="0.25"/>
      <circle cx="2"   cy="17"  r="0.68" fill="#d4c4a8" opacity="0.23"/>
      <circle cx="0"   cy="31"  r="0.58" fill="#d4c4a8" opacity="0.20"/>
      <circle cx="3"   cy="46"  r="0.80" fill="#d4c4a8" opacity="0.27"/>
      <circle cx="1"   cy="60"  r="0.52" fill="#d4c4a8" opacity="0.18"/>
      <circle cx="4"   cy="74"  r="0.74" fill="#c8d4e8" opacity="0.25"/>
      <circle cx="0"   cy="88"  r="0.60" fill="#d4c4a8" opacity="0.20"/>
      <circle cx="3"   cy="102" r="0.66" fill="#d4c4a8" opacity="0.22"/>
      <circle cx="118" cy="21"  r="0.62" fill="#d4c4a8" opacity="0.21"/>
      <circle cx="120" cy="35"  r="0.76" fill="#d4c4a8" opacity="0.26"/>
      <circle cx="117" cy="49"  r="0.50" fill="#d4c4a8" opacity="0.17"/>
      <circle cx="120" cy="63"  r="0.70" fill="#d4c4a8" opacity="0.24"/>
      <circle cx="118" cy="77"  r="0.44" fill="#c8d4e8" opacity="0.15"/>
      <circle cx="120" cy="91"  r="0.80" fill="#d4c4a8" opacity="0.27"/>
      <circle cx="117" cy="105" r="0.56" fill="#d4c4a8" opacity="0.19"/>
      <circle cx="18"  cy="14"  r="0.86" fill="#d4c4a8" opacity="0.29"/>
      <circle cx="44"  cy="11"  r="0.44" fill="#d4c4a8" opacity="0.15"/>
      <circle cx="68"  cy="15"  r="0.60" fill="#d4c4a8" opacity="0.20"/>
      <circle cx="95"  cy="12"  r="0.38" fill="#d4c4a8" opacity="0.12"/>
      <circle cx="9"   cy="27"  r="0.52" fill="#d4c4a8" opacity="0.17"/>
      <circle cx="33"  cy="22"  r="0.74" fill="#d4c4a8" opacity="0.25"/>
      <circle cx="58"  cy="29"  r="0.40" fill="#d4c4a8" opacity="0.13"/>
      <circle cx="81"  cy="24"  r="0.88" fill="#d4c4a8" opacity="0.30"/>
      <circle cx="107" cy="28"  r="0.46" fill="#d4c4a8" opacity="0.15"/>
      <circle cx="21"  cy="38"  r="0.92" fill="#d4c4a8" opacity="0.31"/>
      <circle cx="48"  cy="35"  r="0.36" fill="#d4c4a8" opacity="0.12"/>
      <circle cx="73"  cy="42"  r="0.62" fill="#c8d4e8" opacity="0.21"/>
      <circle cx="97"  cy="36"  r="0.48" fill="#d4c4a8" opacity="0.16"/>
      <circle cx="12"  cy="51"  r="0.58" fill="#d4c4a8" opacity="0.19"/>
      <circle cx="38"  cy="47"  r="0.42" fill="#d4c4a8" opacity="0.14"/>
      <circle cx="64"  cy="53"  r="0.34" fill="#d4c4a8" opacity="0.11"/>
      <circle cx="88"  cy="48"  r="0.80" fill="#d4c4a8" opacity="0.27"/>
      <circle cx="108" cy="54"  r="0.50" fill="#d4c4a8" opacity="0.17"/>
      <circle cx="25"  cy="63"  r="0.76" fill="#d4c4a8" opacity="0.26"/>
      <circle cx="50"  cy="68"  r="0.38" fill="#d4c4a8" opacity="0.13"/>
      <circle cx="72"  cy="61"  r="0.54" fill="#d4c4a8" opacity="0.18"/>
      <circle cx="94"  cy="66"  r="0.34" fill="#d4c4a8" opacity="0.11"/>
      <circle cx="110" cy="62"  r="0.66" fill="#c8d4e8" opacity="0.22"/>
      <circle cx="11"  cy="76"  r="0.44" fill="#d4c4a8" opacity="0.15"/>
      <circle cx="36"  cy="71"  r="0.84" fill="#d4c4a8" opacity="0.28"/>
      <circle cx="57"  cy="77"  r="0.36" fill="#d4c4a8" opacity="0.12"/>
      <circle cx="81"  cy="73"  r="0.60" fill="#d4c4a8" opacity="0.20"/>
      <circle cx="103" cy="79"  r="0.46" fill="#d4c4a8" opacity="0.15"/>
      <circle cx="18"  cy="87"  r="0.70" fill="#d4c4a8" opacity="0.24"/>
      <circle cx="43"  cy="83"  r="0.32" fill="#d4c4a8" opacity="0.10"/>
      <circle cx="66"  cy="90"  r="0.54" fill="#d4c4a8" opacity="0.18"/>
      <circle cx="90"  cy="85"  r="0.78" fill="#d4c4a8" opacity="0.26"/>
      <circle cx="109" cy="91"  r="0.40" fill="#d4c4a8" opacity="0.13"/>
      <circle cx="13"  cy="100" r="0.86" fill="#d4c4a8" opacity="0.29"/>
      <circle cx="38"  cy="96"  r="0.40" fill="#d4c4a8" opacity="0.13"/>
      <circle cx="62"  cy="102" r="0.62" fill="#d4c4a8" opacity="0.21"/>
      <circle cx="84"  cy="98"  r="0.34" fill="#c8d4e8" opacity="0.11"/>
      <circle cx="105" cy="103" r="0.72" fill="#d4c4a8" opacity="0.24"/>

      {/* SPIRAL — polyline starts at center; orb drawn last masks interior segment */}
      <polyline
        points="60,60 68,46 76,51 80,60 79,71 72,81 60,86 46,84 34,75 28,60 31,43 42,29 60,22 80,25 96,39 104,60"
        stroke="#6b6fad" strokeWidth="0.75" strokeLinejoin="round" strokeLinecap="round"
        fill="none" opacity="0.40"
      />

      {/* ARM */}
      <line x1="104" y1="60" x2="116" y2="14" stroke="#c4673a" strokeWidth="0.85" strokeLinecap="round" opacity="0.68"/>
      <circle cx="116" cy="14"  r="2.4" fill="#c4673a" opacity="0.95"/>

      {/* CONSTELLATION NODES — magnitude gradient inner→outer */}
      <circle cx="68"  cy="46"  r="1.0" fill="#a8c4e0" opacity="0.68"/>
      <circle cx="76"  cy="51"  r="1.1" fill="#a8c4e0" opacity="0.72"/>
      <circle cx="80"  cy="60"  r="1.1" fill="#a8c4e0" opacity="0.75"/>
      <circle cx="79"  cy="71"  r="1.2" fill="#a8c4e0" opacity="0.78"/>
      <circle cx="72"  cy="81"  r="1.2" fill="#a8c4e0" opacity="0.81"/>
      <circle cx="60"  cy="86"  r="1.3" fill="#a8c4e0" opacity="0.84"/>
      <circle cx="46"  cy="84"  r="1.3" fill="#a8c4e0" opacity="0.85"/>
      <circle cx="34"  cy="75"  r="1.4" fill="#a8c4e0" opacity="0.87"/>
      <circle cx="28"  cy="60"  r="1.4" fill="#a8c4e0" opacity="0.88"/>
      <circle cx="31"  cy="43"  r="1.5" fill="#a8c4e0" opacity="0.89"/>
      <circle cx="42"  cy="29"  r="1.5" fill="#a8c4e0" opacity="0.91"/>
      <circle cx="60"  cy="22"  r="1.6" fill="#a8c4e0" opacity="0.92"/>
      <circle cx="80"  cy="25"  r="1.6" fill="#a8c4e0" opacity="0.93"/>
      <circle cx="96"  cy="39"  r="1.7" fill="#a8c4e0" opacity="0.95"/>
      <circle cx="104" cy="60"  r="1.8" fill="#a8c4e0" opacity="0.96"/>

      {/* CENTER ORB — drawn last, masks the spiral's interior segment */}
      <circle cx="60" cy="60" r="7.5" fill="#1e1e35"/>
      <circle cx="60" cy="60" r="5.5" fill="#c8a84b" opacity="0.28"/>
      <circle cx="60" cy="60" r="3"   fill="#d4b85a" opacity="0.68"/>
      <circle cx="60" cy="60" r="1.5" fill="#f0e8e0" opacity="0.97"/>
    </svg>
  )
}

export function HorizontalLockup({ height = 48, className }: { height?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 52"
      fill="none"
      height={height}
      width={Math.round(height * 320 / 52)}
      className={className}
      aria-label="clear the signal"
    >
      {/* STARFIELD — 320×52 main space, behind everything */}
      <circle cx="0"   cy="3"   r="0.55" fill="#d4c4a8" opacity="0.22"/>
      <circle cx="14"  cy="1"   r="0.42" fill="#d4c4a8" opacity="0.15"/>
      <circle cx="33"  cy="5"   r="0.60" fill="#d4c4a8" opacity="0.20"/>
      <circle cx="57"  cy="2"   r="0.38" fill="#d4c4a8" opacity="0.13"/>
      <circle cx="81"  cy="6"   r="0.52" fill="#c8d4e8" opacity="0.18"/>
      <circle cx="108" cy="1"   r="0.44" fill="#d4c4a8" opacity="0.15"/>
      <circle cx="134" cy="4"   r="0.64" fill="#d4c4a8" opacity="0.22"/>
      <circle cx="161" cy="2"   r="0.36" fill="#d4c4a8" opacity="0.12"/>
      <circle cx="188" cy="6"   r="0.50" fill="#d4c4a8" opacity="0.17"/>
      <circle cx="215" cy="1"   r="0.42" fill="#d4c4a8" opacity="0.14"/>
      <circle cx="242" cy="5"   r="0.58" fill="#d4c4a8" opacity="0.19"/>
      <circle cx="268" cy="2"   r="0.38" fill="#c8d4e8" opacity="0.13"/>
      <circle cx="293" cy="4"   r="0.50" fill="#d4c4a8" opacity="0.17"/>
      <circle cx="319" cy="1"   r="0.46" fill="#d4c4a8" opacity="0.16"/>
      <circle cx="7"   cy="14"  r="0.48" fill="#d4c4a8" opacity="0.16"/>
      <circle cx="26"  cy="11"  r="0.66" fill="#d4c4a8" opacity="0.22"/>
      <circle cx="48"  cy="17"  r="0.36" fill="#d4c4a8" opacity="0.12"/>
      <circle cx="72"  cy="13"  r="0.56" fill="#d4c4a8" opacity="0.19"/>
      <circle cx="97"  cy="18"  r="0.42" fill="#d4c4a8" opacity="0.14"/>
      <circle cx="121" cy="12"  r="0.62" fill="#d4c4a8" opacity="0.21"/>
      <circle cx="148" cy="16"  r="0.38" fill="#d4c4a8" opacity="0.13"/>
      <circle cx="174" cy="11"  r="0.52" fill="#c8d4e8" opacity="0.17"/>
      <circle cx="200" cy="19"  r="0.44" fill="#d4c4a8" opacity="0.15"/>
      <circle cx="226" cy="14"  r="0.66" fill="#d4c4a8" opacity="0.22"/>
      <circle cx="252" cy="12"  r="0.38" fill="#d4c4a8" opacity="0.13"/>
      <circle cx="277" cy="17"  r="0.54" fill="#d4c4a8" opacity="0.18"/>
      <circle cx="303" cy="13"  r="0.42" fill="#d4c4a8" opacity="0.14"/>
      <circle cx="319" cy="18"  r="0.60" fill="#d4c4a8" opacity="0.20"/>
      <circle cx="0"   cy="26"  r="0.58" fill="#d4c4a8" opacity="0.19"/>
      <circle cx="19"  cy="28"  r="0.40" fill="#d4c4a8" opacity="0.13"/>
      <circle cx="42"  cy="25"  r="0.52" fill="#d4c4a8" opacity="0.17"/>
      <circle cx="67"  cy="29"  r="0.36" fill="#d4c4a8" opacity="0.12"/>
      <circle cx="91"  cy="26"  r="0.60" fill="#d4c4a8" opacity="0.20"/>
      <circle cx="116" cy="28"  r="0.40" fill="#c8d4e8" opacity="0.13"/>
      <circle cx="141" cy="25"  r="0.54" fill="#d4c4a8" opacity="0.18"/>
      <circle cx="167" cy="29"  r="0.38" fill="#d4c4a8" opacity="0.13"/>
      <circle cx="192" cy="26"  r="0.64" fill="#d4c4a8" opacity="0.21"/>
      <circle cx="218" cy="28"  r="0.36" fill="#d4c4a8" opacity="0.12"/>
      <circle cx="244" cy="25"  r="0.52" fill="#d4c4a8" opacity="0.17"/>
      <circle cx="270" cy="29"  r="0.44" fill="#d4c4a8" opacity="0.15"/>
      <circle cx="295" cy="26"  r="0.60" fill="#d4c4a8" opacity="0.20"/>
      <circle cx="320" cy="28"  r="0.42" fill="#d4c4a8" opacity="0.14"/>
      <circle cx="5"   cy="38"  r="0.52" fill="#d4c4a8" opacity="0.17"/>
      <circle cx="29"  cy="41"  r="0.62" fill="#d4c4a8" opacity="0.21"/>
      <circle cx="54"  cy="36"  r="0.38" fill="#d4c4a8" opacity="0.13"/>
      <circle cx="79"  cy="42"  r="0.54" fill="#d4c4a8" opacity="0.18"/>
      <circle cx="104" cy="37"  r="0.40" fill="#d4c4a8" opacity="0.13"/>
      <circle cx="129" cy="40"  r="0.58" fill="#d4c4a8" opacity="0.19"/>
      <circle cx="155" cy="36"  r="0.34" fill="#c8d4e8" opacity="0.11"/>
      <circle cx="180" cy="42"  r="0.50" fill="#d4c4a8" opacity="0.17"/>
      <circle cx="206" cy="38"  r="0.44" fill="#d4c4a8" opacity="0.15"/>
      <circle cx="232" cy="41"  r="0.66" fill="#d4c4a8" opacity="0.22"/>
      <circle cx="258" cy="37"  r="0.36" fill="#d4c4a8" opacity="0.12"/>
      <circle cx="284" cy="40"  r="0.52" fill="#d4c4a8" opacity="0.17"/>
      <circle cx="310" cy="36"  r="0.46" fill="#d4c4a8" opacity="0.15"/>
      <circle cx="320" cy="42"  r="0.58" fill="#d4c4a8" opacity="0.19"/>
      <circle cx="0"   cy="50"  r="0.56" fill="#d4c4a8" opacity="0.19"/>
      <circle cx="18"  cy="52"  r="0.40" fill="#d4c4a8" opacity="0.13"/>
      <circle cx="44"  cy="48"  r="0.50" fill="#d4c4a8" opacity="0.17"/>
      <circle cx="69"  cy="51"  r="0.36" fill="#d4c4a8" opacity="0.12"/>
      <circle cx="94"  cy="49"  r="0.60" fill="#d4c4a8" opacity="0.20"/>
      <circle cx="120" cy="52"  r="0.38" fill="#c8d4e8" opacity="0.13"/>
      <circle cx="146" cy="48"  r="0.52" fill="#d4c4a8" opacity="0.17"/>
      <circle cx="172" cy="51"  r="0.40" fill="#d4c4a8" opacity="0.13"/>
      <circle cx="198" cy="49"  r="0.58" fill="#d4c4a8" opacity="0.19"/>
      <circle cx="224" cy="52"  r="0.34" fill="#d4c4a8" opacity="0.11"/>
      <circle cx="250" cy="48"  r="0.48" fill="#d4c4a8" opacity="0.16"/>
      <circle cx="276" cy="51"  r="0.42" fill="#d4c4a8" opacity="0.14"/>
      <circle cx="302" cy="49"  r="0.56" fill="#d4c4a8" opacity="0.19"/>
      <circle cx="320" cy="50"  r="0.44" fill="#d4c4a8" opacity="0.15"/>

      {/* ICON — scale 120→52 */}
      <g transform="scale(0.4333)">
        <polyline
          points="60,60 68,46 76,51 80,60 79,71 72,81 60,86 46,84 34,75 28,60 31,43 42,29 60,22 80,25 96,39 104,60"
          stroke="#6b6fad" strokeWidth="0.75" strokeLinejoin="round" strokeLinecap="round"
          fill="none" opacity="0.40"
        />
        <line x1="104" y1="60" x2="116" y2="14" stroke="#c4673a" strokeWidth="0.85" strokeLinecap="round" opacity="0.68"/>
        <circle cx="116" cy="14"  r="2.4" fill="#c4673a" opacity="0.95"/>
        <circle cx="68"  cy="46"  r="1.0" fill="#a8c4e0" opacity="0.68"/>
        <circle cx="76"  cy="51"  r="1.1" fill="#a8c4e0" opacity="0.72"/>
        <circle cx="80"  cy="60"  r="1.1" fill="#a8c4e0" opacity="0.75"/>
        <circle cx="79"  cy="71"  r="1.2" fill="#a8c4e0" opacity="0.78"/>
        <circle cx="72"  cy="81"  r="1.2" fill="#a8c4e0" opacity="0.81"/>
        <circle cx="60"  cy="86"  r="1.3" fill="#a8c4e0" opacity="0.84"/>
        <circle cx="46"  cy="84"  r="1.3" fill="#a8c4e0" opacity="0.85"/>
        <circle cx="34"  cy="75"  r="1.4" fill="#a8c4e0" opacity="0.87"/>
        <circle cx="28"  cy="60"  r="1.4" fill="#a8c4e0" opacity="0.88"/>
        <circle cx="31"  cy="43"  r="1.5" fill="#a8c4e0" opacity="0.89"/>
        <circle cx="42"  cy="29"  r="1.5" fill="#a8c4e0" opacity="0.91"/>
        <circle cx="60"  cy="22"  r="1.6" fill="#a8c4e0" opacity="0.92"/>
        <circle cx="80"  cy="25"  r="1.6" fill="#a8c4e0" opacity="0.93"/>
        <circle cx="96"  cy="39"  r="1.7" fill="#a8c4e0" opacity="0.95"/>
        <circle cx="104" cy="60"  r="1.8" fill="#a8c4e0" opacity="0.96"/>
        <circle cx="60" cy="60" r="7.5" fill="#1e1e35"/>
        <circle cx="60" cy="60" r="5.5" fill="#c8a84b" opacity="0.28"/>
        <circle cx="60" cy="60" r="3"   fill="#d4b85a" opacity="0.68"/>
        <circle cx="60" cy="60" r="1.5" fill="#f0e8e0" opacity="0.97"/>
      </g>

      {/* WORDMARK */}
      <text x="62" y="19"
        fontFamily="'DM Sans', system-ui, -apple-system, sans-serif"
        fontSize="10.5" fontWeight="300" letterSpacing="4.5"
        fill="#e0d8f0" opacity="0.88">CLEAR THE</text>
      <text x="62" y="38"
        fontFamily="'DM Sans', system-ui, -apple-system, sans-serif"
        fontSize="15" fontWeight="400" letterSpacing="3.5"
        fill="#a8c4e0" opacity="0.94">SIGNAL</text>
    </svg>
  )
}
