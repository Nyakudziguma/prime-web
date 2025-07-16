// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { ClientRoot } from './client-root'

export const metadata: Metadata = {
  title: 'Prime Edge',
  description: 'Your one stop solution for online auctions',
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <ClientRoot>
        {children}
      </ClientRoot>
    </html>
  )
}