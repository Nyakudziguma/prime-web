'use client'

import { useState } from 'react';
import axios from 'axios';
import { FiX } from 'react-icons/fi';
import { API_URL } from './config/config';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CostCalculator = ({ 
  visible, 
  onClose, 
  auctionId 
}: { 
  visible: boolean; 
  onClose: () => void; 
  auctionId: string;
}) => {
  const [bidAmount, setBidAmount] = useState('');
  const [calculation, setCalculation] = useState<{
    bid_amount: number;
    levy_amount: number;
    tax_amount: number;
    total_amount: number;
    levy_rate: number;
    tax_rate: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateCost = async () => {
    if (!bidAmount) {
      toast.error('Please enter a bid amount');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/calculate-total-cost/`, {
        params: { bid_amount: amount, auction_id: auctionId }
      });
      
      const data = {
        bid_amount: Number(response.data.bid_amount),
        levy_amount: Number(response.data.levy_amount),
        tax_amount: Number(response.data.tax_amount),
        total_amount: Number(response.data.total_amount),
        levy_rate: Number(response.data.levy_rate),
        tax_rate: Number(response.data.tax_rate),
      };
      
      setCalculation(data);
    } catch (err) {
      console.error('Calculation error:', err);
      toast.error('Failed to calculate costs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetCalculator = () => {
    setBidAmount('');
    setCalculation(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button 
            onClick={() => {
              resetCalculator();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">Cost Calculator</h2>
          <div className="w-6" /> {/* Spacer for alignment */}
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[70vh] p-4">
          <div className="mb-6">
            <label className="block text-sm text-gray-500 mb-1">Enter your bid amount</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <span className="px-3 py-3 bg-gray-100 text-gray-700">$</span>
              <input
                type="text"
                className="flex-1 px-3 py-3 text-gray-800 outline-none"
                placeholder="0.00"
                value={bidAmount}
                onChange={(e) => {
                  // Basic input validation
                  const validText = e.target.value.replace(/[^0-9.]/g, '');
                  if (validText.split('.').length <= 2) { // Only one decimal point
                    setBidAmount(validText);
                  }
                }}
              />
            </div>
          </div>

          <button
            onClick={calculateCost}
            disabled={loading}
            className={`w-full bg-teal-700 hover:bg-teal-800 py-3 rounded-lg text-white font-medium mb-6 transition-colors ${
              loading ? 'opacity-70' : ''
            }`}
          >
            {loading ? 'Calculating...' : 'Calculate Total Cost'}
          </button>

          {calculation && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Cost Breakdown</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bid Amount</span>
                  <span className="font-medium">${formatCurrency(calculation.bid_amount)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Levy Fee ({calculation.levy_rate}%)</span>
                  <span className="font-medium">${formatCurrency(calculation.levy_amount)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax ({calculation.tax_rate}%)</span>
                  <span className="font-medium">${formatCurrency(calculation.tax_amount)}</span>
                </div>
                
                <div className="border-t border-gray-200 my-2" />
                
                <div className="flex justify-between">
                  <span className="text-gray-800 font-semibold">Total Amount</span>
                  <span className="text-yellow-500 font-bold">${formatCurrency(calculation.total_amount)}</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Note: This is an estimate. Final costs may vary slightly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CostCalculator;