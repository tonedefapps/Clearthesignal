import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
  title: 'clear the signal',
  description: 'clear the signal. find your frequency. AI-curated consciousness, awareness, and disclosure content.',
  openGraph: {
    title: 'clear the signal',
    description: 'clear the signal. find your frequency.',
    siteName: 'clear the signal',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'clear the signal',
    description: 'clear the signal. find your frequency.',
  },
}

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' fill='white' filter='url(%23n)'/%3E%3C/svg%3E")`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        {/* film grain — white-fill rect so bright speckles screen-blend on dark bg */}
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundImage: GRAIN_SVG,
            backgroundSize: '200px 200px',
            opacity: 0.12,
            mixBlendMode: 'screen',
            pointerEvents: 'none',
            zIndex: 9998,
          }}
        />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
