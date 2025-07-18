'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { FiSearch, FiGrid, FiList } from 'react-icons/fi'
import { MdAttachMoney, MdTune } from 'react-icons/md'
import DashboardLayout from '@/components/DashboardLayout'

const API_URL = process.env.NEXT_PUBLIC_API_URL

const BrowseAuctions = () => {
  const [auctions, setAuctions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [isGridView, setIsGridView] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get all filter params
  const categoryId = searchParams.get('categoryId')
  const category_id = searchParams.get('category_id')
  const campaign = searchParams.get('campaign')
  const condition = searchParams.get('condition')
  const make = searchParams.get('make')
  const price_range = searchParams.get('price_range')
  const querySearch = searchParams.get('querySearch')

  const fetchAuctions = async (searchQuery = '', category = '') => {
    setLoading(true)
    let url = `${API_URL}/auctions/`

    if (searchQuery || querySearch) {
      url = `${API_URL}/auctions/search/?q=${searchQuery || querySearch}`
    } else if (category) {
      url = `${API_URL}/auctions/category/${category}/`
    } else {
      const params = new URLSearchParams()
      const appendMultiple = (key: string, value: string | string[] | null) => {
        if (!value) return
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v))
        } else {
          value
            .split(',')
            .map(v => v.trim())
            .filter(Boolean)
            .forEach(v => params.append(key, v))
        }
      }

      if (category_id) appendMultiple('category', category_id)
      if (campaign) appendMultiple('campaign', campaign)
      if (condition) appendMultiple('condition', condition)
      if (make) appendMultiple('make', make)
      if (price_range) appendMultiple('price_range', price_range)
      if (query) params.append('q', query)

      url = `${API_URL}/auctions/filters/params/?${params.toString()}`
    }

    try {
      const response = await fetch(url)
      const data = await response.json()
      setAuctions(data?.auctions || [])
    } catch (error) {
      console.error('Error fetching auctions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuctions(query, categoryId as string)
  }, [categoryId, category_id, campaign, condition, make, price_range, querySearch])

  const handleSearch = () => fetchAuctions(query)

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const AuctionTimer = ({ endTime, inOfferPeriod }: { endTime: string, inOfferPeriod: boolean }) => {
    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
      const interval = setInterval(() => {
        const now = new Date().getTime()
        const end = new Date(endTime).getTime()
        const distance = end - now

        if (distance <= 0) {
          clearInterval(interval)
          setTimeLeft('Ended')
          return
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24))
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)

        setTimeLeft(`${days ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s`)
      }, 1000)

      return () => clearInterval(interval)
    }, [endTime])

    return (
      <p className={`text-xs font-medium ${inOfferPeriod ? 'text-green-600' : 'text-red-500'}`}>
        {inOfferPeriod ? 'Offer Period' : `Ends in: ${timeLeft}`}
      </p>
    )
  }

  const renderAuctionFooter = (auction: any) => {
    if (auction.in_offer_period) {
      return (
        <button
          onClick={e => {
            e.stopPropagation()
            router.push(`/product/${auction.id}`)
          }}
          className="mt-2 bg-green-600 py-1 px-2 rounded-md flex items-center justify-center hover:bg-green-700 transition-colors w-full"
        >
          <MdAttachMoney className="text-white text-sm" />
          <span className="text-white text-xs ml-1">Make Offer</span>
        </button>
      )
    } else {
      return (
        <>
          <p className="mt-1 text-xs text-gray-500">Current Bid</p>
          <p className="text-sm font-semibold text-yellow-500">
            ${auction.highest_bid?.amount || auction.price}
          </p>
        </>
      )
    }
  }

  return (
    <DashboardLayout>
      {/* Search Bar */}
      <div className="px-4 py-2 bg-white shadow-sm top-16 z-10">
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
          <FiSearch className="text-gray-500" />
          <input
            type="text"
            placeholder="Search Products"
            className="ml-2 flex-1 text-gray-700 bg-transparent outline-none h-10"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <button onClick={() => router.push('/filters')} className="text-gray-500">
            <MdTune size={20} />
          </button>
          <button onClick={() => setIsGridView(!isGridView)} className="ml-2 text-gray-500">
            {isGridView ? <FiList size={20} /> : <FiGrid size={20} />}
          </button>
        </div>
      </div>

      {/* Auctions List */}
      <div className="px-4 mt-2 pb-24">
        {loading ? (
          <div className="flex justify-center mt-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : auctions.length === 0 ? (
          <p className="text-center mt-10 text-gray-500">No auctions found.</p>
        ) : isGridView ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {auctions.map((auction, i) => (
              <div key={auction.id || i} className="mb-4">
                <Link href={`/product/${auction.id}`} className="block hover:opacity-90 transition-opacity">
                  <div className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="relative h-48 w-full">
                      <Image
                        src={auction.images?.[0]?.image_url || 'https://backoffice.primeauctions.shop/media/preview.png'}
                        alt={auction.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm text-gray-800 truncate">
                          {auction.title}
                        </h3>
                        <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full ml-2 whitespace-nowrap">
                          Lot #{auction.id}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 truncate mt-1">
                        {auction.short_description?.replace(/<[^>]+>/g, '')}
                      </p>

                      <AuctionTimer endTime={auction.end_time} inOfferPeriod={auction.in_offer_period} />
                      {renderAuctionFooter(auction)}
                    </div>

                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {auctions.map((auction, i) => (
              <Link key={auction.id || i} href={`/product/${auction.id}`} className="block hover:opacity-90 transition-opacity">
                <div className="bg-white rounded-xl shadow-sm flex overflow-hidden mt-2">
                  <div className="relative h-28 w-28 flex-shrink-0">
                    <Image
                      src={auction.images?.[0]?.image_url || 'https://backoffice.primeauctions.shop/media/preview.png'}
                      alt={auction.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm text-gray-800 truncate">
                          {auction.title}
                        </h3>
                        <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full ml-2 whitespace-nowrap">
                          Lot #{auction.id}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 truncate mt-1">
                        {auction.short_description?.replace(/<[^>]+>/g, '')}
                      </p>

                      <AuctionTimer endTime={auction.end_time} inOfferPeriod={auction.in_offer_period} />
                      {renderAuctionFooter(auction)}
                    </div>

                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default BrowseAuctions
