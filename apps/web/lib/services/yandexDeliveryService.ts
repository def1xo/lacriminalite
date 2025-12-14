// apps/web/lib/services/yandexDeliveryService.ts
import fetch from 'node-fetch';

const YANDEX_BASE = process.env.YANDEX_DELIVERY_BASE || 'https://b2b.taxi.yandex.net';
const YANDEX_TOKEN = process.env.YANDEX_DELIVERY_TOKEN;

/**
 * Create claim (order) in Yandex Delivery
 * order - object with recipient, items, address, tariff info
 */
export async function createYandexClaim(order: any) {
  if (!YANDEX_TOKEN) throw new Error('YANDEX_DELIVERY_TOKEN not set');

  const payload = {
    // See Yandex Delivery docs: claims/create body
    // We'll send minimal required fields; expand per your use-case.
    external_id: order.orderNumber,
    route: [
      {
        point: {
          type: 'source',
          contact: {
            name: process.env.SENDER_NAME || 'La Criminalite',
            phone: process.env.SENDER_PHONE || '',
          },
          address: {
            formatted_address: process.env.SENDER_ADDRESS || '',
          },
        },
      },
      {
        point: {
          type: 'destination',
          contact: {
            name: order.fullName,
            phone: order.phone,
          },
          address: {
            formatted_address: order.address,
          },
        },
      },
    ],
    // additional fields: parcels, items, etc.
  };

  const res = await fetch(`${YANDEX_BASE}/api/v2/claims`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${YANDEX_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error('Yandex create claim failed: ' + JSON.stringify(json));
  }

  return {
    claimId: json.id || null,
    raw: json,
  };
}
