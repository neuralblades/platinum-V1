'use client';

/**
 * Utility function to handle fetch requests with error handling
 * @param url The URL to fetch from
 * @param errorMessage The error message to display if the request fails
 * @returns The response data
 */
export async function fetchWithErrorHandling(url: string, errorMessage: string) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`${errorMessage}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(errorMessage, error);
    throw error;
  }
}

/**
 * Utility function to convert an object to query parameters
 * @param params The parameters to convert
 * @returns A URLSearchParams object
 */
export function objectToQueryParams(params: Record<string, any>): URLSearchParams {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  return queryParams;
}
