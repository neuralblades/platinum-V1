// components/PropertyTabs.tsx
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { Property, Developer } from '../types/property.types';

// Lazy load tab content - only loads when tab is clicked
const PropertyDetails = dynamic(() => import('./PropertyDetails'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />
});

const PropertyGallery = dynamic(() => import('./PropertyGallery'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />
});

const PropertyLocation = dynamic(() => import('./PropertyLocation'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />
});

const PropertyPayment = dynamic(() => import('./PropertyPayment'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />
});

const PropertyAmenities = dynamic(() => import('./PropertyAmenities'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />
});

interface Props {
  property: Property;
  developer: Developer | null;
}

export default function PropertyTabs({ property, developer }: Props) {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { 
      name: 'Details', 
      icon: (
        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      name: 'Gallery', 
      icon: (
        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      name: 'Location', 
      icon: (
        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    { 
      name: 'Amenities', 
      icon: (
        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    { 
      name: 'Payment', 
      icon: (
        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12" data-tabs>
      <TabGroup onChange={setActiveTab}>
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <TabList className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab, index) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  `py-4 px-6 text-sm font-medium outline-none transition-all duration-200 flex items-center whitespace-nowrap ${
                    selected 
                      ? 'text-gray-800 border-b-2 border-gray-700 bg-gray-100' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`
                }
              >
                {tab.icon}
                {tab.name}
              </Tab>
            ))}
          </TabList>
        </div>

        <TabPanels>
          <TabPanel>
            {activeTab === 0 && <PropertyDetails property={property} developer={developer} />}
          </TabPanel>
          <TabPanel>
            {activeTab === 1 && <PropertyGallery property={property} />}
          </TabPanel>
          <TabPanel>
            {activeTab === 2 && <PropertyLocation property={property} />}
          </TabPanel>
          <TabPanel>
            {activeTab === 3 && <PropertyAmenities property={property} />}
          </TabPanel>
          <TabPanel>
            {activeTab === 4 && <PropertyPayment property={property} />}
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}