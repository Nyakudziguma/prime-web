'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckIcon, Square2StackIcon } from '@heroicons/react/24/outline'
import DashboardLayout from '@/components/DashboardLayout'

// Define filter item structure
type FilterItem = {
  id?: number | string
  name?: string
  count?: number
  make?: string
  condition?: string
  min?: number
  max?: number | null
  label?: string
}

type FilterState = {
  campaigns: number[]
  makes: string[]
  categories: number[]
  conditions: string[]
  priceRanges: string[] // will store range labels like "Under $100"
}

const FiltersPage = () => {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<FilterItem[]>([])
  const [makes, setMakes] = useState<FilterItem[]>([])
  const [categories, setCategories] = useState<FilterItem[]>([])
  const [conditions, setConditions] = useState<FilterItem[]>([])
  const [loading, setLoading] = useState(true)

  const [priceRanges, setPriceRanges] = useState<FilterItem[]>([])
  const [selected, setSelected] = useState<FilterState>({
    campaigns: [],
    makes: [],
    categories: [],
    conditions: [],
    priceRanges: [],
  })
  useEffect(() => {
  const fetchFilters = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auctions/filters/`)
      const data = await res.json()
      setCampaigns(data.campaigns)
      setMakes(data.makes)
      setCategories(data.categories)
      setConditions(data.conditions)
      setPriceRanges(data.price_ranges) // Add this line
    } catch (error) {
      console.error('Error fetching filters:', error)
    } finally {
      setLoading(false)
    }
  }

  fetchFilters()
}, [])
  const toggle = <T extends keyof FilterState>(type: T, value: FilterState[T][number]) => {
  setSelected((prev) => {
    const list = prev[type] as Array<typeof value>
    const exists = list.includes(value)
    const updated = exists
      ? list.filter((v) => v !== value)
      : [...list, value]

    return {
      ...prev,
      [type]: updated,
    }
  })
}


  const renderFilterGroup = (
    title: string,
    items: FilterItem[],
    type: keyof FilterState,
    key: 'name' | 'make' | 'condition' | 'label' = 'name'
  ) => (
    <div className="mb-4">
      <h3 className="font-semibold text-base text-gray-700 mb-2">{title}</h3>
      {items.map((item) => {
        const id = item.id ?? item[key]
        const label = item.name ?? item[key]
        const count = item.count ?? 0
        const isSelected = selected[type].includes(id as never)

        return (
          <button
            key={id}
            onClick={() => toggle(type, id as never)}
            className="flex items-center justify-between w-full bg-white px-3 py-3 rounded-md mb-1 shadow-sm hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              {isSelected ? (
                <CheckIcon className="w-5 h-5 text-amber-400" />
              ) : (
                <Square2StackIcon className="w-5 h-5 text-amber-400" />
              )}
              <span className="text-gray-800">{label}</span>
            </div>
            <span className="text-gray-500">{count}</span>
          </button>
        )
      })}
    </div>
  )

const handleShowLots = () => {
  const { campaigns, categories, conditions, makes, priceRanges: selectedPriceRanges } = selected;
  const queryParams = new URLSearchParams();

  if (campaigns.length > 0) queryParams.append('campaign', campaigns.join(','));
  if (categories.length > 0) queryParams.append('category_id', categories.join(','));
  if (conditions.length > 0) queryParams.append('condition', conditions.join(','));
  if (makes.length > 0) queryParams.append('make', makes.join(','));

  // Add price range filtering
  if (selectedPriceRanges.length > 0) {
    const selectedRanges = selectedPriceRanges.map(rangeLabel => {
      const foundRange = priceRanges.find(r => r.label === rangeLabel);
      return `${foundRange?.min}-${foundRange?.max}`;
    });
    queryParams.append('price_range', selectedRanges.join(','));
  }

  router.push(`/browse-auctions?${queryParams.toString()}`);
};

  return (
    <div className="relative min-h-screen bg-stone-100">
      <DashboardLayout>
        <div className="flex-1 pb-20">
          {loading ? (
            <div className="flex justify-center items-center mt-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
            </div>
          ) : (
            <div className="px-4 pt-4 overflow-y-auto">
              {renderFilterGroup('Campaigns', campaigns, 'campaigns')}
              {renderFilterGroup('Makes', makes, 'makes', 'make')}
              {renderFilterGroup('Categories', categories, 'categories')}
              {renderFilterGroup('Conditions', conditions, 'conditions', 'condition')}
              {renderFilterGroup('Price Range', priceRanges, 'priceRanges', 'label')}
            </div>
          )}
        </div>
      </DashboardLayout>

      {/* Fixed Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-10">
        <div className="max-w-7xl mx-auto flex justify-center">
          <button
            className="w-full md:w-1/2 bg-teal-700 py-3 rounded-xl text-white font-semibold text-base hover:bg-teal-800 transition-colors"
            onClick={handleShowLots}
          >
            Show Lots
          </button>
        </div>
      </div>
    </div>
  )
}

export default FiltersPage
