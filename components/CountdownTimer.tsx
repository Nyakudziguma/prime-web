// components/CountdownTimer.tsx
'use client'

import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  endTime: string
  className?: string
  onEnd?: () => void
}

export default function CountdownTimer({ 
  endTime, 
  className = '', 
  onEnd 
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('Calculating...')
  const [isEnded, setIsEnded] = useState<boolean>(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endTime)
      const now = new Date()
      const difference = end.getTime() - now.getTime()

      if (difference <= 0) {
        setIsEnded(true)
        return 'Auction ended'
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((difference / 1000 / 60) % 60)
      const seconds = Math.floor((difference / 1000) % 60)

      // Only show days if > 0
      if (days > 0) {
        return `${days}d ${hours}h ${minutes}m ${seconds}s`
      }
      return `${hours}h ${minutes}m ${seconds}s`
    }

    // Initial calculation
    const initialTimeLeft = calculateTimeLeft()
    setTimeLeft(initialTimeLeft)

    // Set up interval
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      setTimeLeft(newTimeLeft)
      
      // Check if auction just ended
      if (newTimeLeft === 'Auction ended' && !isEnded) {
        setIsEnded(true)
        if (onEnd) onEnd()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime, isEnded, onEnd])

  return (
    <span className={`${className} ${isEnded ? 'text-gray-500' : 'text-gray-800'}`}>
      {timeLeft}
    </span>
  )
}