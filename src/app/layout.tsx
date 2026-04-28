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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
