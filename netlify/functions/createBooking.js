// netlify/functions/createBooking.js

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_BOOKINGS_TABLE_NAME } = process.env;

  // If Airtable is not configured, return a mock success response
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_BOOKINGS_TABLE_NAME) {
    console.warn("Airtable credentials for booking not found. Simulating booking success.");
    const body = JSON.parse(event.body || "{}");
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
          ok: true, 
          record: { 
              id: `mock_booking_${Date.now()}`, 
              fields: { "Customer Name": body.name }
          },
          usingMockData: true 
      }),
    };
  }

  // --- Proceed with Airtable booking if credentials exist ---
  try {
    const body = JSON.parse(event.body || "{}");
    const { vendorId, name, phone, email, address, datetime, notes, payLater } = body;

    if (!vendorId || !name || !phone || !datetime) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: "Missing required booking details." }) };
    }
    
    const airtablePayload = {
      records: [{
        fields: {
          "Vendor": [vendorId],
          "Customer Name": name,
          "Customer Phone": phone,
          "Datetime": datetime,
          "Email": email,
          "Address": address,
          "Notes": notes,
          "Pay Later": payLater,
          "Status": "Pending"
        }
      }]
    };
    
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_BOOKINGS_TABLE_NAME}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(airtablePayload),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error('Airtable API Error on create:', response.status, errorBody);
      const message = errorBody.error?.message || 'Failed to create booking in Airtable.';
      return { statusCode: response.status, body: JSON.stringify({ ok: false, error: message }) };
    }

    const result = await response.json();
    const record = result.records && result.records[0];

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true, record }),
    };

  } catch (err) {
    console.error("Function Error:", err);
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: err.message }) };
  }
}
