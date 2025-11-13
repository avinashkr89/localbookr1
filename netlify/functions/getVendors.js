// netlify/functions/getVendors.js

const mockVendors = [
  // Plumbers in Rohini Sector 7
  {
    id: 'rec_mock_1',
    name: 'Gupta Plumbing Services',
    service: 'plumber',
    area: 'rohini sector 7',
    phone: '+919876543210',
    verified: true,
    rating: 4.8,
    rates: '₹300 visiting charge',
    photos: ['https://images.pexels.com/photos/4239014/pexels-photo-4239014.jpeg?auto=compress&cs=tinysrgb&w=600'],
    description: 'Expert in all types of residential and commercial plumbing. Leakages, new fittings, and emergency services available 24/7.'
  },
  {
    id: 'rec_mock_2',
    name: 'Rohini Water Works',
    service: 'plumber',
    area: 'rohini sector 7',
    phone: '+919876543211',
    verified: false,
    rating: 4.5,
    rates: 'Starting from ₹250',
    photos: ['https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg?auto=compress&cs=tinysrgb&w=600'],
    description: 'Quick and reliable plumbing solutions for your home. We handle everything from leaky faucets to major pipe installations.'
  },
  // Tailors in Rohini Sector 7
  {
    id: 'rec_mock_3',
    name: 'Classic Tailors',
    service: 'tailor',
    area: 'rohini sector 7',
    phone: '+919876543212',
    verified: true,
    rating: 4.9,
    rates: 'Suits from ₹5000, Shirts from ₹800',
    photos: ['https://images.pexels.com/photos/7139722/pexels-photo-7139722.jpeg?auto=compress&cs=tinysrgb&w=600'],
    description: 'Bespoke tailoring for men and women. We specialize in formal wear, wedding attire, and alterations with a perfect fit guarantee.'
  },
  // Electricians in a different area, e.g., 'pitampura'
  {
    id: 'rec_mock_4',
    name: 'Spark Electricals',
    service: 'electrician',
    area: 'pitampura',
    phone: '+919876543213',
    verified: true,
    rating: 4.7,
    rates: '₹400 inspection fee',
    photos: ['https://images.pexels.com/photos/577210/pexels-photo-577210.jpeg?auto=compress&cs=tinysrgb&w=600'],
    description: 'Licensed electricians for all your wiring, fixture installation, and repair needs. Safety is our top priority.'
  },
  // Carpenters in Pitampura
  {
    id: 'rec_mock_5',
    name: 'Fine Wood Crafters',
    service: 'carpenter',
    area: 'pitampura',
    phone: '+919876543214',
    verified: false,
    rating: 4.6,
    rates: 'Custom furniture quotes available',
    photos: ['https://images.pexels.com/photos/1227520/pexels-photo-1227520.jpeg?auto=compress&cs=tinysrgb&w=600'],
    description: 'Custom furniture, repairs, and modular kitchen installations. High-quality craftsmanship with modern designs.'
  },
  // AC Repair in Rohini Sector 7
  {
    id: 'rec_mock_6',
    name: 'Cool Breeze AC Service',
    service: 'ac repair',
    area: 'rohini sector 7',
    phone: '+919876543215',
    verified: true,
    rating: 4.9,
    rates: 'Service charge ₹499',
    photos: ['https://images.pexels.com/photos/713297/pexels-photo-713297.jpeg?auto=compress&cs=tinysrgb&w=600'],
    description: 'Fast and efficient AC repair, installation, and gas charging for all brands. Beat the heat with our expert services.'
  }
];

export async function handler(event) {
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = process.env;

  const q = event.queryStringParameters || {};
  const service = (q.service || "").toLowerCase();
  const area = (q.area || "").toLowerCase();

  // If Airtable is not configured, use mock data
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME) {
    console.warn("Airtable credentials not found. Serving mock data.");
    
    if (!service || !area) {
        return {
          statusCode: 400,
          body: JSON.stringify({ ok: false, error: "Service and area are required." }),
        };
    }
      
    const filteredItems = mockVendors.filter(vendor => 
        vendor.service === service && vendor.area.includes(area)
    );
      
    filteredItems.sort((a,b) => {
      if (a.verified === b.verified) return (b.rating||0)-(a.rating||0);
      return a.verified ? -1 : 1;
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true, items: filteredItems, usingMockData: true }),
    };
  }

  // --- Proceed with Airtable fetch if credentials exist ---
  try {
    if (!service || !area) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: "Service and area are required." }),
      };
    }
    
    // Use FIND for partial area matching
    const filterByFormula = `AND(LOWER({service}) = "${service}", FIND(LOWER("${area}"), LOWER({area})))`;
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula=${encodeURIComponent(filterByFormula)}`;

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Airtable API Error:', response.status, errorBody);
      try {
        const parsedError = JSON.parse(errorBody);
        const message = parsedError?.error?.message || 'Failed to fetch data from Airtable.';
        return { statusCode: response.status, body: JSON.stringify({ ok: false, error: message }) };
      } catch (e) {
        return { statusCode: response.status, body: JSON.stringify({ ok: false, error: 'Failed to fetch data from Airtable.' }) };
      }
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
