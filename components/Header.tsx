'use client'

import { useRouter } from 'next/navigation'
import { FiSearch, FiBell, FiMenu } from 'react-icons/fi'
import { useSession } from './hooks/useSession'
import { ArrowRightOnRectangleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import logo from '@/assets/images/logo_white.png'

const Header = ({ toggleSidebar }: { toggleSidebar?: () => void }) => {
  const router = useRouter()
  const { isLoggedIn, unreadMessages } = useSession()

  const handleLogout = async () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('isLoggedIn')
    router.push('/auth/login')
  }

  const handleLogin = () => {
    router.push('/auth/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-teal-900 shadow-sm border-b border-gray-200 w-full">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left section - Mobile menu button and logo */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-md text-white hover:text-gray-900 hover:bg-white focus:outline-none"
          >
            <FiMenu className="h-6 w-6" />
          </button>
          
          {/* Mobile Logo - Hidden on desktop */}
          <div className="md:hidden flex items-center">
            <Image
              src={logo}
              alt="Prime Auctions Logo"
              width={32}
              height={32}
              className="filter brightness-0 invert"
              onClick={() => router.push('/dashboard')}
            />
            <h3 className="text-xl font-bold text-white  md:block">PRIME AUCTIONS</h3>
          </div>
        </div>

        {/* Right section - Icons and auth */}
        <div className="flex items-center space-x-4">
          {/* Auth buttons */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg text-white hover:bg-teal-600 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-400" />
              <span className="hidden lg:inline">Logout</span>
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-teal-600 transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5 text-green-500" />
              <span className="hidden lg:inline text-white">Login</span>
            </button>
          )}

          {/* Mobile auth icon (hidden on desktop) */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="sm:hidden p-2 rounded-md text-white hover:text-gray-900 hover:bg-white"
            >
              <ArrowRightOnRectangleIcon className="h-6 w-6 text-red-500" />
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="sm:hidden p-2 rounded-md text-white hover:text-gray-900 hover:bg-teal-600"
            >
              <ArrowLeftOnRectangleIcon className="h-6 w-6 text-green-500" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header