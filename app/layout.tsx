import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Aistos Debt Payment',
  description: 'Debt payment application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}

