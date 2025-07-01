'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { API_URL } from '@/components/config/config';
import { FiArrowLeft, FiCamera } from 'react-icons/fi';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';

const VerifyIdScreen = () => {
  const router = useRouter();
  const [idNumber, setIdNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setIdPhoto(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!idNumber || !idPhoto) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedDate = dateOfBirth.toISOString().split('T')[0];
      const formData = new FormData();

      formData.append('id_number', idNumber);
      formData.append('date_of_birth', formattedDate);

      // Convert data URL to blob if needed
      if (idPhoto.startsWith('data:')) {
        const blob = await fetch(idPhoto).then(res => res.blob());
        formData.append('id_photo', blob, 'id_photo.jpg');
      }

      const token = localStorage.getItem('access');

      const response = await fetch(`${API_URL}/verify-id/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        router.push('/profile');
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      console.error('Verification submission failed:', error);
      alert('Failed to submit verification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 bg-gray-50">
        {/* Header */}
        <div className="bg-teal-900 py-4 px-4 flex justify-between items-center">
          <button onClick={() => router.back()} className="text-white">
            <FiArrowLeft size={24} />
          </button>
          <h1 className="text-white text-xl font-bold">Verify Your ID</h1>
          <div className="w-6" /> {/* Spacer for alignment */}
        </div>

        <div className="px-4 pt-4 pb-20">
          <p className="text-black mb-8 mt-8 text-center">
            Please upload a photo of your national ID so that we can verify your name, ID number and date of birth.
            This process may take up to 2 business days.
          </p>

          {/* Card */}
          <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-200">
            {/* ID Number */}
            <div className="mb-4">
              <label className="text-gray-700 mb-2 block">National ID Number</label>
              <input
                className="bg-white border border-gray-300 rounded-lg p-3 w-full"
                placeholder="Enter your national ID number"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
              />
            </div>

            {/* DOB */}
            <div className="mb-4">
              <label className="text-gray-700 mb-2 block">Date of Birth</label>
              <DatePicker
              selected={dateOfBirth}
              onChange={(date: Date | null) => {
                if (date) setDateOfBirth(date);
              }}
              maxDate={new Date()}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              className="bg-white border border-gray-300 rounded-lg p-3 w-full"
              dateFormat="MMMM d, yyyy"
              placeholderText="Select your date of birth"
              />
            </div>

            {/* ID Photo */}
            <div className="mb-6">
              <label className="text-gray-700 mb-2 block">National ID Photo</label>
              <label className="bg-white border border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer">
                {idPhoto ? (
                  <img
                    src={idPhoto}
                    alt="ID preview"
                    className="w-full max-h-48 rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <FiCamera size={40} className="text-gray-500" />
                    <span className="text-gray-500 mt-2">Click to select a photo</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleSelectPhoto}
                />
              </label>
            </div>

            {/* Submit Button */}
            <button
              className={`bg-teal-600 py-3 rounded-lg w-full text-white font-medium hover:bg-teal-700 transition-colors ${
                (!idNumber || !idPhoto) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleSubmit}
              disabled={!idNumber || !idPhoto || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VerifyIdScreen;