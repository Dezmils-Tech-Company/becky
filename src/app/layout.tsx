import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Beauty Hive',
  description: 'Your all in one store for beauty and glamour'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return ( 
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}