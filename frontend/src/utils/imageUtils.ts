/**
 * Utility functions for handling image URLs and optimization
 */

// Backend server URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
// Normalize API URL to ensure it doesn't end with /api
const BASE_URL = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;

// Default placeholder image for missing images
const DEFAULT_IMAGE = '/images/default-property.jpg';

// WebP support detection (client-side only)
const supportsWebP = typeof window !== 'undefined' &&
  document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;

/**
 * Converts a relative image path to a full URL with WebP support
 * @param imagePath - The relative image path (e.g., /uploads/image.jpg)
 * @param preferWebP - Whether to prefer WebP format if supported by the browser
 * @returns The full URL to the image or a placeholder if the image is missing
 */
export const getFullImageUrl = (imagePath: string, preferWebP: boolean = true): string => {
  // Handle null or undefined image paths
  if (!imagePath) {
    return DEFAULT_IMAGE;
  }

  // If the image path is already a full URL, return it as is (with WebP conversion if needed)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return preferWebP && supportsWebP && !imagePath.endsWith('.webp')
      ? convertToWebPUrl(imagePath)
      : imagePath;
  }

  // If the image path starts with /uploads, use the backend server
  if (imagePath.startsWith('/uploads/')) {
    // Fix duplicate /api in the URL
    const apiPath = API_URL.includes('/api') ? '' : '/api';
    const fullUrl = `${API_URL}${apiPath}${imagePath}`;
    return preferWebP && supportsWebP && !imagePath.endsWith('.webp')
      ? convertToWebPUrl(fullUrl)
      : fullUrl;
  }

  // If the image path is just a filename without a path, assume it's in uploads
  if (imagePath.match(/^[^/]+\.(jpg|jpeg|png|gif|webp)$/i)) {
    // Fix duplicate /api in the URL
    const apiPath = API_URL.includes('/api') ? '' : '/api';
    const fullUrl = `${API_URL}${apiPath}/uploads/${imagePath}`;
    return preferWebP && supportsWebP && !imagePath.endsWith('.webp')
      ? convertToWebPUrl(fullUrl)
      : fullUrl;
  }

  // Otherwise, return the image path as is
  return imagePath;
};

/**
 * Converts an image URL to WebP format if possible
 * @param url - The original image URL
 * @returns The WebP version URL if possible, otherwise the original URL
 */
export const convertToWebPUrl = (url: string): string => {
  // If the URL already ends with .webp, return it as is
  if (url.endsWith('.webp')) {
    return url;
  }

  // Check if the URL contains the uploads path
  if (url.includes('/uploads/')) {
    // Extract the path after /uploads/
    const uploadPathMatch = url.match(/\/uploads\/(.+)/);
    if (uploadPathMatch && uploadPathMatch[1]) {
      const imagePath = uploadPathMatch[1];

      // Check if it's a supported image format
      if (imagePath.match(/\.(jpe?g|png|gif)$/i)) {
        // For paths with subdirectories, preserve the structure
        if (imagePath.includes('/')) {
          // Split the path into segments
          const segments = imagePath.split('/');
          if (segments.length >= 2) {
            const subdir = segments[0];
            const filename = segments[segments.length - 1];
            // Fix duplicate /api in the URL
            const apiPath = API_URL.includes('/api') ? '' : '/api';
            return `${API_URL}${apiPath}/images/webp/${subdir}/${filename}`;
          }
        }

        // For simple filenames without subdirectories
        const filename = imagePath.split('/').pop();
        if (filename) {
          // Fix duplicate /api in the URL
          const apiPath = API_URL.includes('/api') ? '' : '/api';
          return `${API_URL}${apiPath}/images/webp/${filename}`;
        }
      }
    }
  }

  // Check if the URL ends with a common image extension
  const match = url.match(/\.(jpe?g|png|gif)$/i);
  if (match) {
    // Replace the extension with .webp
    return url.replace(/\.(jpe?g|png|gif)$/i, '.webp');
  }

  // If the URL doesn't have a recognizable image extension, try to append WebP parameter
  // This assumes the backend can handle format conversion via query parameter
  if (url.includes('?')) {
    return `${url}&format=webp`;
  } else {
    return `${url}?format=webp`;
  }
};

/**
 * Handles image loading errors by providing a fallback image
 * @param event - The error event from the image
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const src = event.currentTarget.src;

  // If the image is a WebP and failed to load, try falling back to original format
  if (src.endsWith('.webp') && src.match(/\.(webp)$/i)) {
    // Try to get the original format by replacing .webp with original extension
    // Try jpg first, then png if that fails
    const jpgSrc = src.replace('.webp', '.jpg');

    // Only set if it's different from the current src to avoid loops
    if (jpgSrc !== src) {
      console.log('WebP image failed to load, trying JPG fallback:', jpgSrc);
      event.currentTarget.src = jpgSrc;

      // Add a new error handler for the jpg fallback
      event.currentTarget.onerror = () => {
        // If jpg fails, try png
        const pngSrc = src.replace('.webp', '.png');
        console.log('JPG fallback failed, trying PNG:', pngSrc);
        event.currentTarget.src = pngSrc;

        // If png fails, use default placeholder
        event.currentTarget.onerror = () => {
          console.log('All fallbacks failed, using default placeholder');
          event.currentTarget.src = DEFAULT_IMAGE;
          event.currentTarget.onerror = null;
        };
      };
      return;
    }
  }

  // If WebP fallback didn't work or wasn't applicable, use default placeholder
  console.log('Image failed to load, using default placeholder:', src);
  event.currentTarget.src = DEFAULT_IMAGE;
  event.currentTarget.onerror = null; // Prevent infinite loop if fallback also fails
};

/**
 * Generates a low-quality image placeholder (LQIP) data URL
 * @param width - Width of the placeholder
 * @param height - Height of the placeholder
 * @param color - Background color (hex or rgba)
 * @returns A data URL for the placeholder
 */
export const generatePlaceholder = (
  width: number = 10,
  height: number = 10,
  color: string = 'rgba(200, 200, 200, 0.5)'
): string => {
  // For server-side rendering, return a simple data URL
  if (typeof window === 'undefined') {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAJJXF+wHAAAAABJRU5ErkJggg==';
  }

  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  // Get the canvas context and fill with the specified color
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  }

  // Convert the canvas to a data URL
  return canvas.toDataURL('image/jpeg', 0.1);
};
