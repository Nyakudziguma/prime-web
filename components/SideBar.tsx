// components/Sidebar.tsx
'use client'

import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { useSession } from './hooks/useSession'
import {
  HomeIcon,
  ScaleIcon,
  InboxIcon,
  UserIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  ShoppingCartIcon,
  DocumentChartBarIcon,
  DocumentArrowDownIcon,
  CreditCardIcon,
  DocumentCheckIcon, 
  ShoppingBagIcon
} from '@heroicons/react/24/outline'
import logo from '@/assets/images/logo_white.png'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoggedIn, bidCount, unreadMessages } = useSession()

  const handleProtectedRoute = (route: string) => {
    if (isLoggedIn) {
      router.push(route)
    } else {
      router.push('/auth/login')
    }
  }
  const handleLogout = async () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('isLoggedIn')
    router.push('/auth/login')
  }

  const navItems = [
    { name: 'Home', icon: HomeIcon, route: '/dashboard', protected: false },
    {name: 'Products', icon:ShoppingBagIcon, route: '/products', protected: false},
    { name: 'My Products', icon: ScaleIcon, route: '/my-products', protected: true },
    { name: 'Messages', icon: InboxIcon, route: '/messages', protected: true, badge: unreadMessages },
    { name: 'Profile', icon: UserIcon, route: '/profile', protected: true },
    { name: 'Payments', icon: CreditCardIcon, route: '/deposits', protected: true },
    { name: 'Buyer\'s Guide', icon: DocumentChartBarIcon, route: '/buyers-guide', protected: true },
    { name: 'Seller\'s Guide', icon: DocumentArrowDownIcon, route: '/sellers-guide', protected: true },
    { name: 'Settings', icon: CogIcon, route: '/settings', protected: true },
    {name: 'About Us', icon: UserIcon, route: '/about', protected: false},
    {name: 'Terms & Conditions', icon: DocumentCheckIcon , route: '/terms-of-service', protected: false},
  ]

  // Check if current route matches or starts with the item's route
  const isActive = (route: string) => {
    return pathname === route || pathname.startsWith(`${route}/`)
  }

  return (
    <div className="h-full flex flex-col border-r-4 border-teal-600 bg-white shadow-lg">
      {/* Logo Section */}
      <div className="flex items-center justify-center p-6 bg-teal-900">
        <div className="flex items-center space-x-3">
          <Image
            src={logo}
            alt="Prime Edge Logo"
            width={48}
            height={48}
            className="filter brightness-0 invert"
          />
          <h1 className="text-xl font-bold text-white hidden md:block">PRIME EDGE</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const active = isActive(item.route)
            return (
              <li key={item.name}>
                <button
                  onClick={() => item.protected ? handleProtectedRoute(item.route) : router.push(item.route)}
                  className={`flex items-center w-full p-3 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-teal-100 text-teal-800 font-semibold shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`h-5 w-5 mr-3 ${
                    active ? 'text-teal-600' : 'text-gray-500'
                  }`} />
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.badge && item.badge > 0 && (
                    <span className={`ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full ${
                      active ? 'ring-2 ring-teal-300' : ''
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
      {/* Extras Section */}
      <div className="p-4 border-t border-gray-100 space-y-3">
        <button
          onClick={() => window.open('https://backoffice.primeauctions.shop/media/prime%20auctions.apk', '_blank')}
          className="flex items-center w-full p-3 text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
        >
          <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 3L21 12L3 21V3Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Download App</span>
        </button>

        <button
          onClick={() => window.open('https://whatsapp.com/channel/0029VbBS8l4I1rcbsbktrQ14', '_blank')}
          className="flex items-center w-full p-3 text-teal-800 bg-teal-100 hover:bg-teal-200 rounded-lg transition-colors"
        >
          <svg className="h-5 w-5 mr-3 text-teal-700" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9.75 14.25L9 19l2.5-2.25L17.25 21 21 3 3 10.5l6.75 1.5z" />
          </svg>
          <span>Join Community</span>
        </button>
      </div>


      {/* Auth Section */}
      <div className="p-4 border-t border-gray-200">
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 text-red-500" />
            <span>Logout</span>
          </button>
        ) : (
          <button
            onClick={() => router.push('/auth/login')}
            className="flex items-center w-full p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3 text-green-500" />
            <span>Login</span>
          </button>
        )}
      </div>
    </div>
  )
}