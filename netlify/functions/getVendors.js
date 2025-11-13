// netlify/functions/getVendors.js
import fetch from "node-fetch";

export async function handler(event) {
  try {
    const q = event.queryStringParameters || {};
    const service = (q.service || "").toLowerCase();
    const area = (q.area || "").toLowerCase();

    const AIRTABLE_BASE = process.env.AIRTABLE_BASE;
    const AIRTABLE_KEY = process.env.AIRTABLE_KEY;
    const tableName = "Vendors";

    if (!AIRTABLE_BASE || !AIRTABLE_KEY) {
      return { statusCode: 500, body: JSON.stringify({ ok:false, error: "Airtable environment variables not set." }) };
    }

    // Build Airtable URL (first page)
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(tableName)}?pageSize=100`;
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_KEY}` }
    });
    const data = await resp.json();

    if (!resp.ok) {
      console.error("Airtable API Error:", data);
      return { statusCode: resp.status, body: JSON.stringify({ ok: false, error: "Failed to fetch from Airtable.", details: data }) };
    }

    const records = data.records || [];

    // Filter locally by service & area (case-insensitive contains)
    const filtered = records.filter(r => {
      const f = r.fields || {};
      const svc = (f.Service || "").toString().toLowerCase();
      const ar = (f.Area || "").toString().toLowerCase();
      // Use includes for partial matching on area
      return (!service || svc.includes(service)) && (!area || ar.includes(area));
    });

    const items = filtered.map(r => ({
      id: r.id,
      name: r.fields.Name || "",
      service: r.fields.Service || "",
      area: r.fields.Area || "",
      phone: r.fields.Phone || "",
      verified: !!r.fields.Verified,
      rating: r.fields.Rating || 4.5,
      rates: r.fields.Rates || "",
      description: r.fields.Description || "",
      photos: (r.fields.Photos || []).map(p => p.url)
    }));

    // Sort: verified first then rating desc
    items.sort((a,b) => {
      if (a.verified === b.verified) return (b.rating||0)-(a.rating||0);
      return a.verified ? -1 : 1;
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true, items })
    };
  } catch (err) {
    console.error("Function Error:", err);
    return { statusCode: 500, body: JSON.stringify({ ok:false, error: err.message }) };
  }
}
