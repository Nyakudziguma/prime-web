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
  ShoppingCartIcon
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
    { name: 'Auctions', icon: ShoppingCartIcon, route: '/browse-auctions', protected: false },
    { name: 'My Bids', icon: ScaleIcon, route: '/my-bids', protected: true, badge: bidCount },
    { name: 'Messages', icon: InboxIcon, route: '/messages', protected: true, badge: unreadMessages },
    { name: 'Profile', icon: UserIcon, route: '/profile', protected: true },
    { name: 'Settings', icon: CogIcon, route: '/settings', protected: true }
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
            alt="Prime Auctions Logo"
            width={48}
            height={48}
            className="filter brightness-0 invert"
          />
          <h1 className="text-xl font-bold text-white hidden md:block">PRIME AUCTIONS</h1>
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