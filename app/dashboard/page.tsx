'use client'

import CountdownTimer from '@/components/CountdownTimer'
import DashboardLayout from '@/components/DashboardLayout'
import { useSession } from '@/components/hooks/useSession'
import { API_URL, WS_URL } from '@/components/config/config'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import AuctionTimer from '@/components/AuctionTimer'
import Banner from '@/components/Banner'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Toaster } from 'react-hot-toast'

export default function Dashboard() {
  const { isLoggedIn } = useSession()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const socketRef = useRef<WebSocket | null>(null)
  const router = useRouter()
  const scrollRefs = {
    live: useRef<HTMLDivElement>(null),
    today: useRef<HTMLDivElement>(null),
    upcoming: useRef<HTMLDivElement>(null),
    recommendations: useRef<HTMLDivElement>(null),
    newArrivals: useRef<HTMLDivElement>(null),
    categories: useRef<HTMLDivElement>(null),
    farms: useRef<HTMLDivElement>(null)
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${API_URL}/dashboard/`)
        const data = await response.json()
        setDashboardData(data)
        initializeWebSocket()
      } catch (error) {
        console.error('Failed to load dashboard data', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()

    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [])

  const scrollSection = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
  if (ref.current) {
    const scrollAmount = direction === 'left' ? -300 : 300
    ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }
}


  const initializeWebSocket = () => {
    const socket = new WebSocket(WS_URL)

    socket.onopen = () => console.log('✅ Connected to WebSocket')
    socket.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.type === 'auction_update') {
        setDashboardData((prev: any) => ({
          ...prev,
          auctions: msg.data.auctions || {
            live: [],
            today: [],
            upcoming: [],
            new_arrivals: [],
            recommendations: [],
            farms:[]
          }
        }))
      }
    }
    socket.onerror = (e) => console.log('❌ WebSocket error:', e)
    socket.onclose = () => console.log('🔌 WebSocket closed')

    socketRef.current = socket
  }

  const renderAuctionCards = (auctions: any[] | undefined) => {
  if (!auctions || auctions.length === 0) {
    return (
      <div className="w-full text-center py-4 text-gray-500">
        No auctions available
      </div>
    )
  }

  return auctions.map((auction) => {
    const hasBuyNow = auction.buy_now_price && auction.buy_now_price > 0;
    const buyNowPrice = auction.buy_now_price || 0;
    const currentBid = auction.highest_bid?.amount || auction.price;

    return (
      <div
        key={auction.id}
        onClick={() => router.push(`/auction/${auction.id}`)}
        className="w-48 bg-white rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow mr-4 flex-shrink-0 relative group"
      >
        {/* Buy Now Badge (only shown on hover if available) */}
        {hasBuyNow && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10">
            Buy Now: ${buyNowPrice.toLocaleString()}
          </div>
        )}

        <div className="relative h-28 w-full rounded-t-xl overflow-hidden">
          <Image
            src={auction.images[0]?.image_url || 'https://backoffice.primeauctions.shop/media/preview.png'}
            alt={auction.title}
            fill
            className="object-cover"
          />
        </div>
        
        <div className="p-3">
          <h3 className="font-semibold text-sm text-gray-800">{auction.title}</h3>
          <p className="text-xs text-gray-500">{auction.category || 'No category'}</p>
          <AuctionTimer 
            endTime={auction.end_time} 
            inOfferPeriod={auction.in_offer_period}
            offerPeriodEnd={auction.offer_period_end} 
          />
          
          {auction.in_offer_period ? (
            <div className="mt-1">
              <p className="text-xs text-gray-500">Reserve Not Met</p>
              <button
                className="mt-1 bg-green-600 py-1 px-2 rounded-md w-full"
                onClick={(e) => {
                  e.stopPropagation()
                  if (isLoggedIn) {
                    router.push(`/auction/${auction.id}`)
                  } else {
                    router.push('/auth/login') 
                  }
                }}
              >
                <p className="text-center text-white text-xs font-semibold">
                  {isLoggedIn ? 'Make Offer' : 'Login to Offer'}
                </p>
              </button>
            </div>
          ) : (
            <div className="mt-1">
              <p className="text-xs text-gray-500">Current Bid</p>
              <p className="text-sm font-semibold text-yellow-500">
                $ {currentBid.toLocaleString()}
              </p>
              {auction.reserve_met && (
                <p className="text-xs text-green-600 mt-1">Reserve Met</p>
              )}
              
              {/* Buttons Container - Side by side when both exist */}
              <div className={`flex gap-1 mt-1 ${hasBuyNow ? 'flex-row' : 'flex-col'}`}>
                {/* Buy Now Button (only shown if available) */}
                {hasBuyNow && (
                  <button
                    className="flex-1 bg-blue-600 py-1 px-1 rounded-md hover:bg-blue-700 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (isLoggedIn) {
                        router.push(`/auction/${auction.id}?buyNow=true`)
                      } else {
                        router.push('/auth/login')
                      }
                    }}
                  >
                    <p className="text-center text-white text-xs font-semibold truncate">
                      Buy Now
                    </p>
                  </button>
                )}

                {/* Bid Button */}
                <button
                  className={`${hasBuyNow ? 'flex-1' : 'w-full'} bg-teal-700 py-1 px-1 rounded-md hover:bg-teal-800 transition-colors`}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isLoggedIn) {
                      router.push(`/auction/${auction.id}`)
                    } else {
                      router.push('/auth/login')
                    }
                  }}
                >
                  <p className="text-center text-white text-xs font-semibold truncate">
                    {isLoggedIn ? 'Bid Now' : 'Login to Bid'}
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  })
}

  if (loading) {
    return (
      <DashboardLayout>
        <Toaster position="top-right" />

        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Search Bar */}
      <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm mb-4">
        
        <input
          type="text"
          placeholder="Ex. Mercedes Benz 2018"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ml-2 flex-1 text-gray-700 outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              router.push(`/browse-auctions?querySearch=${encodeURIComponent(searchQuery)}`)
            }
          }}
        />
      </div>

      <Banner/>
      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4 mb-6">
        <Link
          href="/sell"
          className="bg-teal-900 px-6 py-3 rounded-full shadow-md text-white font-semibold hover:bg-teal-800 transition text-center"
        >
          Sell with Prime Auctions
        </Link>
        <Link
          href="/browse-auctions"
          className="bg-yellow-600 px-6 py-3 rounded-full shadow-md text-white font-semibold hover:bg-yellow-500 transition text-center"
        >
         Start Bidding Today / Buy It Now
        </Link>
      </div>

      {/* Categories section */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Browse by Categories</h2>

        <div className="relative">
          {/* Left Scroll Button */}
          <button 
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
            onClick={() => scrollSection(scrollRefs.categories, 'left')}
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>

          {/* Scrollable Category Items */}
          <div
            ref={scrollRefs.categories}
            className="overflow-x-auto whitespace-nowrap px-1 pb-2 scrollbar-hide scroll-smooth"
          >
            {dashboardData?.categories?.map((category: any) => (
              <div
                key={category.id}
                onClick={() => router.push(`/browse-auctions?categoryId=${category.id}`)}
                className="inline-block bg-white px-4 py-3 mr-3 rounded-lg shadow-sm text-center cursor-pointer hover:shadow-md transition-shadow w-24"
              >
                <div className="flex justify-center mb-1 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="5" cy="5" r="1.5"/>
                    <circle cx="12" cy="5" r="1.5"/>
                    <circle cx="19" cy="5" r="1.5"/>
                    <circle cx="5" cy="12" r="1.5"/>
                    <circle cx="12" cy="12" r="1.5"/>
                    <circle cx="19" cy="12" r="1.5"/>
                  </svg>
                </div>
                <p className="text-xs font-medium text-yellow-600 truncate">{category.name}</p>
              </div>
            ))}
          </div>

          {/* Right Scroll Button */}
          <button 
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
            onClick={() => scrollSection(scrollRefs.categories, 'right')}
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </section>


      {/* Auction Schedule */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Auction Schedule</h2>
          <button 
            onClick={() => router.push('/browse-auctions')}
            className="text-sm text-teal-600 hover:text-teal-800"
          >
            View all
          </button>
        </div>

        <div className="flex space-x-2 mb-4">
          {['All', 'Live', 'Today', 'Upcoming'].map((tab, index) => (
            <button
              key={index}
              className={`px-4 py-1 rounded-full ${
                activeTab === index ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'
              } text-sm`}
              onClick={() => setActiveTab(index)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative">
          <button 
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
            onClick={() => scrollSection(scrollRefs.live, 'left')}
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          
          <div 
            ref={scrollRefs.live}
            className="flex overflow-x-auto space-x-4 py-2 scrollbar-hide scroll-smooth"
          >
            {activeTab === 0 && dashboardData?.auctions && renderAuctionCards([
              ...(dashboardData.auctions.live || []),
              ...(dashboardData.auctions.today || []),
              ...(dashboardData.auctions.upcoming || []),
            ].slice(0, 5))}
            {activeTab === 1 && renderAuctionCards(dashboardData?.auctions?.live)}
            {activeTab === 2 && renderAuctionCards(dashboardData?.auctions?.today)}
            {activeTab === 3 && renderAuctionCards(dashboardData?.auctions?.upcoming)}
          </div>
          
          <button 
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
            onClick={() => scrollSection(scrollRefs.live, 'right')}
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </section>

      {/* Recommendations */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Recommended For You</h2>
          <button 
            onClick={() => router.push('/browse-auctions')}
            className="text-sm text-yellow-600 hover:text-yellow-800"
          >
            View all
          </button>
        </div>

        <div className="relative">
          <button 
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
            onClick={() => scrollSection(scrollRefs.recommendations, 'left')}
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          
          <div 
            ref={scrollRefs.recommendations}
            className="flex overflow-x-auto space-x-4 py-2 scrollbar-hide scroll-smooth"
          >
            {renderAuctionCards(dashboardData?.auctions?.recommendations)}
          </div>
          
          <button 
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
            onClick={() => scrollSection(scrollRefs.recommendations, 'right')}
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">New Arrivals</h2>
          <button 
            onClick={() => router.push('/browse-auctions')}
            className="text-sm text-yellow-600 hover:text-yellow-800"
          >
            View all
          </button>
        </div>

        <div className="relative">
          <button 
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
            onClick={() => scrollSection(scrollRefs.newArrivals, 'left')}
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          
          <div 
            ref={scrollRefs.newArrivals}
            className="flex overflow-x-auto space-x-4 py-2 scrollbar-hide scroll-smooth"
          >
            {renderAuctionCards(dashboardData?.auctions?.new_arrivals)}
          </div>
          
          <button 
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
            onClick={() => scrollSection(scrollRefs.newArrivals, 'right')}
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </section>
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Stands / Farms </h2>
          <button 
            onClick={() => router.push('/browse-auctions')}
            className="text-sm text-yellow-600 hover:text-yellow-800"
          >
            View all
          </button>
        </div>

        <div className="relative">
          <button 
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
            onClick={() => scrollSection(scrollRefs.farms, 'left')}
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          
          <div 
            ref={scrollRefs.farms}
            className="flex overflow-x-auto space-x-4 py-2 scrollbar-hide scroll-smooth"
          >
            {renderAuctionCards(dashboardData?.auctions?.farms)}
          </div>
          
          <button 
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
            onClick={() => scrollSection(scrollRefs.farms, 'right')}
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </section>
    </DashboardLayout>
  )
}