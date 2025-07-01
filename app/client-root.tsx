'use client'

import { TokenValidator } from '@/components/TokenValidator'
import { useWebNotifications } from '@/components/hooks/useWebNotifications'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export function ClientRoot({ children }: { children: React.ReactNode }) {
  useWebNotifications()
  
  return (
    <body className={`${inter.className} min-h-screen`}>
      <TokenValidator>
        {children}
      </TokenValidator>
    </body>
  )
}