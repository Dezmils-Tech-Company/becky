import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Beckie E-Commerce',
  description: 'Modern e-commerce platform built with Next.js, Firebase, and MongoDB'
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