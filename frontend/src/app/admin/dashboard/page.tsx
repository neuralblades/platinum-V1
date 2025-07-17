'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProperties } from '@/services/propertyService';
import { getAllInquiries } from '@/services/inquiryService';
import { getAllUsers } from '@/services/userService';
import { getAllOffplanInquiries } from '@/services/offplanInquiryService';
import { clearServerCache } from '@/utils/cacheUtils';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';

// Dashboard Stat Card Component
const StatCard = ({ title, value, icon, bgColor }: { title: string; value: number; icon: React.ReactNode; bgColor: string }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex items-center hover:shadow-md transition-shadow duration-300">
    <div className={`rounded-full p-3 mr-4 ${bgColor}`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">{value}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    properties: 0,
    users: 0,
    inquiries: 0,
    offplanInquiries: 0,
    featuredProperties: 0,
  });
  const [recentProperties, setRecentProperties] = useState<any[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
  const [recentOffplanInquiries, setRecentOffplanInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearingCache, setClearingCache] = useState(false);
  const [cacheMessage, setCacheMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleClearCache = async () => {
    try {
      setClearingCache(true);
      setCacheMessage(null);

      // Clear all cache
      const success = await clearServerCache();

      if (success) {
        setCacheMessage({
          text: 'Cache cleared successfully! The website will now show the latest data.',
          type: 'success'
        });
      } else {
        setCacheMessage({
          text: 'Failed to clear cache. Please try again.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      setCacheMessage({
        text: 'An error occurred while clearing the cache.',
        type: 'error'
      });
    } finally {
      setClearingCache(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch properties
        const propertiesResponse = await getProperties();
        if (propertiesResponse.success) {
          setStats(prev => ({
            ...prev,
            properties: propertiesResponse.total || propertiesResponse.properties.length,
            featuredProperties: propertiesResponse.properties.filter((p: any) => p.featured).length,
          }));

          // Get 5 most recent properties
          const sortedProperties = [...propertiesResponse.properties].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setRecentProperties(sortedProperties.slice(0, 5));
        }

        // Fetch inquiries
        const inquiriesResponse = await getAllInquiries();
        if (inquiriesResponse.success) {
          setStats(prev => ({
            ...prev,
            inquiries: inquiriesResponse.inquiries.length,
          }));

          // Get 5 most recent inquiries
          const sortedInquiries = [...inquiriesResponse.inquiries].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setRecentInquiries(sortedInquiries.slice(0, 5));
        }

        // Fetch users
        const usersResponse = await getAllUsers();
        if (usersResponse.success) {
          setStats(prev => ({
            ...prev,
            users: usersResponse.users.length,
          }));
        }

        // Fetch offplan inquiries
        const offplanInquiriesResponse = await getAllOffplanInquiries();
        if (offplanInquiriesResponse.success) {
          setStats(prev => ({
            ...prev,
            offplanInquiries: offplanInquiriesResponse.inquiries.length,
          }));

          // Get 5 most recent offplan inquiries
          const sortedOffplanInquiries = [...offplanInquiriesResponse.inquiries].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setRecentOffplanInquiries(sortedOffplanInquiries.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-700 shadow-md"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cache Management Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
        <h2 className="text-lg font-bold text-gray-800 flex items-center mb-4">
          <span className="w-1 h-6 bg-gray-700 rounded-full mr-2"></span>
          Cache Management
        </h2>
        <p className="mb-4 text-gray-600">
          If you've made changes to the website content and they're not appearing immediately, you can clear the server cache to force an update.
        </p>

        {cacheMessage && (
          <div className={`mb-4 p-4 rounded-md ${cacheMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {cacheMessage.text}
          </div>
        )}

        <Button
          onClick={handleClearCache}
          disabled={clearingCache}
          variant="primary"
          className="flex items-center"
        >
          {clearingCache ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Clearing Cache...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Clear Server Cache
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Properties"
          value={stats.properties}
          icon={
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          bgColor="bg-gradient-to-br from-gray-100 to-gray-200"
        />
        <StatCard
          title="Featured Properties"
          value={stats.featuredProperties}
          icon={
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
          bgColor="bg-gradient-to-br from-yellow-100 to-yellow-200"
        />
        <StatCard
          title="Total Users"
          value={stats.users}
          icon={
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          bgColor="bg-gradient-to-br from-green-100 to-green-200"
        />
        <StatCard
          title="Property Inquiries"
          value={stats.inquiries}
          icon={
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          }
          bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
        />
        <StatCard
          title="Offplan Inquiries"
          value={stats.offplanInquiries}
          icon={
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          bgColor="bg-gradient-to-br from-indigo-100 to-indigo-200"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Properties */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <span className="w-1 h-6 bg-gray-700 rounded-full mr-2"></span>
              Recent Properties
            </h2>
            <Link
              href="/admin/properties"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center transition-colors"
            >
              View All
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="p-4">
            {recentProperties.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentProperties.map((property) => (
                  <div key={property.id} className="py-3 flex justify-between items-center hover:bg-gray-50 px-2 rounded-md transition-colors">
                    <div>
                      <h3 className="font-medium text-gray-800">{property.title}</h3>
                      <p className="text-sm text-gray-500">{property.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-700">AED {property.price.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(property.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No properties found</p>
            )}
          </div>
        </div>

        {/* Recent Inquiries */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <span className="w-1 h-6 bg-gray-700 rounded-full mr-2"></span>
              Recent Inquiries
            </h2>
            <Link
              href="/admin/inquiries"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center transition-colors"
            >
              View All
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="p-4">
            {recentInquiries.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentInquiries.map((inquiry) => (
                  <div key={inquiry.id} className="py-3 hover:bg-gray-50 px-2 rounded-md transition-colors">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-gray-800">{inquiry.name}</h3>
                      <StatusBadge status={inquiry.status || 'new'} />
                    </div>
                    <p className="text-sm text-gray-500">{inquiry.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No inquiries found</p>
            )}
          </div>
        </div>

        {/* Recent Offplan Inquiries */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <span className="w-1 h-6 bg-gray-700 rounded-full mr-2"></span>
              Recent Offplan Inquiries
            </h2>
            <Link
              href="/admin/offplan-inquiries"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center transition-colors"
            >
              View All
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="p-4">
            {recentOffplanInquiries.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {recentOffplanInquiries.map((inquiry) => (
                  <div key={inquiry.id} className="py-3 hover:bg-gray-50 px-2 rounded-md transition-colors">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-gray-800">{inquiry.name}</h3>
                      <StatusBadge status={inquiry.status || 'new'} />
                    </div>
                    <p className="text-sm text-gray-500">{inquiry.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No offplan inquiries found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
