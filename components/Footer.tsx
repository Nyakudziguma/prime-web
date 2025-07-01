'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useSession } from './hooks/useSession'
import {
  HomeIcon,
  ScaleIcon,
  InboxIcon,
  UserIcon,
  CogIcon
} from '@heroicons/react/24/outline'

export default function Footer() {
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

  const navItems = [
    { name: 'Home', icon: HomeIcon, route: '/dashboard', protected: false },
    { name: 'Bids', icon: ScaleIcon, route: '/my-bids', protected: true, badge: bidCount },
    { name: 'Messages', icon: InboxIcon, route: '/messages', protected: true, badge: unreadMessages },
    { name: 'Profile', icon: UserIcon, route: '/profile', protected: true },
    { name: 'Settings', icon: CogIcon, route: '/settings', protected: true }
  ]

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-lg md:hidden z-40 border-t-2 border-teal-600">
      <div className="flex justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => item.protected ? handleProtectedRoute(item.route) : router.push(item.route)}
            className={`flex flex-col items-center p-2 text-xs ${pathname === item.route ? 'text-teal-600' : 'text-gray-600'}`}
          >
            <div className="relative">
              <item.icon className="h-6 w-6" />
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="mt-1">{item.name}</span>
          </button>
        ))}
      </div>
    </footer>
  )
}
