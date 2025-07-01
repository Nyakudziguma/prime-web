// hooks/useAuth.ts
'use client'

import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { API_URL } from '@/components/config/config'

type User = {
  email: string
  full_name?: string
}

type AuthResponse = {
  success: boolean
  token?: string
  user?: User
}

export const useAuth = () => {
  const [error, setError] = useState('')
  const router = useRouter()

  // Web storage helpers
  const setItem = (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value)
    }
  }

  const getItem = (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key)
    }
    return null
  }

  const removeItem = (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key)
    }
  }

  const login = async ({ email, password }: { email: string; password: string }): Promise<AuthResponse> => {
    try {
      const res = await axios.post(`${API_URL}/token/`, { email, password })
      const { access, refresh, user } = res.data

      // Store tokens and user data
      setItem('access', access)
      setItem('refresh', refresh)
      setItem('isLoggedIn', 'true')
      setItem('user_email', user?.email || email)

      setError('')
      return { 
        success: true,
        token: access,
        user: {
          email: user?.email || email,
          full_name: user?.full_name
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Login failed'
      setError(errorMessage)
      return { success: false }
    }
  }

  const logout = async () => {
    // Clear all auth-related items
    removeItem('access')
    removeItem('refresh')
    removeItem('isLoggedIn')
    removeItem('user_email')
    
    router.push('/auth/login')
  }

  const refreshAccessToken = async (): Promise<string | null> => {
    const refresh = getItem('refresh')
    if (!refresh) {
      await logout()
      return null
    }

    try {
      const res = await axios.post(`${API_URL}/token/refresh/`, { refresh })
      setItem('access', res.data.access)
      return res.data.access
    } catch {
      await logout()
      return null
    }
  }

  return { login, logout, refreshAccessToken, error }
}