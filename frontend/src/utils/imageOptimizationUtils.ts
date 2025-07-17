/**
 * Utility functions for image optimization
 */

// Default image quality for optimized images
const DEFAULT_QUALITY = 80;

// Default placeholder for blurred images
const BLUR_PLACEHOLDER = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAJJXF+wHAAAAABJRU5ErkJggg==';

/**
 * Get the appropriate image format based on the browser support
 * @param originalSrc - The original image source
 * @returns The optimized image source with WebP if supported
 */
export const getOptimizedImageFormat = (originalSrc: string): string => {
  // If the image is already in WebP format, return it
  if (originalSrc.endsWith('.webp')) {
    return originalSrc;
  }

  // Check if the browser supports WebP
  const supportsWebP = typeof window !== 'undefined' &&
    document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;

  // If WebP is supported, try to use the WebP version
  if (supportsWebP) {
    // For images from our own server, we can try to use WebP version
    if (originalSrc.match(/\.(jpe?g|png)$/i)) {
      return originalSrc.replace(/\.(jpe?g|png)$/i, '.webp');
    }
  }

  return originalSrc;
};

/**
 * Get the appropriate image size based on the device
 * @param deviceType - The device type (mobile, tablet, desktop)
 * @param imageType - The type of image (thumbnail, card, hero, etc.)
 * @returns The appropriate image width
 */
export const getImageSizeForDevice = (
  deviceType: 'mobile' | 'tablet' | 'desktop',
  imageType: 'thumbnail' | 'card' | 'hero' | 'gallery'
): number => {
  const sizes = {
    thumbnail: {
      mobile: 100,
      tablet: 150,
      desktop: 200,
    },
    card: {
      mobile: 400,
      tablet: 600,
      desktop: 800,
    },
    hero: {
      mobile: 800,
      tablet: 1200,
      desktop: 1600,
    },
    gallery: {
      mobile: 600,
      tablet: 900,
      desktop: 1200,
    },
  };

  return sizes[imageType][deviceType];
};

/**
 * Generate responsive image sizes attribute for Next.js Image component
 * @param imageType - The type of image (thumbnail, card, hero, etc.)
 * @returns The sizes attribute string
 */
export const getResponsiveSizes = (
  imageType: 'thumbnail' | 'card' | 'hero' | 'gallery'
): string => {
  const sizeMap = {
    thumbnail: '(max-width: 640px) 100px, (max-width: 768px) 150px, 200px',
    card: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw',
    hero: '(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 50vw',
    gallery: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  };

  return sizeMap[imageType];
};

/**
 * Determine if an image should be loaded with priority
 * @param imageType - The type of image
 * @param position - The position of the image (e.g., first, second)
 * @returns Whether the image should be loaded with priority
 */
export const shouldLoadWithPriority = (
  imageType: 'thumbnail' | 'card' | 'hero' | 'gallery',
  position: number = 0
): boolean => {
  // Hero images should always be loaded with priority
  if (imageType === 'hero') {
    return true;
  }

  // First few card images in a list should be loaded with priority
  if (imageType === 'card' && position < 3) {
    return true;
  }

  // First gallery image should be loaded with priority
  if (imageType === 'gallery' && position === 0) {
    return true;
  }

  return false;
};

/**
 * Get a blur placeholder for an image
 * @returns A data URL for a blur placeholder
 */
export const getBlurPlaceholder = (): string => {
  return BLUR_PLACEHOLDER;
};
