// netlify/functions/createBooking.js

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_BOOKINGS_TABLE_NAME } = process.env;

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_BOOKINGS_TABLE_NAME) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: "Airtable credentials for booking are not configured. Please contact the administrator." }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { vendorId, name, phone, email, address, datetime, notes, payLater } = body;

    if (!vendorId || !name || !phone || !datetime) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: "Missing required booking details." }) };
    }
    
    // vendorId from the client is the Airtable record ID for the vendor.
    // In Airtable, linked records are represented as an array of record IDs.
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
          "Status": "Pending" // Default status
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
      throw new Error(errorBody.error?.message || 'Failed to create booking in Airtable.');
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
