"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getProperties, getPropertyById, PropertyFilter } from '@/services/propertyService';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface IntegratedSearchFiltersProps {
  filters: PropertyFilter;
  onFilterChange: (filters: PropertyFilter) => void;
  onApplyFilters: () => void;
  className?: string;
  isLoading?: boolean;
  isError?: boolean;
  results?: any;
}

interface Suggestion {
  id: string;
  title: string;
  location: string;
  isOffplan?: boolean;
}

// Property type options
const propertyTypes = [
  { value: '', label: 'Any Type' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Land' },
];

// Status options
const statusOptions = [
  { value: '', label: 'Any Status' },
  { value: 'for-sale', label: 'For Sale' },
  { value: 'for-rent', label: 'For Rent' },
  { value: 'sold', label: 'Sold' },
];

// Price range options
const priceRanges = [
  { value: '', label: 'Any Price' },
  { value: '0-500000', label: 'AED 0 - 500,000' },
  { value: '500000-1000000', label: 'AED 500,000 - 1,000,000' },
  { value: '1000000-2000000', label: 'AED 1,000,000 - 2,000,000' },
  { value: '2000000-10000000', label: 'AED 2,000,000+' },
];

// Bedroom options
const bedroomOptions = [
  { value: '', label: 'Any' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
  { value: '5', label: '5+' },
];

// Bathroom options
const bathroomOptions = [
  { value: '', label: 'Any' },
  { value: '1', label: '1+' },
  { value: '2', label: '2+' },
  { value: '3', label: '3+' },
  { value: '4', label: '4+' },
  { value: '5', label: '5+' },
];

// Location options (can be expanded or fetched from API)
const locationOptions = [
  { value: '', label: 'Any Location' },
  { value: 'New York', label: 'New York' },
  { value: 'Los Angeles', label: 'Los Angeles' },
  { value: 'Miami', label: 'Miami' },
  { value: 'Chicago', label: 'Chicago' },
  { value: 'San Francisco', label: 'San Francisco' },
  { value: 'Seattle', label: 'Seattle' },
  { value: 'Boston', label: 'Boston' },
  { value: 'Dallas', label: 'Dallas' },
];

const IntegratedSearchFilters: React.FC<IntegratedSearchFiltersProps> = ({
  filters,
  onFilterChange,
  onApplyFilters,
  className = '',
  isLoading = false,
  isError = false,
  results = [],
}) => {
  const [query, setQuery] = useState(filters.keyword || '');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // State for error handling
  const [error, setError] = useState<string | null>(null);

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getProperties({ keyword: query, page: 1 });

        if (response.success && response.properties) {
          if (response.properties.length === 0) {
            // No properties found, but API call was successful
            setSuggestions([]);
          } else {
            // Map properties to suggestions
            const propertyResults = response.properties.map((property: { id: string; title: string; location: string; isOffplan?: boolean }) => ({
              id: property.id,
              title: property.title,
              location: property.location,
              isOffplan: property.isOffplan,
            }));
            setSuggestions(propertyResults.slice(0, 5)); // Limit to 5 suggestions
          }
        } else {
          // API returned success: false
          setSuggestions([]);
          setError(response.message || 'Failed to fetch properties');
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setError('Network error. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search to avoid too many API calls
    const debounceTimer = setTimeout(() => {
      if (query.length >= 2) {
        fetchSuggestions();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Handle click outside to close suggestions and filters
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close suggestions if clicked outside
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }

      // Close advanced filters if clicked outside
      if (
        filtersRef.current &&
        !filtersRef.current.contains(event.target as Node) &&
        !(event.target as Element)?.closest?.('.filter-toggle')
      ) {
        setShowAdvancedFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSuggestionClick(suggestions[selectedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setShowAdvancedFilters(false);
    }
  };

  const handleSearch = () => {
    // Even if query is empty, we should apply other filters
    onFilterChange({ ...filters, keyword: query.trim(), page: 1 });
    onApplyFilters();
    setShowSuggestions(false);
    setError(null); // Clear any previous errors
  };

  const handleSuggestionClick = async (suggestion: Suggestion) => {
    try {
      if (!suggestion || !suggestion.id) {
        console.error('Invalid suggestion:', suggestion);
        setError('Unable to navigate to this property. Please try another one.');
        return;
      }

      // Fetch the property details to check if it's an offplan property
      const response = await getPropertyById(suggestion.id);

      if (response.success && response.property) {
        // Check if the property is offplan and route accordingly
        if (response.property.isOffplan) {
          router.push(`/properties/offplan/${suggestion.id}`);
        } else {
          router.push(`/properties/${suggestion.id}`);
        }
        setShowSuggestions(false);
        setError(null);
      } else {
        throw new Error('Failed to fetch property details');
      }
    } catch (error) {
      console.error('Error navigating to property:', error);
      setError('Unable to navigate to this property. Please try again later.');
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;

    switch (id) {
      case 'location':
        onFilterChange({ ...filters, location: value, page: 1 });
        break;
      case 'property-type':
        onFilterChange({ ...filters, type: value, page: 1 });
        break;
      case 'status':
        onFilterChange({ ...filters, status: value, page: 1 });
        break;
      case 'price-range':
        if (value === '') {
          onFilterChange({ ...filters, minPrice: undefined, maxPrice: undefined, page: 1 });
        } else {
          const [min, max] = value.split('-').map(Number);
          onFilterChange({ ...filters, minPrice: min, maxPrice: max, page: 1 });
        }
        break;
      case 'bedrooms':
        onFilterChange({ ...filters, bedrooms: value ? Number(value) : undefined, page: 1 });
        break;
      case 'bathrooms':
        onFilterChange({ ...filters, bathrooms: value ? Number(value) : undefined, page: 1 });
        break;
      default:
        break;
    }
  };

  const handleReset = () => {
    onFilterChange({
      page: 1,
      type: '',
      status: '',
      location: '',
      minPrice: undefined,
      maxPrice: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      yearBuilt: undefined,
      keyword: query, // Preserve search keyword
    });
    setShowAdvancedFilters(false);
  };

  // Check if any filters are active
  const hasActiveFilters =
    filters.type ||
    filters.status ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.bedrooms !== undefined ||
    filters.bathrooms !== undefined ||
    filters.yearBuilt !== undefined ||
    filters.location;

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
        {/* Main search bar with integrated filters */}
        <div className="relative flex flex-col md:flex-row gap-2">
          {/* Search input */}
          <div className="flex-grow relative">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  const value = e.target.value;
                  setQuery(value);

                  // Only show suggestions if we have at least 2 characters
                  if (value.length >= 2) {
                    setShowSuggestions(true);
                  } else {
                    setShowSuggestions(false);
                    setError(null); // Clear any errors when input is too short
                  }

                  setSelectedIndex(-1);
                }}
                onFocus={() => {
                  // Only show suggestions on focus if we have a valid query
                  if (query.length >= 2) {
                    setShowSuggestions(true);
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search by area, project or community..."
                className="w-full px-4 py-3 pr-10 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 text-gray-700 placeholder-gray-500"
                aria-label="Search"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                aria-label="Search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && (
              <div
                ref={suggestionsRef}
                className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
              >
                {loading ? (
                  <LoadingSpinner />
                ) : error ? (
                  <div className="p-3 text-center text-red-500">
                    <div className="flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{error}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Try adjusting your search or browse all properties
                    </div>
                  </div>
                ) : suggestions.length > 0 ? (
                  <ul>
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                          index === selectedIndex ? 'bg-gray-50' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900">{suggestion.title}</div>
                        <div className="text-sm text-gray-600">{suggestion.location}</div>
                      </li>
                    ))}
                  </ul>
                ) : query.length >= 2 ? (
                  <div className="p-3 text-center">
                    <div className="text-gray-500">No properties found matching &ldquo;{query}&rdquo;</div>
                    <div className="mt-2 text-sm text-gray-600">
                      Try different keywords or browse all properties
                    </div>
                    <button
                      onClick={() => {
                        setQuery('');
                        onFilterChange({ ...filters, keyword: '', page: 1 });
                        onApplyFilters();
                        setShowSuggestions(false);
                      }}
                      className="mt-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                    >
                      Clear search and show all properties
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Quick filters */}
          <div
            className="flex flex-wrap gap-2"
          >
            {/* Property Type Filter */}
            <div
              className="min-w-[120px]"
            >
              <select
                id="property-type"
                className="w-full h-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 text-gray-700 appearance-none bg-white"
                value={filters.type || ''}
                onChange={handleFilterChange}
              >
                <option value="">Property Type</option>
                {propertyTypes.map((option) => (
                  option.value && (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  )
                ))}
              </select>
            </div>

            {/* Bedrooms Filter */}
            <div
              className="min-w-[100px]"
            >
              <select
                id="bedrooms"
                className="w-full h-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 text-gray-700 appearance-none bg-white"
                value={filters.bedrooms?.toString() || ''}
                onChange={handleFilterChange}
              >
                <option value="">Beds</option>
                {bedroomOptions.map((option) => (
                  option.value && (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  )
                ))}
              </select>
            </div>

            {/* Advanced Filters Toggle */}
            <div
              className="min-w-[100px]"
            >
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="filter-toggle w-full h-full px-3 py-3 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-500 flex items-center justify-center"
              >
                <span>Filters</span>
                {hasActiveFilters && (
                  <span
                    className="ml-1 flex h-2 w-2 rounded-full bg-gray-600"
                  />
                )}
              </button>
            </div>

            {/* Search Button */}
            <div
              className="min-w-[100px]"
            >
              <Button
                type="submit"
                variant="primary"
                className="w-full h-full"
              >
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced filters panel */}
        {showAdvancedFilters && (
          <div
            ref={filtersRef}
            className="absolute z-10 left-0 right-0 mt-2 p-4 border border-gray-200 rounded-md bg-white shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Status Filter */}
              <div>
                <label htmlFor="status" className="block text-gray-700 text-sm font-medium mb-2">
                  Status
                </label>
                <select
                  id="status"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 text-gray-700 bg-white"
                  value={filters.status || ''}
                  onChange={handleFilterChange}
                >
                  <option value="">Any Status</option>
                  {statusOptions.map((option) => (
                    option.value && (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    )
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label htmlFor="price-range" className="block text-gray-700 text-sm font-medium mb-2">
                  Price Range
                </label>
                <select
                  id="price-range"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 text-gray-700 bg-white"
                  value={
                    filters.minPrice !== undefined && filters.maxPrice !== undefined
                      ? `${filters.minPrice}-${filters.maxPrice}`
                      : ''
                  }
                  onChange={handleFilterChange}
                >
                  <option value="">Any Price</option>
                  {priceRanges.map((option) => (
                    option.value && (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    )
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label htmlFor="location" className="block text-gray-700 text-sm font-medium mb-2">
                  Location
                </label>
                <select
                  id="location"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 text-gray-700 bg-white"
                  value={filters.location || ''}
                  onChange={handleFilterChange}
                >
                  <option value="">Any Location</option>
                  {locationOptions.map((option) => (
                    option.value && (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    )
                  ))}
                </select>
              </div>

              {/* Bathrooms Filter */}
              <div>
                <label htmlFor="bathrooms" className="block text-gray-700 text-sm font-medium mb-2">
                  Bathrooms
                </label>
                <select
                  id="bathrooms"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 text-gray-700 bg-white"
                  value={filters.bathrooms?.toString() || ''}
                  onChange={handleFilterChange}
                >
                  <option value="">Any</option>
                  {bathroomOptions.map((option) => (
                    option.value && (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    )
                  ))}
                </select>
              </div>

              {/* Year Built Filter */}
              <div>
                <label htmlFor="year-built" className="block text-gray-700 text-sm font-medium mb-2">
                  Year Built
                </label>
                <input
                  type="number"
                  id="year-built"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 text-gray-700 bg-white"
                  placeholder="e.g. 2020"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={filters.yearBuilt || ''}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : undefined;
                    onFilterChange({ ...filters, yearBuilt: value, page: 1 });
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 mr-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition duration-300"
              >
                Reset Filters
              </button>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  onApplyFilters();
                  setShowAdvancedFilters(false);
                }}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default IntegratedSearchFilters;
