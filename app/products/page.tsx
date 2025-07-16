// app/browse-auctions/page.tsx (server component)
import React, { Suspense } from 'react'
import BrowseAuctions from '@/components/BrowseAuctions'

export default function BrowseAuctionsPage() {
  return (
    <Suspense fallback={<div>Loading products...</div>}>
      <BrowseAuctions />
    </Suspense>
  )
}
