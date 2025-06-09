import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DRL Crypto Trading Backtester',
  description: 'Deep Reinforcement Learning for Cryptocurrency Trading',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
