import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Clear the Signal',
  description: 'Signal through the noise. Find your frequency. AI-curated consciousness, awareness, and disclosure content.',
  openGraph: {
    title: 'Clear the Signal',
    description: 'Signal through the noise. Find your frequency.',
    siteName: 'Clear the Signal',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clear the Signal',
    description: 'Signal through the noise. Find your frequency.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} min-h-full`}>{children}</body>
    </html>
  )
}
