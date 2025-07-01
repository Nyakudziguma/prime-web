'use client'

import { InformationCircleIcon, ArrowLeftIcon, UsersIcon, TrophyIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import Img from '../../assets/images/about-header.jpg' 
export default function AboutPage() {
  const router = useRouter()

  return (
    <DashboardLayout>
      {/* Header - Replaced by DashboardLayout's header */}
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header Image */}
        <div className="relative w-full h-48">
          <Image
            src={Img}
            alt="About Prime Auctions"
            fill
            className="object-cover"
          />
        </div>

        {/* Content Container */}
        <div className="p-5">
          {/* Title with Icon */}
          <div className="flex items-center mb-5">
            <InformationCircleIcon className="w-7 h-7 mr-3 text-teal-700" />
            <h1 className="text-2xl font-bold text-teal-800">
              Know About Us
            </h1>
          </div>

          {/* Description Text */}
          <p className="text-base leading-6 text-gray-700 mb-6 text-justify">
            Prime Auctions is a leading auction platform specializing in delivering seamless, competitive bidding experiences. 
            We provide a wide range of auction services, helping buyers and sellers connect efficiently through secure and 
            transparent processes. Our user-friendly platform ensures that each auction is smooth, fair, and delivers maximum 
            value. Whether you're looking to buy or sell, Prime Auctions offers an exciting, dynamic environment for achieving 
            the best outcomes in every auction. Join us and experience the thrill of bidding with confidence.
          </p>

          {/* Team Section */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <UsersIcon className="w-6 h-6 mr-3 text-teal-700" />
              <h2 className="text-xl font-semibold text-teal-800">Our Team</h2>
            </div>
            <p className="text-base leading-6 text-gray-700 text-justify">
              Our dedicated team of auction professionals brings years of experience and passion to every transaction, 
              ensuring you get the best possible service.
            </p>
          </div>

          {/* Mission Section */}
          <div className="mb-8">
            <div className="flex items-center mb-3">
              <TrophyIcon className="w-6 h-6 mr-3 text-teal-700" />
              <h2 className="text-xl font-semibold text-teal-800">Our Mission</h2>
            </div>
            <p className="text-base leading-6 text-gray-700 text-justify">
              To revolutionize the auction industry by creating transparent, accessible, and exciting bidding experiences 
              for everyone.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}