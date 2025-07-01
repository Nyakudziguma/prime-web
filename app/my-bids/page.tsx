'use client'

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBill, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { IoIosImages } from 'react-icons/io';
import { MdAttachMoney, MdCancel, MdCheckCircle, MdHourglassEmpty, MdAccountBalanceWallet, MdAddCircleOutline } from 'react-icons/md';
import { io, Socket } from 'socket.io-client';
import CountdownTimer from '@/components/CountdownTimer';
import DashboardLayout from '@/components/DashboardLayout';
import { API_URL } from '@/components/config/config';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type BidItem = {
  auction_id: number;
  title: string;
  image_url: string | null;
  location: string;
  my_bid_amount: number;
  highest_bid_amount: number | null;
  is_auction_active: boolean;
  end_time: string;
  status: string;
  is_winner: boolean;
  is_settled: boolean;
  settlement_id: number | null;
  settlement_status?: string;
  condition: string;
  category: string;
};

type OfferItem = {
  id: number;
  auction_id: number;
  title: string;
  image_url: string | null;
  location: string;
  amount: number;
  status: string;
  created_at: string;
  auction_status: string;
  is_auction_active: boolean;
  end_time: string;
  condition: string;
  category: string;
  is_settled: boolean;
};

type UserStats = {
  balance: number;
  total_deposits: number;
  bids_won: number;
  bids_lost: number;
  unsettled: number;
  settled: number;
  offers_pending: number;
  offers_accepted: number;
  offers_rejected: number;
};

export default function BidsPage() {
  const router = useRouter();
  const [bids, setBids] = useState<BidItem[]>([]);
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'bids' | 'offers'>('bids');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Initialize WebSocket connection
  const initSocket = useCallback(async () => {
    const token = localStorage.getItem('access');
    if (!token) return;

    const socketInstance = io(API_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket');
      setSocket(socketInstance);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });

    socketInstance.on('balance_update', (data: { newBalance: number }) => {
      setStats(prev => prev ? { ...prev, balance: data.newBalance } : null);
      toast.success(`Balance updated: $${data.newBalance.toFixed(2)}`);
    });

    socketInstance.on('bid_update', (updatedBid: BidItem) => {
      setBids(prev => prev.map(bid => 
        bid.auction_id === updatedBid.auction_id ? updatedBid : bid
      ));
    });

    socketInstance.on('offer_update', (updatedOffer: OfferItem) => {
      setOffers(prev => prev.map(offer => 
        offer.id === updatedOffer.id ? updatedOffer : offer
      ));
    });

    socketInstance.on('settlement_update', (data: { 
      auction_id: number, 
      is_settled: boolean 
    }) => {
      setBids(prev => prev.map(bid => 
        bid.auction_id === data.auction_id ? { ...bid, is_settled: data.is_settled } : bid
      ));
    });

    return socketInstance;
  }, []);

  // Fetch data from API
  const fetchData = async () => {
    const token = localStorage.getItem('access');
    try {
      const [statsResponse, bidsResponse, offersResponse] = await Promise.all([
        fetch(`${API_URL}/user-stats/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/my-bids/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/my-offers/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      setStats(await statsResponse.json());
      setBids(await bidsResponse.json());
      setOffers(await offersResponse.json());
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle bid settlement
  const handleSettleBid = async (auctionId: number) => {
    try {
      const token = localStorage.getItem('access');
      const response = await fetch(
        `${API_URL}/auctions/${auctionId}/settle/`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        toast.success('Bid settled successfully!');
        fetchData();
      } else if (response.status === 402) {
        if (confirm('You need to deposit more funds to settle this bid. Would you like to deposit now?')) {
          router.push('/deposits');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to settle bid');
    }
  };

  // Setup network and socket listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    let socketInstance: Socket;

    if (isOnline) {
        initSocket().then(sock => {
            if (sock) {
            socketInstance = sock;
            }
        });
        }


    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [isOnline, initSocket]);

  // Polling fallback when offline
  useEffect(() => {
    if (!isOnline || !socket) {
      const pollInterval = setInterval(fetchData, 30000); // 30 seconds
      return () => clearInterval(pollInterval);
    }
  }, [isOnline, socket]);

  // Initial data load
  useEffect(() => {
    fetchData();
  }, []);

  // Pull-to-refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Render methods
  const renderStatsCard = (
    title: string,
    value: string | number,
    color: string,
    icon: React.ReactNode,
    action?: React.ReactNode
  ) => (
    <div className={`bg-white p-4 rounded-lg shadow-sm mb-3 border ${color} w-[48%]`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon}
          <span className="text-gray-500 text-sm ml-2">{title}</span>
        </div>
        {action}
      </div>
      <div className="text-xl font-bold mt-1">
        {typeof value === 'number' && title.includes('$')
          ? `$${value.toFixed(2)}`
          : value}
      </div>
    </div>
  );

  const renderBidStatus = (bid: BidItem) => {
    if (bid.is_auction_active) {
      return (
        <div className="flex items-center">
          <span className="text-green-600 font-semibold mr-2">Active</span>
          <CountdownTimer endTime={bid.end_time} />
        </div>
      );
    } else if (bid.is_winner) {
      return (
        <div className="flex items-center">
          <span className="text-green-700 font-bold">Winner</span>
          {bid.is_settled ? (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full ml-2">
              Settled
            </span>
          ) : (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-2">
              Pending
            </span>
          )}
        </div>
      );
    } else {
      return <span className="text-red-600 font-semibold">Lost</span>;
    }
  };

  const renderOfferStatus = (offer: OfferItem) => {
    let statusColor = 'text-gray-600';
    let statusText = offer.status.charAt(0).toUpperCase() + offer.status.slice(1);
    
    if (offer.status === 'accepted') {
      statusColor = 'text-green-600';
    } else if (offer.status === 'rejected') {
      statusColor = 'text-red-600';
    }

    return (
      <div className="flex items-center">
        <span className={`${statusColor} font-semibold mr-2`}>{statusText}</span>
        {offer.auction_status === 'completed' && !offer.is_auction_active && (
          <CountdownTimer endTime={offer.end_time}  />
        )}
      </div>
    );
  };

  const renderBidItem = (item: BidItem) => (
    <div className="bg-white rounded-xl mb-3 shadow-sm shadow-black/10">
      <button
        className="flex p-3 w-full text-left"
        onClick={() => router.push(`/auction/${item.auction_id}`)}
      >
        {item.image_url ? (
          <Image
            src={item.image_url}
            width={96}
            height={96}
            className="w-24 h-24 rounded-md mr-3 object-cover"
            alt={item.title}
          />
        ) : (
          <div className="w-24 h-24 rounded-md mr-3 bg-gray-200 flex items-center justify-center">
            <IoIosImages size={32} className="text-gray-400" />
          </div>
        )}

        <div className="flex-1">
          <div className="text-base font-bold mb-1 line-clamp-2">
            {item.title}
          </div>
          <div className="text-sm text-gray-600 mb-2">{item.location}</div>
          <div className="text-xs text-gray-500 mb-2">
            {item.category} • {item.condition}
          </div>

          <div className="mt-1">
            <div className="text-sm font-semibold text-gray-800">
              My Bid: ${item.my_bid_amount.toFixed(2)}
            </div>
            {item.highest_bid_amount && item.highest_bid_amount > item.my_bid_amount && (
              <div className="text-red-600 text-sm mt-1">
                Highest bid: ${item.highest_bid_amount.toFixed(2)}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            {renderBidStatus(item)}
            {item.is_winner && !item.is_settled && (
              <button
                className="bg-teal-600 py-1.5 px-3 rounded-md flex items-center"
                onClick={() => handleSettleBid(item.auction_id)}
              >
                <MdAttachMoney className="text-white" size={16} />
                <span className="text-white text-sm ml-1">Settle Now</span>
              </button>
            )}
          </div>
        </div>
      </button>
    </div>
  );

  const renderOfferItem = (item: OfferItem) => (
    <div className="bg-white rounded-xl mb-3 shadow-sm shadow-black/10">
      <button
        className="flex p-3 w-full text-left"
        onClick={() => router.push(`/auction/${item.auction_id}`)}
      >
        {item.image_url ? (
          <Image
            src={item.image_url}
            width={96}
            height={96}
            className="w-24 h-24 rounded-md mr-3 object-cover"
            alt={item.title}
          />
        ) : (
          <div className="w-24 h-24 rounded-md mr-3 bg-gray-200 flex items-center justify-center">
            <IoIosImages size={32} className="text-gray-400" />
          </div>
        )}

        <div className="flex-1">
          <div className="text-base font-bold mb-1 line-clamp-2">
            {item.title}
          </div>
          <div className="text-sm text-gray-600 mb-2">{item.location}</div>
          <div className="text-xs text-gray-500 mb-2">
            {item.category} • {item.condition}
          </div>

          <div className="mt-1">
            <div className="text-sm font-semibold text-gray-800">
              My Offer: ${item.amount.toFixed(2)}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2">
            {renderOfferStatus(item)}
            {item.status === 'accepted' && !item.is_settled && (
              <button
                className="bg-teal-600 py-1.5 px-3 rounded-md flex items-center"
                onClick={() => handleSettleBid(item.auction_id)}
              >
                <MdAttachMoney className="text-white" size={16} />
                <span className="text-white text-sm ml-1">Settle Now</span>
              </button>
            )}
          </div>
        </div>
      </button>
    </div>
  );

  if (loading && !refreshing) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex justify-center items-center bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Stats Overview - 2x2 Grid */}
      {stats && (
        <div className="flex flex-wrap justify-between px-4 py-3">
          {renderStatsCard(
            'Balance ($)', 
            stats.balance, 
            'border-teal-500',
            <FontAwesomeIcon icon={faMoneyBill} className="text-teal-500" />
          )}
          {renderStatsCard(
            'Deposits ($)', 
            stats.total_deposits, 
            'border-blue-500',
            <MdAccountBalanceWallet className="text-blue-500" size={16} />,
            <button onClick={() => router.push('/deposits')}>
              <MdAddCircleOutline className="text-blue-500" size={20} />
            </button>
          )}

          {renderStatsCard(
            'Won', 
            stats.bids_won, 
            'border-green-500',
            <FontAwesomeIcon icon={faTrophy} className="text-green-500" />
          )}
          {renderStatsCard(
            'Lost', 
            stats.bids_lost, 
            'border-red-500',
            <MdCancel className="text-red-500" size={16} />
          )}
          {renderStatsCard(
            'Pending Offers', 
            stats.offers_pending, 
            'border-yellow-500',
            <MdHourglassEmpty className="text-yellow-500" size={16} />
          )}
          {renderStatsCard(
            'Accepted Offers', 
            stats.offers_accepted, 
            'border-green-500',
            <MdCheckCircle className="text-green-500" size={16} />
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mx-4">
        <button
          className={`flex-1 py-3 text-center ${activeTab === 'bids' ? 'border-b-2 border-teal-500' : ''}`}
          onClick={() => setActiveTab('bids')}
        >
          <span className={`font-medium ${activeTab === 'bids' ? 'text-teal-600' : 'text-gray-500'}`}>
            My Bids
          </span>
        </button>
        <button
          className={`flex-1 py-3 text-center ${activeTab === 'offers' ? 'border-b-2 border-teal-500' : ''}`}
          onClick={() => setActiveTab('offers')}
        >
          <span className={`font-medium ${activeTab === 'offers' ? 'text-teal-600' : 'text-gray-500'}`}>
            My Offers
          </span>
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'bids' ? (
        <div className="p-3 pb-20">
          {bids.length > 0 ? (
            bids.map(bid => renderBidItem(bid))
          ) : (
            <div className="flex flex-col justify-center items-center p-5">
              <span className="text-gray-500">You haven't placed any bids yet.</span>
              <button
                className="mt-4 bg-teal-600 py-2 px-6 rounded-full flex items-center"
                onClick={() => router.push('/browse-auctions')}
              >
                <span className="text-white font-medium ml-2">Browse Auctions</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3 pb-20">
          {offers.length > 0 ? (
            offers.map(offer => renderOfferItem(offer))
          ) : (
            <div className="flex flex-col justify-center items-center p-5">
              <span className="text-gray-500">You haven't made any offers yet.</span>
              <button
                className="mt-4 bg-teal-600 py-2 px-6 rounded-full flex items-center"
                onClick={() => router.push('/browse-auctions')}
              >
                <span className="text-white font-medium ml-2">Browse Auctions</span>
              </button>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}