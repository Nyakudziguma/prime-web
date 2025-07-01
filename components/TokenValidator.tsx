'use client' // Must be a Client Component

import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { API_URL } from '@/components/config/config'

const CHECK_INTERVAL = 2 * 60 * 1000 // 2 minutes

export const TokenValidator = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [showSessionExpired, setShowSessionExpired] = useState(false)

  // Web alternative for SecureStore
  const getItem = (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key)
    }
    return null
  }

  const deleteItem = (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key)
    }
  }

  const logout = async () => {
    await Promise.all([
      deleteItem('access'),
      deleteItem('refresh'),
      deleteItem('isLoggedIn'),
    ])
    router.replace('/auth/login')
  }

  const showSessionExpiredAlert = () => {
    if (confirm('Your session has expired. Please log in again.')) {
      setShowSessionExpired(false)
      logout()
    }
  }

  const checkToken = async () => {
    const access = getItem('access')
    const isLoggedIn = getItem('isLoggedIn')

    if (!access || isLoggedIn !== 'true') return

    try {
      await axios.get(`${API_URL}/token/check/`, {
        headers: {
          Authorization: `Bearer ${access}`,
        },
      })
      // Token is valid
    } catch {
      // Token invalid or expired
      setShowSessionExpired(true)
    }
  }

  const startTokenChecker = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      checkToken()
    }, CHECK_INTERVAL)
  }

  // Web alternative for AppState
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      checkToken()
      startTokenChecker()
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  useEffect(() => {
    if (showSessionExpired) {
      showSessionExpiredAlert()
    }
  }, [showSessionExpired])

  useEffect(() => {
    // Set up visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Initial setup
    checkToken()
    startTokenChecker()

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return <>{children}</>
}