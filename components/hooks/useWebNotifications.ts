'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useWebNotifications() {
  const router = useRouter()

  useEffect(() => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return
    }

    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('Notification permission granted')
      }
    })

    // Handle notification click (for PWA)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.link) {
          router.push(event.data.link)
        }
      })
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', () => {})
      }
    }
  }, [router])
}