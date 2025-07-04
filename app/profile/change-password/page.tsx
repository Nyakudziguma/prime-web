'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Bars3Icon, XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon, EllipsisHorizontalCircleIcon } from '@heroicons/react/24/solid'
import { toast } from 'react-hot-toast'
import Header from '@/components/Header'
import Sidebar from '@/components/SideBar'
import Footer from '@/components/Footer'
import { API_URL } from '@/components/config/config'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const validatePassword = (password: string) => {
    const errors = []
    if (password.length < 8) errors.push('at least 8 characters')
    if (!/[0-9]/.test(password)) errors.push('at least 1 number')
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('at least 1 symbol')
    if (!/[A-Z]/.test(password)) errors.push('at least 1 uppercase letter')
    if (!/[a-z]/.test(password)) errors.push('at least 1 lowercase letter')
    return errors
  }

  const handleChangePassword = async () => {
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All fields are required')
      return
    }

    const passwordErrors = validatePassword(newPassword)
    if (passwordErrors.length > 0) {
      toast.error(`Password must contain:\n\n• ${passwordErrors.join('\n• ')}`)
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (currentPassword === newPassword) {
      toast.error('New password must be different from current password')
      return
    }

    setLoading(true)
    try {
      // In Next.js, you might want to use a fetch wrapper or API route
      const response = await axios.post(
        `${API_URL}/auth/change-password`,
        {
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,    
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.status === 200) {
        toast.success('Password changed successfully. Logging out...')
        setTimeout(() => {
          // You would typically clear auth cookies/tokens here
          router.push('/auth/login')
        }, 2000)
      }
    } catch (error: any) {
      console.error('Password change error:', error)
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          'Failed to change password. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const passwordErrors = validatePassword(newPassword)
  const passwordIsValid = passwordErrors.length === 0

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile unless open */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Main content */}
        <main className="p-4 md:p-6 flex-1 flex flex-col overflow-y-auto relative">
          <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-sm w-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Change Password</h1>

            {/* Current Password */}
            <div className="mb-4">
              <label className="text-gray-500 text-sm mb-1 block">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  className="border border-gray-300 text-black rounded-lg p-3 pr-10 w-full"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button
                  className="absolute right-3 top-3 text-gray-500"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="mb-4">
              <label className="text-gray-500 text-sm mb-1 block">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  className="border border-gray-300 text-black rounded-lg p-3 pr-10 w-full"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  className="absolute right-3 top-3 text-gray-500"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="mb-6">
              <label className="text-gray-500 text-sm mb-1 block">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="border border-gray-300 text-black rounded-lg p-3 pr-10 w-full"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  className="absolute right-3 top-3 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Change Password Button */}
            <button
              className={`bg-teal-600 py-3 rounded-lg w-full text-white font-medium ${
                loading ? 'opacity-70' : ''
              } ${
                loading || !passwordIsValid || newPassword !== confirmPassword
                  ? 'cursor-not-allowed'
                  : 'hover:bg-teal-700'
              }`}
              onClick={handleChangePassword}
              disabled={loading || !passwordIsValid || newPassword !== confirmPassword}
            >
              {loading ? 'Processing...' : 'Change Password'}
            </button>

            {/* Password Requirements */}
            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <h2 className="text-blue-800 font-medium mb-2">Password Requirements:</h2>
              
              <div className="flex items-start mb-1">
                {newPassword.length >= 8 ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                ) : (
                  <EllipsisHorizontalCircleIcon className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                )}
                <span className="text-blue-800">At least 8 characters</span>
              </div>
              
              <div className="flex items-start mb-1">
                {/[0-9]/.test(newPassword) ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                ) : (
                  <EllipsisHorizontalCircleIcon className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                )}
                <span className="text-blue-800">At least 1 number</span>
              </div>
              
              <div className="flex items-start mb-1">
                {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                ) : (
                  <EllipsisHorizontalCircleIcon className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                )}
                <span className="text-blue-800">At least 1 symbol</span>
              </div>
              
              <div className="flex items-start mb-1">
                {/[A-Z]/.test(newPassword) ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                ) : (
                  <EllipsisHorizontalCircleIcon className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                )}
                <span className="text-blue-800">At least 1 uppercase letter</span>
              </div>
              
              <div className="flex items-start mb-1">
                {/[a-z]/.test(newPassword) ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                ) : (
                  <EllipsisHorizontalCircleIcon className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                )}
                <span className="text-blue-800">At least 1 lowercase letter</span>
              </div>
              
              <div className="flex items-start">
                {newPassword && newPassword === confirmPassword ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                ) : (
                  <EllipsisHorizontalCircleIcon className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                )}
                <span className="text-blue-800">Passwords match</span>
              </div>
            </div>
          </div>
        </main>

        {/* Footer - Only shown on mobile */}
      </div>
    </div>
  )
}