// app/auth/register/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { EnvelopeIcon, LockClosedIcon, UserIcon, PhoneIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { API_URL } from '@/components/config/config'
import toast, { Toaster } from 'react-hot-toast'

export default function Register() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1 = registration, 2 = OTP verification
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    confirm_password: '',
    phone_number: '',
    role: 'bidder'
  })
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false
  })

  const validatePassword = (password: string) => {
    setPasswordChecks({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    })
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format'
    
    if (!formData.full_name) newErrors.full_name = 'Full name is required'
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else {
      if (!passwordChecks.length) newErrors.password = 'Password must be at least 8 characters'
      if (!passwordChecks.uppercase) newErrors.password = 'Password must contain uppercase letter'
      if (!passwordChecks.lowercase) newErrors.password = 'Password must contain lowercase letter'
      if (!passwordChecks.number) newErrors.password = 'Password must contain number'
      if (!passwordChecks.specialChar) newErrors.password = 'Password must contain special character'
    }
    
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async () => {
    if (!validateStep1()) return
    
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/auth/register/`, formData)

      if (response.data.success) {
        setStep(2)
        toast.success('A verification code has been sent to your email.')
      } else {
        toast.error(response.data.message || 'Registration failed.')
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error.response?.data?.message || 'Failed to register.')
    }finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      alert('Please enter a 6-digit verification code')
      return
    }
    
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/auth/verify-email/`, {
        email: formData.email,
        code: otp
      })

      if (response.data.success) {
        toast.success('Account activated. You can now login.')
        router.push('/auth/login')
      } else {
        toast.error(response.data.message || 'Invalid verification code.')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed.')
    }finally {
      setLoading(false)
    }
  }

  const resendVerificationCode = async () => {
    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/auth/resend-verification/`, {
        email: formData.email
      })

      if (response.data.success) {
        toast.success('Verification code resent.')
      } else {
        toast.error(response.data.message || 'Resend failed.')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Resend failed.')
    }finally {
      setLoading(false)
    }
  }

  const PasswordRequirement = ({ met, text }: { met: boolean, text: string }) => (
    <div className="flex items-center mb-1">
      {met ? (
        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
      ) : (
        <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
      )}
      <span className={`text-sm ${met ? 'text-green-500' : 'text-red-500'}`}>
        {text}
      </span>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {step === 1 ? 'Create Account' : 'Verify Your Email'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 1 ? 'Join our auction platform' : `We've sent a code to ${formData.email}`}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === 1 ? (
            <form className="space-y-6" onSubmit={(e) => {
              e.preventDefault()
              handleRegister()
            }}>
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`block w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-teal-500 focus:border-teal-500'} rounded-md shadow-sm focus:outline-none sm:text-sm`}
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    autoComplete="name"
                    required
                    className={`block w-full pl-10 pr-3 py-2 border ${errors.full_name ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-teal-500 focus:border-teal-500'} rounded-md shadow-sm focus:outline-none sm:text-sm`}
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  />
                </div>
                {errors.full_name && <p className="mt-2 text-sm text-red-600">{errors.full_name}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className={`block w-full pl-10 pr-3 py-2 border ${errors.password ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-teal-500 focus:border-teal-500'} rounded-md shadow-sm focus:outline-none sm:text-sm`}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({...formData, password: e.target.value})
                      validatePassword(e.target.value)
                    }}
                  />
                </div>
                <div className="mt-2 space-y-1">
                  <PasswordRequirement met={passwordChecks.length} text="At least 8 characters" />
                  <PasswordRequirement met={passwordChecks.uppercase} text="At least one uppercase letter" />
                  <PasswordRequirement met={passwordChecks.lowercase} text="At least one lowercase letter" />
                  <PasswordRequirement met={passwordChecks.number} text="At least one number" />
                  <PasswordRequirement met={passwordChecks.specialChar} text="At least one special character" />
                </div>
                {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className={`block w-full pl-10 pr-3 py-2 border ${errors.confirm_password ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-teal-500 focus:border-teal-500'} rounded-md shadow-sm focus:outline-none sm:text-sm`}
                    placeholder="••••••••"
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                  />
                </div>
                {errors.confirm_password && <p className="mt-2 text-sm text-red-600">{errors.confirm_password}</p>}
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    autoComplete="tel"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    placeholder="+263 77 123 4567"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  />
                </div>
              </div>

              {/* Register Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : 'Register'}
                </button>
              </div>

              {/* Login Link */}
              <div className="text-center text-sm">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <a href="/auth/login" className="font-medium text-teal-600 hover:text-teal-500">
                    Login
                  </a>
                </p>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* OTP Verification */}
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-teal-100">
                  <EnvelopeIcon className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Email Verification</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Please enter the 6-digit code sent to {formData.email}
                </p>
              </div>

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <div className="mt-1">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-center text-lg tracking-widest"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Verifying...' : 'Verify Account'}
                </button>
              </div>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={resendVerificationCode}
                  disabled={loading}
                  className="font-medium text-teal-600 hover:text-teal-500"
                >
                  Didn't receive code? Resend
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}