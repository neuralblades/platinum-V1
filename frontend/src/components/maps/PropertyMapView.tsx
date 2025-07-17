'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { loadGoogleMapsApi } from '@/utils/googleMapsLoader';
import { getFullImageUrl } from '../../utils/imageUtils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Property } from '@/services/propertyService';

// Types
interface PropertyMarker extends google.maps.Marker {
  propertyData?: Property;
}

interface PropertyMapViewProps {
  properties: Property[];
  onPropertySelect: (property: Property) => void;
  selectedProperty: Property | null;
}

const PropertyMapView = ({ properties, onPropertySelect, selectedProperty }: PropertyMapViewProps) => {
  // Refs and state
  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<PropertyMarker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load Google Maps API
  useEffect(() => {
    const loadMap = async () => {
      try {
        await loadGoogleMapsApi();
        setMapLoaded(true);
      } catch (error) {
        console.error('Error loading Google Maps API:', error);
        setMapError('Failed to load Google Maps');
      }
    };

    loadMap();
  }, []);

  // Initialize map once API is loaded
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google || !window.google.maps) return;

    // Default center (Dubai coordinates)
    const defaultCenter = { lat: 25.0, lng: 55.0 };

    // Map configuration
    const mapOptions = {
      center: defaultCenter,
      zoom: 9,
      mapTypeControl: false,
      streetViewControl: true,
      fullscreenControl: false,
      zoomControl: true,
      gestureHandling: 'cooperative',
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: [
        { "featureType": "water", "elementType": "geometry", "stylers": [{"color": "#ADD8E6"}, {"lightness": 17}] },
        { "featureType": "landscape", "elementType": "geometry", "stylers": [{"color": "#f5f5f5"}, {"lightness": 20}] },
        { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{"color": "#ffffff"}, {"lightness": 17}] },
        { "featureType": "poi", "elementType": "labels", "stylers": [{"visibility": "off"}] }
      ]
    };

    // Create map and info window
    const newMap = new window.google.maps.Map(mapRef.current, mapOptions);

    // Create a custom info window without the default close button
    const newInfoWindow = new window.google.maps.InfoWindow({
      pixelOffset: new window.google.maps.Size(0, -5),
      disableAutoPan: false
    });

    // Remove the default close button after the info window is created
    google.maps.event.addListener(newInfoWindow, 'domready', () => {
      // Find and remove the default close button
      const closeButtons = document.querySelectorAll('.gm-ui-hover-effect');
      if (closeButtons.length > 0) {
        closeButtons.forEach(button => {
          (button as HTMLElement).style.display = 'none';
        });
      }
    });

    setMap(newMap);
    setInfoWindow(newInfoWindow);
  }, [mapLoaded]);

  // Create markers only once when the map and properties are first loaded
  useEffect(() => {
    if (!mapLoaded || !map || !window.google || !window.google.maps || properties.length === 0) return;

    // Skip if we already have markers for these properties
    if (markersRef.current.length > 0) return;

    console.log('Creating initial markers');
    const geocoder = new window.google.maps.Geocoder();
    const bounds = new window.google.maps.LatLngBounds();
    const newMarkers: PropertyMarker[] = [];

    // Process each property
    const createMarkers = async () => {
      for (const property of properties) {
        let position: google.maps.LatLngLiteral;

        // If property already has coordinates, use them
        if (property.latitude && property.longitude) {
          position = { lat: property.latitude, lng: property.longitude };
        } else {
          // Otherwise geocode the location
          try {
            const searchAddress = property.address ?
              `${property.address}, ${property.location}` :
              property.location;

            const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
              geocoder.geocode({ address: searchAddress }, (results, status) => {
                if (status === 'OK' && results && results.length > 0) {
                  resolve(results);
                } else {
                  reject(status);
                }
              });
            });

            position = {
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng()
            };
          } catch (error) {
            console.error(`Geocoding failed for ${property.title}:`, error);
            continue;
          }
        }

        // Create marker
        const marker = new window.google.maps.Marker({
          position,
          map,
          title: property.title,
          icon: {
            path: 'M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.13,15.87,2,12,2z M12,11.5c-1.38,0-2.5-1.12-2.5-2.5s1.12-2.5,2.5-2.5s2.5,1.12,2.5,2.5S13.38,11.5,12,11.5z',
            fillColor: '#3B82F6',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            scale: 1.6,
            anchor: new google.maps.Point(12, 22),
            labelOrigin: new google.maps.Point(12, 9)
          },
          optimized: true,
          zIndex: 1
        }) as PropertyMarker;

        // Store property data with marker
        marker.propertyData = property;

        // Add click event
        marker.addListener('click', () => {
          onPropertySelect(property);
        });

        newMarkers.push(marker);
        bounds.extend(position);
      }

      // Fit map to show all markers
      if (newMarkers.length > 0) {
        // Add padding to bounds
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        const latSpan = ne.lat() - sw.lat();
        const lngSpan = ne.lng() - sw.lng();

        bounds.extend(new google.maps.LatLng(ne.lat() + latSpan * 0.2, ne.lng() + lngSpan * 0.2));
        bounds.extend(new google.maps.LatLng(sw.lat() - latSpan * 0.2, sw.lng() - lngSpan * 0.2));

        map.fitBounds(bounds);

        // Adjust zoom level if needed
        google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          const zoom = map.getZoom() || 12;

          if (newMarkers.length === 1) {
            map.setZoom(14);
          } else if (zoom > 15) {
            map.setZoom(14);
          } else if (zoom < 8) {
            map.setZoom(9);
          }
        });
      }

      // Store markers in ref
      markersRef.current = newMarkers;
    };

    createMarkers();

    // Cleanup function - only runs when component unmounts
    return () => {
      markersRef.current.forEach(marker => {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded, map, properties.length]);

  // Create a custom info window component with the Button
  const createInfoWindowContent = useCallback((property: Property) => {
    // Create a div to hold our content
    const container = document.createElement('div');
    container.className = 'p-0 max-w-[250px] font-sans rounded-lg overflow-hidden shadow-lg';

    // Property image section
    const imageSection = document.createElement('div');
    imageSection.className = 'relative h-[140px] bg-cover bg-center';
    imageSection.style.backgroundImage = `url('${getFullImageUrl(property.main_image)}')`;

    // Close button
    const closeButton = document.createElement('div');
    closeButton.className = 'absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer z-10 transition-colors';
    closeButton.innerHTML = '&times;';
    closeButton.style.fontSize = '16px';
    closeButton.style.lineHeight = '1';
    closeButton.onclick = (e) => {
      e.stopPropagation();
      infoWindow?.close();
      // Reset selected property to allow reopening the same property
      if (onPropertySelect) {
        // @ts-expect-error - We know the function can handle null
        onPropertySelect(null);
      }
    };
    imageSection.appendChild(closeButton);

    // Price badge
    const priceBadge = document.createElement('div');
    priceBadge.className = 'absolute bottom-2 left-2 bg-black/70 text-white px-1.5 py-0.5 rounded text-xs font-bold';
    priceBadge.textContent = `AED ${typeof property.price === 'number' ? property.price.toLocaleString() : Number(property.price).toLocaleString()}`;
    imageSection.appendChild(priceBadge);

    // Badges container
    const badgesContainer = document.createElement('div');
    badgesContainer.className = 'absolute top-2 left-2 flex flex-col space-y-1';
    imageSection.appendChild(badgesContainer);

    // Featured badge (if applicable)
    if (property.featured) {
      const featuredBadge = document.createElement('div');
      featuredBadge.className = 'bg-gradient-to-r from-gray-700 to-gray-900 text-white px-2 py-0.5 rounded-full text-xs font-semibold shadow-md';
      featuredBadge.textContent = 'Featured';
      badgesContainer.appendChild(featuredBadge);
    }

    // Off-plan badge (if applicable)
    if (property.is_offplan) {
      const offplanBadge = document.createElement('div');
      offplanBadge.className = 'bg-gradient-to-r from-gray-600 to-gray-800 text-white px-2 py-0.5 rounded-full text-xs font-semibold shadow-md';
      offplanBadge.textContent = 'Off Plan';
      badgesContainer.appendChild(offplanBadge);
    }

    // Content section
    const contentSection = document.createElement('div');
    contentSection.className = 'p-2';

    // Property title
    const title = document.createElement('h3');
    title.className = 'font-bold mb-1 text-gray-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis';
    title.textContent = property.title;
    contentSection.appendChild(title);

    // Location
    const location = document.createElement('p');
    location.className = 'mb-1 flex items-center text-gray-600 text-xs';

    // SVG for location icon
    const locationSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    locationSvg.setAttribute('class', 'h-4 w-4 mr-1 text-gray-700');
    locationSvg.setAttribute('fill', 'none');
    locationSvg.setAttribute('viewBox', '0 0 24 24');
    locationSvg.setAttribute('stroke', 'currentColor');

    const locationPath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    locationPath1.setAttribute('stroke-linecap', 'round');
    locationPath1.setAttribute('stroke-linejoin', 'round');
    locationPath1.setAttribute('stroke-width', '2');
    locationPath1.setAttribute('d', 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z');

    const locationPath2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    locationPath2.setAttribute('stroke-linecap', 'round');
    locationPath2.setAttribute('stroke-linejoin', 'round');
    locationPath2.setAttribute('stroke-width', '2');
    locationPath2.setAttribute('d', 'M15 11a3 3 0 11-6 0 3 3 0 016 0z');

    locationSvg.appendChild(locationPath1);
    locationSvg.appendChild(locationPath2);
    location.appendChild(locationSvg);

    const locationText = document.createTextNode(property.location);
    location.appendChild(locationText);
    contentSection.appendChild(location);

    // Price
    const price = document.createElement('p');
    price.className = 'text-base font-bold text-gray-700 mb-1';
    price.textContent = `AED ${typeof property.price === 'number' ? property.price.toLocaleString() : Number(property.price).toLocaleString()}`;
    contentSection.appendChild(price);

    // Property details
    const details = document.createElement('div');
    details.className = 'flex justify-between text-gray-600 border-t pt-1 text-xs';

    // Bedrooms with SVG icon
    const bedroomsContainer = document.createElement('div');
    bedroomsContainer.className = 'flex items-center';

    const bedSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    bedSvg.setAttribute('class', 'h-4 w-4 mr-1 text-gray-700');
    bedSvg.setAttribute('fill', 'none');
    bedSvg.setAttribute('viewBox', '0 0 24 24');
    bedSvg.setAttribute('stroke', 'currentColor');

    const bedPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    bedPath.setAttribute('stroke-linecap', 'round');
    bedPath.setAttribute('stroke-linejoin', 'round');
    bedPath.setAttribute('stroke-width', '2');
    bedPath.setAttribute('d', 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6');

    bedSvg.appendChild(bedPath);
    bedroomsContainer.appendChild(bedSvg);

    const bedroomsSpan = document.createElement('span');
    if (property.is_offplan && property.bedroom_range) {
      bedroomsSpan.textContent = `${property.bedroom_range} Beds`;
    } else {
      bedroomsSpan.textContent = `${property.bedrooms} ${property.bedrooms === 1 ? 'Bed' : 'Beds'}`;
    }
    bedroomsContainer.appendChild(bedroomsSpan);
    details.appendChild(bedroomsContainer);

    // Middle column - either bathrooms or handover year
    const middleContainer = document.createElement('div');
    middleContainer.className = 'flex items-center';

    const calendarSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    calendarSvg.setAttribute('class', 'h-4 w-4 mr-1 text-gray-700');
    calendarSvg.setAttribute('fill', 'none');
    calendarSvg.setAttribute('viewBox', '0 0 24 24');
    calendarSvg.setAttribute('stroke', 'currentColor');

    const calendarPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    calendarPath.setAttribute('stroke-linecap', 'round');
    calendarPath.setAttribute('stroke-linejoin', 'round');
    calendarPath.setAttribute('stroke-width', '2');
    calendarPath.setAttribute('d', 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z');

    calendarSvg.appendChild(calendarPath);
    middleContainer.appendChild(calendarSvg);

    const middleSpan = document.createElement('span');
    if (property.is_offplan) {
      middleSpan.textContent = `Handover ${property.year_built || 'TBA'}`;
    } else {
      // Format bathrooms
      const bathroomsNum = typeof property.bathrooms === 'string' ? parseFloat(property.bathrooms) : property.bathrooms;
      const formattedBathrooms = Number.isInteger(bathroomsNum) ?
        bathroomsNum :
        bathroomsNum.toFixed(1).replace('.0', '');
      middleSpan.textContent = `${formattedBathrooms} ${bathroomsNum === 1 ? 'Bath' : 'Baths'}`;
    }
    middleContainer.appendChild(middleSpan);
    details.appendChild(middleContainer);

    // Right column - either area or payment plan
    const rightContainer = document.createElement('div');
    rightContainer.className = 'flex items-center';

    if (property.is_offplan) {
      // Payment plan icon
      const paymentSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      paymentSvg.setAttribute('class', 'h-4 w-4 mr-1 text-gray-700');
      paymentSvg.setAttribute('fill', 'none');
      paymentSvg.setAttribute('viewBox', '0 0 24 24');
      paymentSvg.setAttribute('stroke', 'currentColor');

      const paymentPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      paymentPath.setAttribute('stroke-linecap', 'round');
      paymentPath.setAttribute('stroke-linejoin', 'round');
      paymentPath.setAttribute('stroke-width', '2');
      paymentPath.setAttribute('d', 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z');

      paymentSvg.appendChild(paymentPath);
      rightContainer.appendChild(paymentSvg);

      const paymentSpan = document.createElement('span');
      paymentSpan.textContent = `${property.payment_plan || '60/40'} Plan`;
      rightContainer.appendChild(paymentSpan);
    } else {
      // Area icon
      const areaSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      areaSvg.setAttribute('class', 'h-4 w-4 mr-1 text-gray-700');
      areaSvg.setAttribute('fill', 'none');
      areaSvg.setAttribute('viewBox', '0 0 24 24');
      areaSvg.setAttribute('stroke', 'currentColor');

      const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      areaPath.setAttribute('stroke-linecap', 'round');
      areaPath.setAttribute('stroke-linejoin', 'round');
      areaPath.setAttribute('stroke-width', '2');
      areaPath.setAttribute('d', 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5');

      areaSvg.appendChild(areaPath);
      rightContainer.appendChild(areaSvg);

      const areaSpan = document.createElement('span');
      areaSpan.textContent = `${property.area} sqft`;
      rightContainer.appendChild(areaSpan);
    }
    details.appendChild(rightContainer);

    contentSection.appendChild(details);

    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'w-full mt-1 pt-1 border-t border-gray-200';

    // Create a link button that redirects to the property page
    const button = document.createElement('a');
    button.className = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 px-3 py-1.5 text-xs bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white font-bold shadow-md focus:ring-gray-700 w-full text-center cursor-pointer';
    button.textContent = 'View Details';
    button.href = property.is_offplan ? `/properties/offplan/${property.id}` : `/properties/${property.id}`;

    // Add target="_blank" to open in a new tab
    button.setAttribute('target', '_blank');

    buttonContainer.appendChild(button);
    contentSection.appendChild(buttonContainer);

    // Add sections to container
    container.appendChild(imageSection);
    container.appendChild(contentSection);

    return container;
  }, [infoWindow, onPropertySelect]);

  // Only handle info window when a property is selected
  useEffect(() => {
    if (!map || !selectedProperty || !infoWindow) {
      // Close info window if no property is selected
      infoWindow?.close();
      return;
    }

    // Get current markers from ref
    const currentMarkers = markersRef.current;
    if (!currentMarkers.length) return;

    // Find the selected marker
    const selectedMarker = currentMarkers.find(marker =>
      marker.propertyData?.id === selectedProperty.id
    );

    if (!selectedMarker) return;

    if (!selectedMarker.propertyData) return;

    // Create info window content using our custom function
    const infoContent = createInfoWindowContent(selectedMarker.propertyData);

    // Set content and open the info window
    infoWindow.setContent(infoContent);
    infoWindow.open(map, selectedMarker);
  }, [selectedProperty, map, infoWindow, createInfoWindowContent]);

  if (mapError) {
    return (
      <div className="bg-gray-100 rounded-lg flex items-center justify-center h-full">
        <p className="text-gray-500">{mapError}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full rounded-lg"></div>
      {isLoading && (
        <LoadingSpinner />
      )}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600"></div>
        </div>
      )}
      {/* Map controls positioned for better UX */}
      <div className="absolute top-4 right-4 bg-white shadow-md rounded-sm p-2 z-10">
        <div className="text-sm text-gray-700 font-medium">
          {properties.length} Properties
        </div>
      </div>

      {/* Map instructions */}
      <div className="absolute bottom-4 left-4 bg-white shadow-md rounded-sm p-2 z-10 max-w-xs">
        <div className="text-xs text-gray-600">
          Click on a marker to view property details
        </div>
      </div>
    </div>
  );
};

export default PropertyMapView;
