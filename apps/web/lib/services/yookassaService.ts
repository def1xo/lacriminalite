import fetch from 'node-fetch';

const YOO_SHOP_ID = process.env.YOOKASSA_SHOP_ID || '';
const YOO_SECRET = process.env.YOOKASSA_SECRET || '';
const YOO_API = 'https://api.yookassa.ru/v3/payments';

function basicAuthHeader() {
  const token = Buffer.from(`${YOO_SHOP_ID}:${YOO_SECRET}`).toString('base64');
  return `Basic ${token}`;
}

export async function createPayment(amount: number, orderNumber: string, returnUrl: string) {
  const body = {
    amount: { value: (amount / 1).toFixed(2), currency: 'RUB' },
    confirmation: { type: 'redirect', return_url: returnUrl },
    capture: true,
    description: `Order ${orderNumber}`,
    metadata: { orderNumber }
  };
  const res = await fetch(YOO_API, {
    method: 'POST',
    headers: {
      Authorization: basicAuthHeader(),
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(body)
  });
  const json = await res.json();
  if (!res.ok) {
    const err = new Error('YooKassa createPayment failed');
    (err as any).payload = json;
    throw err;
  }
  return json;
}

import crypto from 'crypto';

export function verifyYooWebhook(rawBody: Buffer, headerValue: string, secret: string) {
  const h = crypto.createHmac('sha256', secret).update(rawBody).digest();
  const hex = h.toString('hex');
  const b64 = h.toString('base64');
  const normalized = headerValue.replace(/^(signature=)?/, '').trim();
  if (normalized === hex) return true;
  if (normalized === b64) return true;
  if (normalized === `sha256=${hex}`) return true;
  if (normalized === `sha256=${b64}`) return true;
  return false;
} 
