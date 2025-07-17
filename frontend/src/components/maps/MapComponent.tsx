'use client';

import { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsApi } from '@/utils/googleMapsLoader';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface MapComponentProps {
  address?: string;
  location?: string;
  height?: string;
  zoom?: number;
}

const MapComponent = ({ address, location, height = '400px', zoom = 15 }: MapComponentProps) => {
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
    if (!address && !location) {
      setMapError('Address or location information is missing');
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    const searchAddress = address ? (location ? `${address}, ${location}` : address) : location;

    geocoder.geocode({ address: searchAddress }, (results, status) => {
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
      styles: [
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#e9e9e9' }, { lightness: 17 }]
        },
        {
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: [{ color: '#f5f5f5' }, { lightness: 20 }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.fill',
          stylers: [{ color: '#ffffff' }, { lightness: 17 }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#ffffff' }, { lightness: 29 }, { weight: 0.2 }]
        },
        {
          featureType: 'road.arterial',
          elementType: 'geometry',
          stylers: [{ color: '#ffffff' }, { lightness: 18 }]
        },
        {
          featureType: 'road.local',
          elementType: 'geometry',
          stylers: [{ color: '#ffffff' }, { lightness: 16 }]
        },
        {
          featureType: 'poi',
          elementType: 'geometry',
          stylers: [{ color: '#f5f5f5' }, { lightness: 21 }]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{ color: '#dedede' }, { lightness: 21 }]
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{ color: '#f2f2f2' }, { lightness: 19 }]
        },
        {
          featureType: 'administrative',
          elementType: 'geometry.fill',
          stylers: [{ color: '#fefefe' }, { lightness: 20 }]
        },
        {
          featureType: 'administrative',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#fefefe' }, { lightness: 17 }, { weight: 1.2 }]
        }
      ]
    };

    const map = new window.google.maps.Map(mapRef.current, mapOptions);

    // Add marker for property location
    new window.google.maps.Marker({
      position: coordinates,
      map,
      title: location || address,
      animation: window.google.maps.Animation.DROP,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#0D9488', // gray-600
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
      }
    });

  }, [mapLoaded, coordinates, zoom, location, address]);

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

export default MapComponent;
