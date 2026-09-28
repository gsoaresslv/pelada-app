import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pelada App',
  description: 'Avaliação, gestão de peladas e sorteio de times',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
