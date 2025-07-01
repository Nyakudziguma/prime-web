// hooks/useSession.ts
'use client'

import { useEffect, useState } from 'react'
import { API_URL } from '../config/config'
export const useSession = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [bidCount, setBidCount] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Web alternative for SecureStore
  const getItem = (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key)
    }
    return null
  }

  const checkLogin = async () => {
    const loggedIn = getItem('isLoggedIn')
    setIsLoggedIn(loggedIn === 'true')
    setIsLoading(false)
  }

  const fetchStats = async () => {
    try {
      const access = getItem('access')
      if (!access) return

      const response = await fetch(`${API_URL}/user/dashboard-stats/`, {
        headers: { 
          'Authorization': `Bearer ${access}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Important for cookies if using them
      })

      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }

      const data = await response.json()
      setBidCount(data.active_bids || 0)
      setUnreadMessages(data.unread_notifications || 0)
    } catch (err) {
      console.error('Error fetching stats:', err)
      // Optional: Handle error state
    }
  }

  const updateStats = (newBidCount: number, newUnreadMessages: number) => {
    setBidCount(newBidCount)
    setUnreadMessages(newUnreadMessages)
  }

  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('isLoggedIn')
    setIsLoggedIn(false)
    setBidCount(0)
    setUnreadMessages(0)
  }

  const login = (token: string) => {
    localStorage.setItem('access', token)
    localStorage.setItem('isLoggedIn', 'true')
    setIsLoggedIn(true)
    fetchStats()
  }

  useEffect(() => {
    checkLogin()

    // Listen for storage events to sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'isLoggedIn') {
        checkLogin()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  useEffect(() => {
    if (isLoggedIn) {
      fetchStats()
      
      // Set up polling for stats updates (alternative to WebSocket)
      const interval = setInterval(fetchStats, 30000) // Every 30 seconds
      return () => clearInterval(interval)
    }
  }, [isLoggedIn])

  return { 
    isLoggedIn,
    isLoading,
    bidCount, 
    unreadMessages,
    updateStats,
    refreshStats: fetchStats,
    logout,
    login
  }
}