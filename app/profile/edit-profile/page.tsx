'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiArrowLeft, FiChevronRight, FiCalendar } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { API_URL } from '@/components/config/config';

const EditProfileScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    id_number: '',
    date_of_birth: new Date(),
    national_id_status: '',
  });

  // Fetch current profile data
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access');
      try {
        const response = await fetch(`${API_URL}/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        
        setProfile({
          full_name: data.full_name || '',
          email: data.email || '',
          phone_number: data.phone_number || '',
          id_number: data.national_id?.id_number || '',
          date_of_birth: data.national_id?.date_of_birth 
            ? new Date(data.national_id.date_of_birth) 
            : new Date(),
          national_id_status: data.national_id?.status || '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!profile.full_name.trim()) {
      toast.error('Full name is required');
      return;
    }

    // ID number validation for formats like 70-312636-C-49
    if (profile.id_number && !/^[0-9]{2,3}-[0-9]{6,7}-[A-Za-z]-[0-9]{2}$/.test(profile.id_number)) {
      toast.error('ID number should be in format XX-XXXXXX-X-XX (e.g. 70-312636-C-49)');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('access');
      const payload = {
        full_name: profile.full_name,
        phone_number: profile.phone_number,
        id_number: profile.id_number,
        date_of_birth: profile.date_of_birth.toISOString().split('T')[0],
      };

      const response = await fetch(`${API_URL}/profile/update/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Profile updated successfully');
        router.back();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
        <ToastContainer/>
      {/* Header */}
      <div className="bg-teal-900 py-4 px-4 flex justify-between items-center">
        <button onClick={() => router.back()} className="text-white">
          <FiArrowLeft size={24} />
        </button>
        <h1 className="text-white text-xl font-bold">Edit Profile</h1>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="text-white text-base font-medium hover:text-teal-200 transition-colors"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="flex-1 px-4 pt-6 pb-20 overflow-y-auto">
        {/* Form Fields */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          {/* Full Name */}
          <div className="mb-4">
            <label className="text-gray-500 text-sm mb-1 block">Full Name</label>
            <input
              type="text"
              className="border border-gray-300 rounded-lg p-3 w-full"
              placeholder="Enter your full name"
              value={profile.full_name}
              onChange={(e) => setProfile({...profile, full_name: e.target.value})}
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="text-gray-500 text-sm mb-1 block">Email Address</label>
            <input
              type="email"
              className="border border-gray-300 rounded-lg p-3 w-full bg-gray-100"
              placeholder="Enter your email"
              value={profile.email}
              readOnly
            />
            <p className="text-gray-500 text-xs mt-1">
              Contact support to change your email
            </p>
          </div>

          {/* Phone Number */}
          <div className="mb-4">
            <label className="text-gray-500 text-sm mb-1 block">Phone Number</label>
            <input
              type="tel"
              className="border border-gray-300 rounded-lg p-3 w-full"
              placeholder="Enter your phone number"
              value={profile.phone_number}
              onChange={(e) => setProfile({...profile, phone_number: e.target.value})}
            />
          </div>

          {/* ID Number */}
          <div className="mb-4">
            <label className="text-gray-500 text-sm mb-1 block">ID Number</label>
            <input
              type="text"
              className={`border ${profile.national_id_status === 'approved' ? 'bg-gray-100' : ''} border-gray-300 rounded-lg p-3 w-full`}
              placeholder="Enter your national ID number (XX-XXXXXX-X-XX)"
              value={profile.id_number}
              onChange={(e) => setProfile({...profile, id_number: e.target.value})}
              readOnly={profile.national_id_status === 'approved'}
            />
            {profile.national_id_status === 'approved' && (
              <p className="text-green-600 text-xs mt-1">
                ID Verified (contact support to make changes)
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="mb-4">
            <label className="text-gray-500 text-sm mb-1 block">Date of Birth</label>
            <DatePicker
              selected={profile.date_of_birth}
              onChange={(date) => {
                if (date) {
                  setProfile({ ...profile, date_of_birth: date });
                }
              }}

              maxDate={new Date()}
              className={`border ${profile.national_id_status === 'approved' ? 'bg-gray-100' : ''} border-gray-300 rounded-lg p-3 w-full`}
              readOnly={profile.national_id_status === 'approved'}
              dateFormat="MMMM d, yyyy"
            />
            {profile.national_id_status === 'approved' && (
              <p className="text-green-600 text-xs mt-1">
                Date of Birth Verified
              </p>
            )}
          </div>
        </div>

        {/* Change Password Option */}
        <button 
          className="bg-teal-900 rounded-lg shadow-sm p-4 mb-6 w-full hover:bg-teal-800 transition-colors"
          onClick={() => router.push('/profile/change-password')}
        >
          <div className="flex justify-between items-center">
            <span className="text-white">Change Password</span>
            <FiChevronRight className="text-white" size={20} />
          </div>
        </button>
      </div>
    </DashboardLayout>
  );
};

export default EditProfileScreen;