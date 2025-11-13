import type { Vendor, BookingPayload, SearchParams, VendorApiResponse } from '../types';

export const getVendors = async (params: SearchParams): Promise<VendorApiResponse> => {
  console.log('Fetching vendors from API for:', params);
  const q = `service=${encodeURIComponent(params.service || "")}&area=${encodeURIComponent(params.area || "")}`;
  
  try {
    const response = await fetch(`/.netlify/functions/getVendors?${q}`);
    const j = await response.json();
    
    if (!response.ok) {
        console.error('Failed to fetch vendors:', response.status, j.error);
        throw new Error(j.error || 'Failed to fetch vendors. Please try again.');
    }
    
    return { items: j.items || [], usingMockData: !!j.usingMockData };
  } catch(err) {
    console.error("Network or parsing error:", err);
    if (err instanceof Error) {
        throw err;
    }
    throw new Error("An unexpected error occurred.");
  }
};

export const createBooking = async (payload: BookingPayload): Promise<{ ok: boolean }> => {
  console.log('Creating booking via API:', payload);
  try {
    const response = await fetch('/.netlify/functions/createBooking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const result = await response.json();
    
    if (!response.ok) {
        console.error('Failed to create booking:', response.status, result.error);
        throw new Error(result.error || 'Failed to create booking. Please try again.');
    }
    
    return result;
  } catch(err) {
    console.error("Network or parsing error on booking:", err);
    if (err instanceof Error) {
        throw err;
    }
    throw new Error("An unexpected error occurred during booking.");
  }
};
