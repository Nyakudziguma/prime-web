// components/AuctionTimer.tsx
'use client'

import { useEffect, useState } from 'react'
import { ClockIcon, CheckIcon } from '@heroicons/react/24/outline'

interface AuctionTimerProps {
  endTime: string
  inOfferPeriod?: boolean
  offerPeriodEnd?: string
  className?: string
  onTimerEnd?: () => void
  onOfferPeriodEnd?: () => void
}

export default function AuctionTimer({
  endTime,
  inOfferPeriod = false,
  offerPeriodEnd,
  className = '',
  onTimerEnd,
  onOfferPeriodEnd
}: AuctionTimerProps) {
  const [timeLeft, setTimeLeft] = useState('Calculating...')
  const [isEnded, setIsEnded] = useState(false)
  const [isOfferPeriod, setIsOfferPeriod] = useState(inOfferPeriod)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const targetTime = isOfferPeriod && offerPeriodEnd ? 
        new Date(offerPeriodEnd).getTime() : 
        new Date(endTime).getTime()

      const distance = targetTime - now

      // Handle timer completion
      if (distance <= 0) {
        if (isOfferPeriod) {
          setIsOfferPeriod(false)
          onOfferPeriodEnd?.()
        } else {
          setIsEnded(true)
          onTimerEnd?.()
        }
        return 'Ended'
      }

      // Calculate time units
      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      // Format based on remaining time
      if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`
      }
      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`
      }
      return `${minutes}m ${seconds}s`
    }

    // Initial calculation
    setTimeLeft(calculateTimeLeft())

    // Set up interval
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime, offerPeriodEnd, isOfferPeriod, onTimerEnd, onOfferPeriodEnd])

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {isEnded ? (
        <>
          <CheckIcon className="h-4 w-4 text-gray-500" />
          <span className="text-gray-500 text-sm">Auction ended</span>
        </>
      ) : (
        <>
          <ClockIcon className={`h-4 w-4 ${isOfferPeriod ? 'text-green-600' : 'text-red-500'}`} />
          <span className={`text-sm ${isOfferPeriod ? 'text-green-600' : 'text-red-500'}`}>
            {isOfferPeriod ? `Offer ends in: ${timeLeft}` : `Auction ends in: ${timeLeft}`}
          </span>
        </>
      )}
    </div>
  )
}