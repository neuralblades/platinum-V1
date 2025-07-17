// hooks/usePropertyData.ts
'use client';

import { useQuery } from '@tanstack/react-query';
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
  const {
    data: propertyData,
    isLoading: propertyLoading,
    isError: propertyError,
  } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: async () => {
      if (!propertyId) throw new Error('Invalid property ID');
      const response = await getPropertyById(propertyId);
      if (!response.success || !response.data) throw new Error('Property not found');
      if (!response.data.is_offplan) throw new Error('This is not an offplan property');
      return response.data as Property;
    },
  });

  const developerId = propertyData?.developer?.id;
  const {
    data: developerData,
    isLoading: developerLoading,
    isError: developerError,
  } = useQuery({
    queryKey: ['developer', developerId],
    queryFn: async () => {
      if (!developerId) return null;
      const response = await getDeveloperById(developerId);
      if (!response.success || !response.data) return null;
      return response.data as Developer;
    },
    enabled: !!developerId,
  });

  return {
    property: propertyData || null,
    developer: developerData || null,
    loading: propertyLoading || developerLoading,
    error: propertyError ? (propertyError instanceof Error ? propertyError.message : String(propertyError))
      : developerError ? (developerError instanceof Error ? developerError.message : String(developerError))
      : null,
  };
}