'use client'

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useSession } from '@/components/hooks/useSession'; 
import CostCalculator from '@/components/Calculator';
import { API_URL } from '@/components/config/config';
import { FiChevronLeft, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import DashboardLayout from '@/components/DashboardLayout';

export default function ProductDetails() {
  const [data, setData] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [bidAmount, setBidAmount] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [taxRate, setTaxRate] = useState<number>(14.5);
  const [levyRates, setLevyRates] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOfferPeriod, setIsOfferPeriod] = useState(false);
  const [offerCountdown, setOfferCountdown] = useState({
    hours: '00',
    minutes: '00',
    seconds: '00',
  });
  const [countdown, setCountdown] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  });
  const [showBuyNowConfirmation, setShowBuyNowConfirmation] = useState(false);

  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const { isLoggedIn } = useSession();

  useEffect(() => {
    if (!id) return;
    
    fetch(`${API_URL}/auctions/${id}/`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setBidAmount((parseFloat(json?.highest_bid || json?.price) + 10).toString());
        setIsOfferPeriod(json?.in_offer_period || false);
      })
      .catch(error => {
        toast.error('Failed to load product details');
        console.error('Fetch error:', error);
      });
  }, [id]);

  useEffect(() => {
    if (!data) return;
    
    const auctionInterval = setInterval(() => {
      calculateCountdown(data.end_time);
    }, 1000);

    if (data?.offer_period_end) {
      const offerInterval = setInterval(() => {
        const distance = new Date(data.offer_period_end).getTime() - new Date().getTime();
        
        if (distance < 0) {
          setOfferCountdown({ hours: '00', minutes: '00', seconds: '00' });
          setIsOfferPeriod(false);
          clearInterval(offerInterval);
        } else {
          const hours = Math.floor(distance / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          
          setOfferCountdown({
            hours: String(hours).padStart(2, '0'),
            minutes: String(minutes).padStart(2, '0'),
            seconds: String(seconds).padStart(2, '0'),
          });
        }
      }, 1000);
      
      return () => {
        clearInterval(auctionInterval);
        clearInterval(offerInterval);
      };
    }

    return () => clearInterval(auctionInterval);
  }, [data]);

  const calculateCountdown = (endTime: string) => {
    const distance = new Date(endTime).getTime() - new Date().getTime();
    if (distance < 0) {
      setCountdown({ days: '00', hours: '00', minutes: '00', seconds: '00' });
    } else {
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setCountdown({
        days: String(days).padStart(2, '0'),
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
      });
    }
  };

  useEffect(() => {
    if (data) {
      setTaxRate(data.tax_rate || 0);
      setLevyRates(data.levy_rates || []);
    }
  }, [data]);

  const handleBidSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const entered = parseFloat(bidAmount);
      const current = parseFloat(data?.highest_bid || data?.price || '0');

      if (entered <= current) {
        toast.error('Bid must be greater than current bid');
        return;
      }

      const token = localStorage.getItem('access');
      const response = await fetch(`${API_URL}/bids/place/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          auction: data.id,
          amount: entered,
        }),
      });

      const json = await response.json();

      if (response.ok) {
        toast.success('Your bid has been placed. Your bid is binding and cannot be removed!');
        setBidAmount((entered + 10).toString());
        setData((prev: any) => ({
          ...prev,
          highest_bid: entered.toFixed(2),
          top_bids: [
            { user: 'You', amount: entered.toFixed(2) },
            ...(prev.top_bids || []),
          ],
        }));
      } else {
        if (typeof json === 'object' && json !== null) {
          const errorMessages = Object.values(json)
            .flat()
            .join('\n');
          toast.error(errorMessages || 'Failed to place bid');
        } else {
          toast.error('Failed to place bid');
        }
      }
    } catch (error) {
      toast.error('An error occurred while placing your bid');
      console.error('Bid submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOfferSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const entered = parseFloat(bidAmount);
      const token = localStorage.getItem('access');
      const response = await fetch(`${API_URL}/offers/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          auction: data.id,
          amount: entered,
        }),
      });

      const json = await response.json();

      if (response.ok) {
        toast.success('Your offer has been submitted for seller consideration');
        setBidAmount((entered + 10).toString());
      } else {
        toast.error(json.detail || 'Failed to submit offer');
      }
    } catch (error) {
      toast.error('An error occurred while submitting your offer');
      console.error('Offer submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuyNowSubmit = async () => {
    if (!data?.buy_now_price) return;
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('access');
      const response = await fetch(`${API_URL}/buy-now/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          auction: data.id,
          amount: data.buy_now_price,
        }),
      });

      const json = await response.json();

      if (response.ok) {
        toast.success('Your purchase request has been submitted successfully!');
        setShowBuyNowConfirmation(false);
      } else {
        toast.error(json.detail || 'Failed to process buy now request');
      }
    } catch (error) {
      toast.error('An error occurred while processing your request');
      console.error('Buy Now submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentLevyRate = () => {
    if (!data?.price || levyRates.length === 0) return 15;
    
    const bidAmount = parseFloat(data.price);
    const applicableRate = levyRates.find(rate => 
      bidAmount >= rate.min_value && 
      (rate.max_value === null || bidAmount <= rate.max_value)
    );
    
    return applicableRate ? applicableRate.rate : 15;
  };

  if (!data) {
    return (
      <DashboardLayout>
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ToastContainer/>
      
      {/* Main Content */}
      <div className="flex-1 pb-36">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 bg-black/50 text-white p-2 rounded-full"
        >
          <FiChevronLeft size={24} />
        </button>

        {/* Image Carousel */}
        <div className="relative h-96 overflow-hidden">
          <div className="flex h-full" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
            {data.images.map((img: any, index: number) => (
              <div key={index} className="w-full flex-shrink-0 relative">
                <Image
                  src={img.image_url}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover"
                  onClick={() => setSelectedImage(img.image_url)}
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
          
          {/* Dot Indicators */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            {data.images.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 mx-1 rounded-full ${index === activeIndex ? 'bg-teal-600' : 'bg-gray-300'}`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="px-4 py-4 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{data.title}</h1>
          </div>

          <div className="flex flex-wrap justify-between gap-2 pt-4">
            <div className="bg-gray-100 px-3 py-2 rounded-md min-w-[100px]">
              <p className="text-sm text-gray-700">Category:</p>
              <p className="text-sm font-medium text-yellow-500">{data.category}</p>
            </div>

            <div className="bg-gray-100 px-3 py-2 rounded-md min-w-[100px]">
              <p className="text-sm text-gray-700">Quantity:</p>
              <p className="text-sm font-medium text-yellow-500">{data.quantity}</p>
            </div>

            <div className="bg-gray-100 px-3 py-2 rounded-md min-w-[100px]">
              <p className="text-sm text-gray-700">Condition:</p>
              <p className="text-sm font-medium text-yellow-500">{data.condition}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-1">Description</h2>
            <div 
              className="text-sm text-gray-600 leading-5"
              dangerouslySetInnerHTML={{ __html: data.description || '<p>No description available</p>' }}
            />
          </div>

          {/* Fees and Taxes */}
          <div className="bg-gray-100 rounded-xl p-4 shadow-sm pt-8 pb-20">
            <h2 className="text-base font-semibold text-gray-800 mb-3">Fees & Taxes</h2>
            <div className="space-y-3 mb-4">
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-sm text-gray-700">Purchase Levy</p>
                  <p className="text-sm font-medium text-gray-800">
                    {getCurrentLevyRate()}%
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  {levyRates.length > 0 ? (
                    `Applies to bids between $${levyRates[0].min_value} and ${
                      levyRates[levyRates.length - 1].max_value || 'above'
                    }`
                  ) : 'Standard levy rate'}
                </p>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-sm text-gray-700">VAT on Lot</p>
                  <p className="text-sm font-medium text-gray-800">
                    {taxRate}%
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  Value Added Tax applied to final amount
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setShowCalculator(true)}
                className="bg-teal-700 py-3 rounded-lg w-1/2 hover:bg-teal-800 transition-colors"
              >
                <span className="text-white text-sm font-semibold">Calculate Total Cost</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bid Section */}
        <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white border-t border-gray-200 px-4 py-4 flex justify-center">
          <div className="space-y-4 w-full max-w-lg">
            <div className="items-center space-y-2 w-full">
              {isOfferPeriod ? (
                <>
                  <p className="text-xs text-red-600 text-center">
                    The highest bid has not met the seller's expectations.
                  </p>
                  <p className="text-xs text-red-600 text-center">
                    You can place a higher offer in the next {offerCountdown.hours}h {offerCountdown.minutes}m {offerCountdown.seconds}s.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs text-gray-500 text-center">Auction ends in:</p>
                  <div className="flex justify-center mx-2">
                    {[
                      { label: 'DAYS', value: countdown.days },
                      { label: 'HRS', value: countdown.hours },
                      { label: 'MIN', value: countdown.minutes },
                      { label: 'SEC', value: countdown.seconds },
                    ].map((item, index) => (
                      <div key={index} className="bg-gray-100 px-3 py-2 rounded-md min-w-[55px] items-center mx-1">
                        <p className="text-base font-bold text-red-600">{item.value}</p>
                        <p className="text-xs text-gray-500">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              {/* Price/Bid Row */}
              <div className="flex justify-between w-full px-4">
                <div className="items-start">
                  <p className="text-xs text-gray-500">Starting Price</p>
                  <p className="text-base font-bold text-yellow-600">$ {data.price}</p>
                </div>
                <div className="items-end">
                  <p className="text-xs text-gray-500">Current {isOfferPeriod ? 'Offer' : 'Bid'}</p>
                  <p className="text-base font-bold text-yellow-600">$ {data.highest_bid}</p>
                </div>
                {data.buy_now_price && (
                  <div className="items-end">
                    <p className="text-xs text-gray-500">Buy Now Price</p>
                    <p className="text-base font-bold text-blue-600">$ {data.buy_now_price}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              {data.buy_now_price && (
                <button
                  onClick={() => {
                    if (isLoggedIn) {
                      setShowBuyNowConfirmation(true);
                    } else {
                      router.push('/auth/login');
                    }
                  }}
                  disabled={isSubmitting}
                  className={`flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                    isSubmitting ? 'opacity-70' : ''
                  }`}
                >
                  Buy Now
                </button>
              )}
              
              <button 
                onClick={() => {
                  if (isLoggedIn) {
                    isOfferPeriod ? handleOfferSubmit() : handleBidSubmit();
                  } else {
                    router.push('/auth/login');
                  }
                }}
                disabled={isSubmitting}
                className={`flex-1 py-2 ${
                  isLoggedIn ? 'bg-teal-700 hover:bg-teal-800' : 'bg-yellow-500 hover:bg-yellow-600'
                } ${isSubmitting ? 'opacity-70' : ''} text-white rounded-lg transition-colors`}
              >
                {isSubmitting ? (
                  'Processing...'
                ) : (
                  isLoggedIn ? 
                    (isOfferPeriod ? 'Make Offer' : 'Place Bid') : 
                    `Login to ${isOfferPeriod ? 'Offer' : 'Bid'}`
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
            <Image
              src={selectedImage}
              alt="Enlarged product image"
              fill
              className="object-contain"
              priority
            />
            <button 
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
              onClick={() => setSelectedImage(null)}
              aria-label="Close image viewer"
            >
              ×
            </button>
          </div>
        )}

        {/* Buy Now Confirmation Modal */}
        {showBuyNowConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Confirm Purchase</h3>
                <button 
                  onClick={() => setShowBuyNowConfirmation(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <p className="mb-4">You are about to purchase this item for ${data.buy_now_price}.</p>
              <p className="mb-6 text-sm text-gray-600">This action is binding and cannot be reversed.</p>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowBuyNowConfirmation(false)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBuyNowSubmit}
                  disabled={isSubmitting}
                  className={`flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                    isSubmitting ? 'opacity-70' : ''
                  }`}
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Purchase'}
                </button>
              </div>
            </div>
          </div>
        )}

        <CostCalculator 
          visible={showCalculator} 
          onClose={() => setShowCalculator(false)}
          auctionId={Array.isArray(id) ? id[0] : (id ?? '')}
        />
      </div>
    </DashboardLayout>
  );
}