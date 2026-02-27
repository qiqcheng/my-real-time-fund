import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '基金估值实时追踪',
  description: '实时追踪基金估值变化',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
