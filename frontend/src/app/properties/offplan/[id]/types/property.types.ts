// types/property.types.ts
export interface Property {
    id: string;
    title: string;
    description: string;
    price: number | string;
    location: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    property_type: string;
    status: 'for-sale' | 'for-rent';
    bedrooms?: number;
    bathrooms?: number;
    bedroom_range?: string;
    images: string[];
    header_image?: string;
    features?: string[];
    year_built?: string;
    payment_plan?: string;
    is_offplan: boolean;
    developer?: {
      id: string;
      name: string;
    };
    completionDate?: string;
  }
  
  export interface Developer {
    id: string;
    name: string;
    logo?: string;
    description?: string;
  }
  
  export interface OffplanFormData {
    name: string;
    email: string;
    phone: string;
    preferredLanguage: string;
    message: string;
    interestedInMortgage: boolean;
  }