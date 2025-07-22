// hooks/usePropertyData.ts
'use client';

import { useState, useEffect } from 'react';
import { getPropertyById } from '@/services/propertyService';
import { getDeveloperById } from '@/services/developerService';
import { Property, Developer } from '../types/property.types';

interface UsePropertyDataReturn {
  property: Property | null;
  developer: Developer | null;
  loading: boolean;
  error: string | null;
}

export function usePropertyData(propertyId: string): UsePropertyDataReturn {
  const [property, setProperty] = useState<Property | null>(null);
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!propertyId) {
        setError('Invalid property ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch property data
        const propertyResponse = await getPropertyById(propertyId);
        
        if (!propertyResponse.success || !propertyResponse.data) {
          throw new Error('Property not found');
        }
        
        if (!propertyResponse.data.is_offplan) {
          throw new Error('This is not an offplan property');
        }
        
        const propertyData = propertyResponse.data as Property;
        setProperty(propertyData);
        
        // Fetch developer data if property has developer
        const developerId = propertyData?.developer?.id;
        if (developerId) {
          try {
            const developerResponse = await getDeveloperById(developerId);
            if (developerResponse.success && developerResponse.data) {
              setDeveloper(developerResponse.data as Developer);
            } else {
              setDeveloper(null);
            }
          } catch (developerError) {
            console.error('Error fetching developer:', developerError);
            // Don't set error for developer fetch failure, just set developer to null
            setDeveloper(null);
          }
        } else {
          setDeveloper(null);
        }
        
      } catch (err) {
        console.error('Error fetching property data:', err);
        setError(err instanceof Error ? err.message : String(err));
        setProperty(null);
        setDeveloper(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
  }, [propertyId]);

  return {
    property,
    developer,
    loading,
    error,
  };
}