'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import DashboardLayout from '@/components/DashboardLayout';
import { API_URL } from '@/components/config/config';
import { FiDollarSign, FiPhone } from 'react-icons/fi';
import { FaBitcoin, FaMoneyBillWave } from 'react-icons/fa';
import { HiOutlineCash } from 'react-icons/hi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Img from '../../assets/images/btc-qr.jpeg';

const DepositScreen = () => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [totalDeposits, setTotalDeposits] = useState<number>(0);
  const router = useRouter();

  const paymentMethods = [
    { id: 'ecocash', name: 'Ecocash', icon: <FiPhone size={24} /> },
    { id: 'usdt', name: 'USDT (TRC20)', icon: <FiDollarSign size={24} /> },
    { id: 'btc', name: 'Bitcoin', icon: <FaBitcoin size={24} /> },
    { id: 'cash', name: 'Cash Payment', icon: <HiOutlineCash size={24} /> },
    { id: 'bank', name: 'Bank Transfer', icon: <FaMoneyBillWave size={24} /> },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('access');
      try {
        const res = await fetch(`${API_URL}/user-stats/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setBalance(data.balance);
        setTotalDeposits(data.total_deposits);
      } catch (err) {
        console.error('Failed to load user stats:', err);
        toast.error('Could not load balance info');
      }
    };

    fetchStats();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProofImage(event.target.result as string);
        toast.success('Image uploaded successfully');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if (!amount || isNaN(parseFloat(amount))) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!['cash', 'bank'].includes(selectedMethod) && !proofImage) {
      toast.error('Please attach proof of payment');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Submitting deposit...');

    try {
      const token = localStorage.getItem('access');

      const formData = new FormData();
      formData.append('payment_method', selectedMethod);
      formData.append('amount', amount);

      if (proofImage && proofImage.startsWith('data:')) {
        const blob = await fetch(proofImage).then(res => res.blob());
        formData.append('proof', blob, 'proof.jpg');
      }

      const response = await fetch(`${API_URL}/deposits/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast.update(toastId, {
          render: 'Deposit submitted successfully! Our team will verify it shortly.',
          type: 'success',
          isLoading: false,
          autoClose: 5000,
        });
        setAmount('');
        setProofImage(null);
        setSelectedMethod(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit deposit');
      }
    } catch (error: any) {
      console.error('Deposit error:', error);
      toast.update(toastId, {
        render: error.message || 'Failed to submit deposit. Please try again.',
        type: 'error',
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentDetails = () => {
    switch (selectedMethod) {
      case 'ecocash':
        return (
          <div className="mt-4 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Ecocash Payment Details</h3>
            <p className="text-gray-700">Send to: <span className="font-bold">0772250782</span></p>
            <p className="text-gray-700">Account Name: <span className="font-bold">Marilyn Baxter</span></p>
            <p className="mt-2 text-gray-600">Please use your username as reference</p>
          </div>
        );
      case 'usdt':
        return (
          <div className="mt-4 bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">USDT (TRC20) Details</h3>
            <p className="text-gray-700">Wallet Address:</p>
            <p className="font-bold bg-gray-100 p-2 rounded mt-1">TU726oFxjXKw9V2spUtpCpCAwUia5EdahZ</p>
            <p className="mt-2 text-gray-600">Network: TRC20 (Tron)</p>
          </div>
        );
      case 'btc':
        return (
          <div className="mt-4 bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Bitcoin Payment Details</h3>
            <p className="text-gray-700">Wallet Address:</p>
            <p className="font-bold bg-gray-100 p-2 rounded mt-1">bc1q84l53ajfy80yw7vjyvhuzrq0pyh63rfnamydlt</p>
            <div className="mt-3 flex justify-center">
              <Image 
                src={Img} 
                width={160}
                height={160}
                alt="Bitcoin QR Code"
                className="w-40 h-40"
              />
            </div>
          </div>
        );
      case 'cash':
        return (
          <div className="mt-4 bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Cash Payment Details</h3>
            <p className="text-gray-700">Call: <span className="font-bold">0782062295</span></p>
            <p className="mt-2 text-gray-700">Or visit our offices:</p>
            <p className="font-bold">28 Jason Moyo, Murambi, Mutare</p>
            <p className="mt-3 text-gray-600">No proof of payment needed for cash deposits</p>
          </div>
        );
      case 'bank':
        return (
          <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Bank Transfer Details</h3>
            <p className="text-gray-700">Account Name: <span className="font-bold">M J Baxter</span></p>
            <p className="text-gray-700">Bank: <span className="font-bold">Nedbank</span></p>
            <p className="text-gray-700">Branch: <span className="font-bold">Mutare, Branch Code 18503</span></p>
            <p className="text-gray-700">Account Number: <span className="font-bold">11992413567</span></p>
            <p className="mt-2 text-gray-600">Use your username as payment reference</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <ToastContainer />
      <div className="flex-1 bg-gray-50 p-4 pb-20">
        {/* User balance and deposits */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="text-gray-500 text-sm">Current Balance</h3>
            <p className="text-2xl font-semibold text-teal-600">${balance.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <h3 className="text-gray-500 text-sm">Total Deposits</h3>
            <p className="text-2xl font-semibold text-purple-600">${totalDeposits.toFixed(2)}</p>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Select Payment Method</h2>
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                className={`p-4 rounded-lg border ${
                  selectedMethod === method.id 
                    ? 'border-teal-500 bg-teal-50' 
                    : 'border-gray-200 bg-white'
                } hover:bg-gray-100 transition-colors`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <div className="flex items-center">
                  <span className={`mr-2 ${
                    selectedMethod === method.id ? 'text-teal-700' : 'text-gray-700'
                  }`}>
                    {method.icon}
                  </span>
                  <span className={`font-medium ${
                    selectedMethod === method.id ? 'text-teal-700' : 'text-gray-700'
                  }`}>
                    {method.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedMethod && (
          <>
            <div className="mb-4">
              <label className="text-lg font-semibold mb-2 block">Amount (USD)</label>
              <input
                type="text"
                placeholder="Enter amount"
                className="border border-gray-300 rounded-lg p-3 bg-white w-full text-lg"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {renderPaymentDetails()}

            {!['cash', 'bank'].includes(selectedMethod) && (
              <div className="mt-6">
                <label className="text-lg font-semibold mb-3 block">Proof of Payment</label>
                <label className="border border-dashed border-gray-400 rounded-lg p-6 flex flex-col items-center cursor-pointer hover:bg-gray-50 transition-colors">
                  {proofImage ? (
                    <img
                      src={proofImage}
                      alt="Proof of payment"
                      className="w-full h-40 object-contain rounded-md"
                    />
                  ) : (
                    <>
                      <FiDollarSign size={32} className="text-gray-600" />
                      <span className="text-gray-600 mt-2">Click to attach proof</span>
                      <span className="text-gray-400 text-sm">(Screenshot or photo of receipt)</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            )}

            <button
              className={`mt-8 py-3 rounded-lg w-full text-white font-bold text-lg ${
                loading ? 'bg-teal-400' : 'bg-teal-600 hover:bg-teal-700'
              } transition-colors`}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Deposit'}
            </button>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DepositScreen;
