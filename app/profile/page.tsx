'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { API_URL } from '@/components/config/config';
import { FiCheckCircle, FiXCircle, FiHelpCircle, FiUser, FiArrowRight } from 'react-icons/fi';

type UserProfile = {
  full_name: string;
  email: string;
  phone_number: string;
  is_active: boolean;
  bidding_limit: number;
  deposit_balance: number;
  national_id?: {
    id_number: string;
    date_of_birth: string;
    status: 'pending' | 'approved' | 'rejected';
  };
};

const ProfileScreen = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    const token = localStorage.getItem('access');
    try {
      const response = await fetch(`${API_URL}/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const isVerified = profile?.national_id?.status === 'approved';
  const verifiedCount = isVerified ? 5 : 2; // Assuming 2/5 fields verified if not fully verified

  const renderVerificationIcon = (field: string) => {
    if (isVerified) {
      return <FiCheckCircle className="text-green-500 text-xl" />;
    }
    
    if (['full_name', 'id_number', 'date_of_birth'].includes(field)) {
      return (
        <button onClick={() => router.push('/profile/verify-id')}>
          <FiXCircle className="text-red-500 text-xl" />
        </button>
      );
    }
    
    return null;
  };

  const renderInfoIcon = (route: string) => {
    return (
      <button onClick={() => router.push(route)}>
        <FiHelpCircle className="text-gray-500 text-lg" />
      </button>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex-1 bg-gray-50">
        {/* User Avatar Section */}
        <div className="flex flex-col items-center mt-6 mb-4">
          <div className="bg-gray-200 w-32 h-32 rounded-full flex items-center justify-center">
            <FiUser className="text-teal-800 text-6xl" />
          </div>
          <h1 className="text-2xl font-bold mt-4">{profile?.full_name || 'User'}</h1>
          <p className="text-gray-600 text-center px-8 mt-2 mb-6 max-w-2xl">
            Click any row with a red cross to verify your details - your bidding limit may be increased when your details have been verified
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg mx-4 shadow-sm mb-6">
          {/* Full Name */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <div>
              <p className="text-gray-500 text-sm">Full Name</p>
              <p className="text-base mt-1">{profile?.full_name || 'Not provided'}</p>
            </div>
            {renderVerificationIcon('full_name')}
          </div>

          {/* Email */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <div>
              <p className="text-gray-500 text-sm">Email Address</p>
              <p className="text-base mt-1">{profile?.email || 'Not provided'}</p>
            </div>
            {profile?.email && (
              <FiCheckCircle className="text-green-500 text-xl" />
            )}
          </div>

          {/* Phone Number */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <div>
              <p className="text-gray-500 text-sm">Telephone Number</p>
              <p className="text-base mt-1">{profile?.phone_number || 'Not provided'}</p>
            </div>
            {profile?.phone_number && (
              <FiCheckCircle className="text-green-500 text-xl" />
            )}
          </div>

          {/* ID Number */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <div>
              <p className="text-gray-500 text-sm">ID Number</p>
              <p className="text-base mt-1">
                {profile?.national_id?.id_number || 'Not provided'}
              </p>
            </div>
            {renderVerificationIcon('id_number')}
          </div>

          {/* Date of Birth */}
          <div className="flex justify-between items-center p-4">
            <div>
              <p className="text-gray-500 text-sm">Date of Birth</p>
              <p className="text-base mt-1">
                {profile?.national_id?.date_of_birth || 'Not provided'}
              </p>
            </div>
            {renderVerificationIcon('date_of_birth')}
          </div>
        </div>

        {/* Account Status Card */}
        <div className="bg-white rounded-lg mx-4 shadow-sm pb-4 mb-8">
          <div className="p-4 border-b border-gray-100">
            <p className="text-gray-500 text-sm">
              Click the icon to learn more about these details
            </p>
          </div>

          {/* Verification Status */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <div>
              <div className="flex items-center">
                <p className="text-gray-500 text-sm">Verification</p>
                {!isVerified && (
                  <button 
                    className="ml-2"
                    onClick={() => router.push('/verify-id')}
                  >
                    <FiArrowRight className="text-blue-500 text-lg" />
                  </button>
                )}
              </div>
              <div className="flex items-center mt-1">
                <p className="text-base">
                  {verifiedCount}/5 fields verified
                </p>
              </div>
            </div>
            <p className={`font-medium ${isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
              {isVerified ? 'Fully Verified' : 'Partial'}
            </p>
          </div>

          {/* Registration Status */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <div>
              <div className="flex items-center">
                <p className="text-gray-500 text-sm">Registration status</p>
              </div>
              <p className="text-base mt-1">Active</p>
            </div>
            <FiCheckCircle className="text-green-500 text-lg" />
          </div>

          {/* Bidder Status */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <div>
              <div className="flex items-center">
                <p className="text-gray-500 text-sm">Bidder status</p>
              </div>
              <p className="text-base mt-1">Normal</p>
            </div>
            {renderInfoIcon('/profile/bidding-status')}
          </div>

          {/* Bidding Limit */}
          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <div>
              <div className="flex items-center">
                <p className="text-gray-500 text-sm">Bidding limit</p>
              </div>
              <p className="text-base mt-1">
                USD {profile?.bidding_limit?.toFixed(2) || '100.00'}
              </p>
            </div>
            {renderInfoIcon('/profile/bidding-limit')}
          </div>

          {/* Deposit Balance */}
          <div className="flex justify-between items-center p-4">
            <div>
              <div className="flex items-center">
                <p className="text-gray-500 text-sm">Deposit balance</p>
              </div>
              <p className="text-base mt-1">
                USD {profile?.deposit_balance?.toFixed(2) || '0.00'}
              </p>
            </div>
            {renderInfoIcon('/profile/deposit-balance')}
          </div>

          {/* Topup Button */}
          <button 
            className="bg-teal-600 mx-4 my-4 py-3 rounded-lg w-[calc(100%-2rem)] text-white font-medium hover:bg-teal-700 transition-colors"
            onClick={() => router.push('/deposits')}
          >
            Topup Account
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfileScreen;