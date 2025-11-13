// netlify/functions/createBooking.js
import fetch from "node-fetch";

export async function handler(event) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const body = JSON.parse(event.body || "{}");
    const { vendorId, name, phone, email, address, datetime, notes, payLater } = body;

    if(!vendorId || !name || !phone) {
      return { statusCode:400, body: JSON.stringify({ ok:false, error: "Missing required fields: vendorId, name, phone" }) };
    }

    const AIRTABLE_BASE = process.env.AIRTABLE_BASE;
    const AIRTABLE_KEY = process.env.AIRTABLE_KEY;
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/Bookings`;

    if (!AIRTABLE_BASE || !AIRTABLE_KEY) {
      return { statusCode: 500, body: JSON.stringify({ ok:false, error: "Airtable environment variables not set." }) };
    }

    const payload = {
      records: [{
        fields: {
          "Customer Name": name,
          "Customer Phone": phone,
          "Customer Email": email || "",
          "Address": address || "",
          "Vendor": [ vendorId ],
          "Datetime": datetime || null,
          "Notes": notes || "",
          "Pay Later": payLater ? true : false,
          "Status": "pending"
        }
      }]
    };

    const resp = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${AIRTABLE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await resp.json();

    if (!resp.ok) {
      console.error("Airtable API Error:", data);
      return { statusCode: resp.status, body: JSON.stringify({ ok: false, error: "Failed to create booking in Airtable.", details: data }) };
    }

    return { 
      statusCode: 200, 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok:true, record: data.records[0] }) 
    };
  } catch (err) {
    console.error("Function Error:", err);
    return { statusCode: 500, body: JSON.stringify({ ok:false, error: err.message }) };
  }
}
