// components/Banner.tsx
'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { FaHome, FaMapMarkerAlt } from 'react-icons/fa'
import { API_URL } from './config/config'
import { useWindowSize } from './hooks/useWindowSize'

type Campaign = {
  id: number
  name: string
  short_title: string
  location: string
  start_date: string
  end_date: string
  image: string
}

function Banner() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { width: screenWidth } = useWindowSize()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const scrollToIndex = useCallback((index: number) => {
    if (!scrollRef.current) return
    
    const itemWidth = (screenWidth || 0) - 40
    scrollRef.current.scrollTo({
      left: index * itemWidth,
      behavior: 'smooth'
    })
    setActiveIndex(index)
  }, [screenWidth])

  // Auto slide every 5 seconds
  useEffect(() => {
    if (campaigns.length <= 1) return // Don't auto-slide if there's only one item
    
    intervalRef.current = setInterval(() => {
      const nextIndex = (activeIndex + 1) % campaigns.length
      scrollToIndex(nextIndex)
    }, 5000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [activeIndex, campaigns.length, scrollToIndex])

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch(`${API_URL}/campaigns/active/`)
        const data = await response.json()
        setCampaigns(data)
      } catch (err) {
        setError('Failed to load campaigns')
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [])

  const handleScroll = () => {
    if (!scrollRef.current) return
    
    const scrollLeft = scrollRef.current.scrollLeft
    const itemWidth = (screenWidth || 0) - 40
    const index = Math.round(scrollLeft / itemWidth)
    setActiveIndex(index)
    
    // Reset the auto-slide timer when user manually scrolls
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    intervalRef.current = setInterval(() => {
      const nextIndex = (activeIndex + 1) % campaigns.length
      scrollToIndex(nextIndex)
    }, 5000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded-md">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    )
  }

  if (campaigns.length === 0) {
    return (
      <div className="bg-yellow-100 p-4 rounded-md">
        <p className="text-yellow-600 text-center">No active campaigns</p>
      </div>
    )
  }

  return (
    <div className="my-4">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth space-x-4 py-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style jsx>{`
          .flex::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {campaigns.map((campaign) => {
          const startDate = new Date(campaign.start_date)
          const endDate = new Date(campaign.end_date)

          const startMonth = startDate.toLocaleString('default', { month: 'short' }).toUpperCase()
          const startDay = startDate.getDate()
          const endMonth = endDate.toLocaleString('default', { month: 'short' }).toUpperCase()
          const endDay = endDate.getDate()

          return (
            <div
              key={campaign.id}
              className="flex-shrink-0 relative rounded-2xl overflow-hidden snap-center w-[calc(100vw-40px)] h-[180px] md:h-[220px] lg:h-[280px]"
            >
              <Image
                src={campaign.image}
                alt={campaign.name}
                fill
                className="object-cover"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

              <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-slate-900/90 px-3 py-2 rounded-md backdrop-blur-sm">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center">
                    <div className="w-6 flex items-center justify-center">
                      <FaHome className="text-yellow-400 text-base" />
                    </div>
                    <p className="text-white font-semibold text-lg leading-none ml-1">
                      {campaign.short_title}
                    </p>
                  </div>

                  <div className="flex items-center">
                    <div className="w-6 flex items-center justify-center">
                      <FaMapMarkerAlt className="text-yellow-400 text-sm" />
                    </div>
                    <p className="text-white text-xs leading-none ml-1">
                      {campaign.location.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 w-full flex items-end px-4 pb-4 z-10">
                <div className="flex space-x-2">
                  <div className="bg-teal-900/90 rounded-md px-2 py-1 items-center w-12 backdrop-blur-sm">
                    <p className="text-white text-xs">{startMonth}</p>
                    <p className="text-yellow-400 text-lg font-bold">{startDay}</p>
                  </div>
                  <div className="bg-teal-900/90 rounded-md px-2 py-1 items-center w-12 backdrop-blur-sm">
                    <p className="text-white text-xs">{endMonth}</p>
                    <p className="text-red-400 text-lg font-bold">{endDay}</p>
                  </div>
                </div>

                <p className="text-white text-base font-semibold ml-4 flex-1 line-clamp-2">
                  {campaign.name}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex justify-center space-x-2 mb-2">
        {campaigns.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              scrollToIndex(index)
              // Reset the auto-slide timer when user clicks on a dot
              if (intervalRef.current) {
                clearInterval(intervalRef.current)
              }
              intervalRef.current = setInterval(() => {
                const nextIndex = (activeIndex + 1) % campaigns.length
                scrollToIndex(nextIndex)
              }, 5000)
            }}
            className={`rounded-full transition-all duration-300 ${activeIndex === index ? 'w-3 h-3 bg-yellow-400' : 'w-2 h-2 bg-gray-400'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default Banner