// netlify/functions/getVendors.js

export async function handler(event) {
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = process.env;

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: "Airtable credentials are not configured. Please contact the administrator." }),
    };
  }

  try {
    const q = event.queryStringParameters || {};
    const service = (q.service || "").toLowerCase();
    const area = (q.area || "").toLowerCase();

    if (!service || !area) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: "Service and area are required." }),
      };
    }
    
    // Using LOWER() makes the filter case-insensitive
    const filterByFormula = `AND(LOWER({service}) = "${service}", LOWER({area}) = "${area}")`;
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula=${encodeURIComponent(filterByFormula)}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Airtable API Error:', response.status, errorBody);
      throw new Error('Failed to fetch data from Airtable.');
    }

    const data = await response.json();
    
    const items = data.records.map(record => ({
      id: record.id,
      name: record.fields.name || 'N/A',
      service: record.fields.service || 'N/A',
      area: record.fields.area || 'N/A',
      phone: record.fields.phone || 'N/A',
      verified: record.fields.verified || false,
      rating: record.fields.rating || 0,
      rates: record.fields.rates || 'N/A',
      photos: record.fields.photos ? record.fields.photos.map(p => p.url) : ['https://placehold.co/100x100'],
      description: record.fields.description || '',
    }));
    
    // Sort: verified first then rating desc
    items.sort((a,b) => {
      if (a.verified === b.verified) return (b.rating||0)-(a.rating||0);
      return a.verified ? -1 : 1;
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true, items }),
    };

  } catch (err) {
    console.error("Function Error:", err);
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: err.message }) };
  }
}
