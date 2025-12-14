// apps/web/lib/services/sdekService.ts
import fetch from 'node-fetch';

const SDEK_API_BASE = process.env.SDEK_API_BASE || 'https://api.cdek.ru'; // уточни по договору
const SDEK_TOKEN = process.env.SDEK_API_TOKEN;
const SDEK_LOGIN = process.env.SDEK_LOGIN;
const SDEK_PASSWORD = process.env.SDEK_PASSWORD;

/**
 * Create shipment in CDEK
 * order - object with recipient, items, address, weight, tariff_code, etc.
 */
export async function createCdekShipment(order: any) {
  // Build payload: depends on chosen SDEK API (4PL vs old)
  const payload: any = {
    // Minimal example for 4PL / business API (adjust fields per your account)
    sender: {
      // fill from env/account
    },
    recipient: {
      name: order.fullName,
      phone: order.phone,
      email: order.email,
      address: {
        region: order.addressRegion,
        address: order.addressLine,
        index: order.postalCode,
        city: order.city,
      },
    },
    items: (order.items || []).map((it: any, idx: number) => ({
      name: it.title,
      ware_md5: undefined,
      payment: it.price,
      weight: it.weight || 1000,
      quantity: it.quantity || 1,
    })),
    // tariff, services, etc.
  };

  const headers: any = { 'Content-Type': 'application/json' };
  if (SDEK_TOKEN) {
    headers.Authorization = `Bearer ${SDEK_TOKEN}`;
  } else if (SDEK_LOGIN && SDEK_PASSWORD) {
    headers.Authorization = 'Basic ' + Buffer.from(`${SDEK_LOGIN}:${SDEK_PASSWORD}`).toString('base64');
  }

  const res = await fetch(`${SDEK_API_BASE}/orders` /* example endpoint: check your SDEK doc */, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) throw new Error('SDEK create error: ' + JSON.stringify(json));

  // Response may include cdek_number (tracking) or uuid — return what exists
  return {
    uuid: json.uuid || json.order?.uuid,
    cdekNumber: json.cdek_number || json.order?.cdek_number || null,
    raw: json,
  };
}
