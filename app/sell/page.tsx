'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EnvelopeIcon, HomeIcon, PhoneArrowDownLeftIcon, UserIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline'
import DashboardLayout from '@/components/DashboardLayout'
import toast from 'react-hot-toast'

const SellPage = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    item_description: '',
    phone_number: ''
  })
  const [loading, setLoading] = useState(false)

   const handleSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!formData.name || !formData.email || !formData.item_description) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seller-submissions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Your submission has been received! We will contact you shortly.')
        router.push('/dashboard')
      } else {
        throw new Error('Submission failed')
      }
    } catch (error) {
      toast.error('There was a problem submitting your form. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex-1 bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          {/* Header Section */}
          <div className="text-center my-8">
            <div className="flex justify-center">
              <WrenchScrewdriverIcon className="h-14 w-14 text-teal-700" />
            </div>
            <h1 className="text-2xl font-bold text-teal-800 mt-4 mb-2">Sell With Us</h1>
            <p className="text-gray-600 mb-6">
              Whether you're new to selling or a regular with us, it's easier than ever to get your 
              product into our auction. Simply fill the form to get started.
            </p>
          </div>

          {/* Form Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Seller Information</h2>

            {/* Name Input */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Full Name *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Email *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Phone Number *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneArrowDownLeftIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="phone_number"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                  placeholder="+263 ...  "
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                />
              </div>
            </div>

            {/* Address Input */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-1">Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HomeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                  placeholder="123 Main St, City"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            {/* Item Description */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-1">What are you looking to sell? *</label>
              <textarea
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                placeholder="Describe your item(s) in detail..."
                rows={4}
                value={formData.item_description}
                onChange={(e) => setFormData({ ...formData, item_description: e.target.value })}
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full bg-teal-700 py-3 rounded-lg text-white font-semibold hover:bg-teal-800 transition-colors ${loading ? 'opacity-50' : ''}`}
            >
              {loading ? (
                <span className="flex justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Submit for Review'
              )}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default SellPage