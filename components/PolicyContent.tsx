'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import DashboardLayout from '@/components/DashboardLayout';
import { API_URL } from '@/components/config/config';

const PolicyContent = ({ endpoint, title }: { endpoint: string; title: string }) => {
  const [content, setContent] = useState<{ image: string; description: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`${API_URL}/${endpoint}/`);
        const data = await response.json();
        setContent(data);
      } catch (err) {
        console.error(`Error fetching ${title}:`, err);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [endpoint, title]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center bg-white">
          <p className="text-red-500 text-center px-5">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!content) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center bg-white">
          <p className="text-gray-500">No content available</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex-1 bg-white overflow-y-auto">
        <div className="flex flex-col">
          {content.image && (
            <div className="relative w-full h-48">
              <Image
                src={content.image}
                alt="Policy content"
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="px-4 pt-4 pb-20">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: content.description }}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PolicyContent;