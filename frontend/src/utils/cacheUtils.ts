/**
 * Clear the server cache for a specific key or all keys
 * @param {string} key - Optional cache key to clear (if not provided, clears all cache)
 * @returns {Promise<boolean>} - True if cache was cleared successfully
 */
export const clearServerCache = async (key?: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/cache/clear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key }),
    });

    if (!response.ok) {
      console.error('Failed to clear cache:', await response.text());
      return false;
    }

    const data = await response.json();
    console.log('Cache cleared:', data.message);
    return data.success;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
};

/**
 * Clear the browser cache for a specific image
 * @param {string} imageUrl - URL of the image to clear from cache
 */
export const clearImageCache = (imageUrl: string): void => {
  // Add a timestamp query parameter to force a reload
  const timestamp = new Date().getTime();
  const url = new URL(imageUrl, window.location.origin);
  url.searchParams.set('t', timestamp.toString());
  
  // Create a new image element and load the URL with timestamp
  const img = new Image();
  img.src = url.toString();
};
