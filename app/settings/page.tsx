'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FiInfo, FiLock, FiUser, FiMail, FiPhone, FiMapPin, 
  FiGlobe, FiDollarSign, FiSmartphone, FiLogOut, FiChevronRight 
} from 'react-icons/fi';
import { FaWhatsapp, FaMoneyBillAlt } from 'react-icons/fa';
import { HiOutlineDocumentText } from 'react-icons/hi';

const SettingsScreen = () => {
  const router = useRouter();
  const [locationVisible, setLocationVisible] = useState(false);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('isLoggedIn');
      toast.success('Logged out successfully');
      router.push('/auth/login');
    } catch (error) {
      toast.error('Failed to logout. Please try again.');
    }
  };

  const callSupport = () => {
    window.location.href = 'tel:+263782062295';
    toast.info('Opening phone dialer...');
  };

  const callDeveloper = () => {
    window.location.href = 'tel:+263771542944';
    toast.info('Opening phone dialer...');
  };

  const emailSupport = () => {
    window.location.href = 'mailto:support@primeauctions.com';
    toast.info('Opening email client...');
  };

  const whatsappSupport = () => {
    const phoneNumber = '+263782062295';
    const message = 'Hello, I need assistance with Prime Auctions.';
    const url = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    toast.info('Opening WhatsApp...');
  };

  return (
    <DashboardLayout>
      <div className="flex-1 bg-gray-50 px-4 pb-20">
        {/* Main Settings Card */}
        <div className="bg-white rounded-lg shadow-sm mt-6 mb-6">
          <button 
            className="flex justify-between items-center p-4 border-b border-gray-100 w-full text-left hover:bg-gray-50"
            onClick={() => router.push('/about')}
          >
            <span className="text-gray-700">About Us</span>
            <FiChevronRight className="text-gray-400 text-xl" />
          </button>

          <button 
            className="flex justify-between items-center p-4 border-b border-gray-100 w-full text-left hover:bg-gray-50"
            onClick={() => router.push('/terms-of-service')}
          >
            <span className="text-gray-700">Terms of Service</span>
            <FiChevronRight className="text-gray-400 text-xl" />
          </button>

          <button 
            className="flex justify-between items-center p-4 border-b border-gray-100 w-full text-left hover:bg-gray-50"
            onClick={() => router.push('/privacy-policy')}
          >
            <span className="text-gray-700">Privacy Policy</span>
            <FiChevronRight className="text-gray-400 text-xl" />
          </button>

          <button 
            className="flex justify-between items-center p-4 border-b border-gray-100 w-full text-left hover:bg-gray-50"
            onClick={() => router.push('/profile/edit-profile')}
          >
            <span className="text-gray-700">Edit Profile</span>
            <FiChevronRight className="text-gray-400 text-xl" />
          </button>
        </div>

        {/* Contact Methods */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-gray-700 font-medium">Contact Support</h3>
          </div>

          <button 
            className="flex justify-between items-center p-4 border-b border-gray-100 w-full text-left hover:bg-gray-50"
            onClick={callSupport}
          >
            <span className="text-gray-700">Call Support</span>
            <FiPhone className="text-gray-600 text-xl" />
          </button>

          <button 
            className="flex justify-between items-center p-4 border-b border-gray-100 w-full text-left hover:bg-gray-50"
            onClick={emailSupport}
          >
            <span className="text-gray-700">Email Support</span>
            <FiMail className="text-gray-600 text-xl" />
          </button>

          <button 
            className="flex justify-between items-center p-4 border-b border-gray-100 w-full text-left hover:bg-gray-50"
            onClick={whatsappSupport}
          >
            <span className="text-gray-700">Chat on WhatsApp</span>
            <FaWhatsapp className="text-green-500 text-xl" />
          </button>

          <button 
            className="flex justify-between items-center p-4 w-full text-left hover:bg-gray-50"
            onClick={() => setLocationVisible(true)}
          >
            <span className="text-gray-700">Our Location</span>
            <FiMapPin className="text-gray-600 text-xl" />
          </button>
        </div>

        {/* Support Information Card */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-gray-700 font-medium">Support Information</h3>
          </div>

          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <span className="text-gray-700">Region</span>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">Zimbabwe</span>
              <FiGlobe className="text-gray-600 text-xl" />
            </div>
          </div>

          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <span className="text-gray-700">Currency</span>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">USD</span>
              <FaMoneyBillAlt className="text-gray-600 text-xl" />
            </div>
          </div>

          <div className="flex justify-between items-center p-4 border-b border-gray-100">
            <span className="text-gray-700">App Version</span>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">1.0.0</span>
              <FiSmartphone className="text-gray-600 text-xl" />
            </div>
          </div>

          <button 
            className="flex justify-between items-center p-4 w-full text-left hover:bg-gray-50"
            onClick={handleLogout}
          >
            <span className="text-red-500">Logout</span>
            <FiLogOut className="text-red-500 text-xl" />
          </button>
        </div>

        {/* Developer Footer */}
        <div className="text-center mt-4 mb-8">
          <p className="text-gray-500 text-sm">App Developed By</p>
          <p className="text-gray-700 font-medium mt-1">Credspace Pvt Ltd</p>
          <button 
            className="text-teal-600 mt-2 flex items-center justify-center mx-auto"
            onClick={callDeveloper}
          >
            <span>+263 77 154 2944</span>
            <FiPhone className="ml-2 text-teal-600" />
          </button>
        </div>
      </div>

      {/* Location Modal */}
      {locationVisible && (
        <div className="fixed inset-0 bg-white z-50">
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700">Our Office Location</h2>
            <button 
              onClick={() => setLocationVisible(false)}
              className="text-gray-600"
            >
              <FiPhone className="text-xl" />
            </button>
          </div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3799.215675635674!2d32.65031531544178!3d-18.970402987593933!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1931a5e1f8a3a5a5%3A0x9e8a5e1f8a3a5a5!2s28%20Jason%20Moyo%20Dr%2C%20Mutare!5e0!3m2!1sen!2szw!4v1620000000000!5m2!1sen!2szw"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SettingsScreen;