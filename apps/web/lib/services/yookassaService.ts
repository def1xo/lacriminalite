const YOO_SHOP_ID = process.env.YOOKASSA_SHOP_ID || '';
const YOO_SECRET = process.env.YOOKASSA_SECRET || '';
const YOO_API = 'https://api.yookassa.ru/v3/payments';

function authHeader() {
  return `Basic ${Buffer.from(`${YOO_SHOP_ID}:${YOO_SECRET}`).toString('base64')}`;
}

export async function createPayment(amount: number, orderNumber: string, returnUrl: string) {
  const body = {
    amount: { value: (Number(amount) / 1).toFixed(2), currency: 'RUB' },
    confirmation: { type: 'redirect', return_url: returnUrl },
    capture: true,
    description: `Order ${orderNumber}`,
    metadata: { orderNumber }
  };
  const res = await fetch(YOO_API, {
    method: 'POST',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const json = await res.json();
  if (!res.ok) throw new Error('YooKassa create payment failed: ' + JSON.stringify(json));
  return json;
}
