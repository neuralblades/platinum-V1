'use client';

import { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsApi } from '@/utils/googleMapsLoader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface MapProps {
  address?: string;
  location?: string;
  height?: string;
  zoom?: number;
}

const Map = ({ address, location, height = '400px', zoom = 15 }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load Google Maps API
  useEffect(() => {
    const loadMap = async () => {
      try {
        await loadGoogleMapsApi();
        setMapLoaded(true);
      } catch (error) {
        console.error('Error loading Google Maps API:', error);
        setMapError('Failed to load Google Maps');
      } finally {
        setIsLoading(false);
      }
    };

    loadMap();
  }, []);

  // Geocode address to get coordinates
  useEffect(() => {
    if (!mapLoaded || !window.google || !window.google.maps) return;
    if (!address || !location) {
      setMapError('Address or location information is missing');
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    const fullAddress = `${address}, ${location}`;

    geocoder.geocode({ address: fullAddress }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const { lat, lng } = results[0].geometry.location;
        setCoordinates({
          lat: lat(),
          lng: lng()
        });
      } else {
        console.error('Geocoding failed:', status);
        setMapError('Could not find location on map');
      }
    });
  }, [mapLoaded, address, location]);

  // Initialize map once we have coordinates
  useEffect(() => {
    if (!mapLoaded || !coordinates || !mapRef.current || !window.google || !window.google.maps) return;

    const mapOptions = {
      center: coordinates,
      zoom,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    };

    const map = new window.google.maps.Map(mapRef.current, mapOptions);

    // Add marker for property location
    new window.google.maps.Marker({
      position: coordinates,
      map,
      title: location,
      animation: window.google.maps.Animation.DROP,
    });

  }, [mapLoaded, coordinates, zoom, location]);

  if (mapError) {
    return (
      <div
        className="bg-gray-100 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-gray-500">{mapError}</p>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="rounded-lg overflow-hidden w-full"
      style={{ height }}
    >
      {isLoading && (
        <LoadingSpinner />
      )}
    </div>
  );
};

export default Map;
