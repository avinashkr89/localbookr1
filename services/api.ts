import type { Vendor, BookingPayload, SearchParams } from '../types';

export const getVendors = async (params: SearchParams): Promise<Vendor[]> => {
  console.log('Fetching vendors from API for:', params);
  const q = `service=${encodeURIComponent(params.service || "")}&area=${encodeURIComponent(params.area || "")}`;
  
  try {
    const response = await fetch(`/.netlify/functions/getVendors?${q}`);
    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Failed to fetch vendors:', response.status, errorBody);
        throw new Error('Failed to fetch vendors');
    }
    const j = await response.json();
    if (!j.ok) {
        console.error('API Error:', j.error);
        throw new Error(j.error || 'API returned an error');
    }
    return j.items || [];
  } catch(err) {
    console.error("Network or parsing error:", err);
    throw err;
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
    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Failed to create booking:', response.status, errorBody);
        throw new Error('Failed to create booking');
    }
    const result = await response.json();
    if (!result.ok) {
        console.error('API Error on booking:', result.error);
        throw new Error(result.error || 'API returned an error during booking');
    }
    return result;
  } catch(err) {
    console.error("Network or parsing error on booking:", err);
    throw err;
  }
};
